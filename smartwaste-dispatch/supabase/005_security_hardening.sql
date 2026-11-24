-- SmartWaste Dispatch v21: security hardening migration.
-- Apply AFTER 001_smartwaste_schema.sql, 002_collection_distance_guard.sql,
-- and 003_public_waste_requests.sql.
--
-- This migration is additive with respect to application data:
-- it does not drop tables or delete rows. It replaces policies on the
-- SmartWaste tables listed below so that older permissive policies cannot
-- accidentally remain active.
--
-- Run in Supabase Dashboard -> SQL Editor as the project database owner.
-- Review the policy reset section before applying if you added custom policies
-- to these same SmartWaste tables.

begin;

-- 1) Remove every existing policy on these application tables. PostgreSQL
-- combines permissive policies with OR, so leaving an old broad policy in
-- place can defeat a newly-added restrictive policy.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles','staff_invites','bins','assignments',
        'collection_history','waste_requests'
      )
  loop
    execute format('drop policy %I on %I.%I',
      p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- 2) Ensure RLS is enabled.
alter table public.profiles enable row level security;
alter table public.staff_invites enable row level security;
alter table public.bins enable row level security;
alter table public.assignments enable row level security;
alter table public.collection_history enable row level security;
alter table public.waste_requests enable row level security;

-- 3) Explicitly remove broad table privileges from browser roles.
-- Browser users receive only the minimum operations listed below.
revoke all privileges on table
  public.profiles,
  public.staff_invites,
  public.bins,
  public.assignments,
  public.collection_history,
  public.waste_requests
from public, anon, authenticated;

-- No browser role may directly create/modify roles, invitations, bins,
-- assignments or collection-history rows.
grant select on public.profiles to authenticated;
grant select on public.bins to authenticated;
grant select on public.assignments to authenticated;
grant select on public.collection_history to authenticated;

-- 4) Recreate the exact row-level policies.
create policy profiles_read_self_or_supervisor
on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or public.current_app_role() = 'supervisor'
);

create policy bins_read_authenticated
on public.bins
for select to authenticated
using (true);

create policy assignments_read_worker_or_supervisor
on public.assignments
for select to authenticated
using (
  worker_id = (select auth.uid())
  or public.current_app_role() = 'supervisor'
);

create policy history_read_worker_or_supervisor
on public.collection_history
for select to authenticated
using (
  worker_id = (select auth.uid())
  or public.current_app_role() = 'supervisor'
);

-- Users can only see their own requests; supervisors can see all requests.
create policy waste_requests_read_own_or_supervisor
on public.waste_requests
for select to authenticated
using (
  requester_id = (select auth.uid())
  or public.current_app_role() = 'supervisor'
);

-- Only medium-waste collection can be newly booked through this app.
-- The requester identity must match the authenticated JWT user.
-- The client cannot set status or updated_at because those columns are not
-- granted for INSERT below; status therefore remains the DB default 'pending'.
create policy waste_requests_insert_medium_own
on public.waste_requests
for insert to authenticated
with check (
  requester_id = (select auth.uid())
  and waste_size = 'medium'
  and service_type = 'Medium waste collection'
  and status = 'pending'
);

-- Only supervisors can update requests. Column privileges below further
-- restrict updates to status and updated_at.
create policy waste_requests_update_supervisor
on public.waste_requests
for update to authenticated
using (public.current_app_role() = 'supervisor')
with check (public.current_app_role() = 'supervisor');

-- 5) Column-level booking privileges. In particular, status, requester_id
-- and updated_at are not user-editable after INSERT; requester_id is still
-- supplied at insert and independently checked by RLS.
grant select on public.waste_requests to authenticated;
grant insert (
  requester_id,
  waste_size,
  service_type,
  pickup_address,
  notes,
  latitude,
  longitude,
  gps_accuracy_m,
  maps_url
) on public.waste_requests to authenticated;
grant update (status, updated_at) on public.waste_requests to authenticated;

-- Identity sequence: INSERT needs USAGE, not SELECT or UPDATE.
revoke all privileges on sequence public.waste_requests_id_seq from public, anon, authenticated;
grant usage on sequence public.waste_requests_id_seq to authenticated;

-- 6) Harden the role lookup helper. Empty search_path prevents object
-- shadowing by objects in writable schemas; all app objects are qualified.
create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
$function$;

-- Auth-user trigger: users default to public; only an exact supervisor-created
-- invitation can assign worker. Role is never read from user metadata.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  assigned_role text := 'public';
  normalized_email text;
begin
  normalized_email := lower(trim(new.email));

  select si.role
    into assigned_role
  from public.staff_invites as si
  where lower(si.email) = normalized_email;

  if assigned_role is null or assigned_role not in ('worker','supervisor') then
    assigned_role := 'public';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    normalized_email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), ''),
    assigned_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = now();

  delete from public.staff_invites
  where lower(email) = normalized_email;

  return new;
end
$function$;

-- Worker invitation: only an authenticated supervisor can call this RPC.
create or replace function public.invite_worker(p_email text, p_full_name text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  target_user auth.users%rowtype;
  normalized_email text;
begin
  if auth.uid() is null or public.current_app_role() <> 'supervisor' then
    raise exception 'Supervisor access required';
  end if;

  normalized_email := lower(trim(coalesce(p_email, '')));
  if length(normalized_email) < 6
     or length(normalized_email) > 254
     or normalized_email !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then
    raise exception 'Enter a valid email address';
  end if;

  select u.* into target_user
  from auth.users as u
  where lower(u.email) = normalized_email
  limit 1;

  if target_user.id is not null then
    if exists (
      select 1 from public.profiles as p
      where p.id = target_user.id and p.role = 'supervisor'
    ) then
      raise exception 'A supervisor account cannot be converted to a worker';
    end if;

    update public.profiles
    set role = 'worker',
        full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
        updated_at = now()
    where id = target_user.id;

    delete from public.staff_invites where lower(email) = normalized_email;
  else
    insert into public.staff_invites(email, role, invited_by, created_at)
    values (normalized_email, 'worker', auth.uid(), now())
    on conflict (email) do update
      set role = 'worker',
          invited_by = auth.uid(),
          created_at = now();
  end if;

  return jsonb_build_object(
    'success', true,
    'registered', (target_user.id is not null),
    'email', normalized_email
  );
end
$function$;

create or replace function public.assign_collection_task(p_bin_id bigint, p_worker_id uuid)
returns public.assignments
language plpgsql
security definer
set search_path = ''
as $function$
declare
  b public.bins%rowtype;
  w public.profiles%rowtype;
  a public.assignments%rowtype;
begin
  if auth.uid() is null or public.current_app_role() <> 'supervisor' then
    raise exception 'Supervisor access required';
  end if;

  select * into b from public.bins where id = p_bin_id for update;
  if b.id is null then raise exception 'Bin not found'; end if;
  if b.status <> 'available' or b.fill < 80 then
    raise exception 'This bin does not require collection';
  end if;

  select * into w
  from public.profiles
  where id = p_worker_id and role = 'worker';
  if w.id is null then raise exception 'Select an authorized worker'; end if;

  insert into public.assignments (bin_id, worker_id, assigned_by, status)
  values (p_bin_id, p_worker_id, auth.uid(), 'assigned')
  returning * into a;

  return a;
exception
  when unique_violation then
    raise exception 'This bin already has an active assignment';
end
$function$;

-- Enforce forward-only worker status transitions.
create or replace function public.set_worker_task_status(p_task_id uuid, p_status text)
returns public.assignments
language plpgsql
security definer
set search_path = ''
as $function$
declare
  a public.assignments%rowtype;
begin
  if auth.uid() is null or public.current_app_role() <> 'worker' then
    raise exception 'Worker access required';
  end if;

  if p_status not in ('on-the-way','collecting') then
    raise exception 'Invalid worker task status';
  end if;

  update public.assignments
  set status = p_status, updated_at = now()
  where id = p_task_id
    and worker_id = auth.uid()
    and (
      (status = 'assigned' and p_status = 'on-the-way')
      or (status = 'on-the-way' and p_status = 'collecting')
    )
  returning * into a;

  if a.id is null then
    raise exception 'Invalid task transition or task not assigned to you';
  end if;

  return a;
end
$function$;

-- Preserve the 10 m + <=10 m accuracy check, enforce task ownership and
-- one-time completion, and make history/bin reset/task completion atomic.
create or replace function public.complete_collection(
  p_task_id uuid,
  p_worker_lat double precision,
  p_worker_lng double precision,
  p_gps_accuracy_m double precision
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  a public.assignments%rowtype;
  b public.bins%rowtype;
  lat1 double precision;
  lat2 double precision;
  dlat double precision;
  dlng double precision;
  hav double precision;
  distance_m double precision;
begin
  if auth.uid() is null or public.current_app_role() <> 'worker' then
    raise exception 'Worker access required';
  end if;

  if p_gps_accuracy_m is null or p_gps_accuracy_m < 0 or p_gps_accuracy_m > 10 then
    raise exception 'GPS accuracy must be 10 metres or better';
  end if;

  if p_worker_lat is null or p_worker_lng is null
     or p_worker_lat not between -90 and 90
     or p_worker_lng not between -180 and 180 then
    raise exception 'Valid GPS coordinates are required';
  end if;

  select * into a
  from public.assignments
  where id = p_task_id
    and worker_id = auth.uid()
    and status in ('on-the-way','collecting')
  for update;

  if a.id is null then
    raise exception 'Active task not found. Mark the task on the way first.';
  end if;

  select * into b from public.bins where id = a.bin_id for update;
  if b.id is null or b.status <> 'available' or b.fill < 80 then
    raise exception 'Bin is no longer eligible for collection';
  end if;

  lat1 := radians(p_worker_lat);
  lat2 := radians(b.lat);
  dlat := radians(b.lat - p_worker_lat);
  dlng := radians(b.lng - p_worker_lng);
  hav := power(sin(dlat / 2), 2)
       + cos(lat1) * cos(lat2) * power(sin(dlng / 2), 2);
  hav := least(1.0, greatest(0.0, hav));
  distance_m := 2 * 6371000 * asin(sqrt(hav));

  if distance_m > 10 then
    raise exception 'You must be within 10 metres of the assigned bin';
  end if;

  insert into public.collection_history (
    bin_id, bin_name, worker_id, previous_fill,
    worker_lat, worker_lng, gps_accuracy_m
  ) values (
    b.id, b.name, auth.uid(), b.fill,
    p_worker_lat, p_worker_lng, p_gps_accuracy_m
  );

  update public.bins set fill = 0, updated_at = now() where id = b.id;
  update public.assignments
  set status = 'collected', updated_at = now(), completed_at = now()
  where id = a.id;

  return jsonb_build_object(
    'success', true,
    'bin_id', b.id,
    'previous_fill', b.fill,
    'reported_distance_m', round(distance_m::numeric, 2)
  );
end
$function$;

create or replace function public.supervisor_set_bin_status(p_bin_id bigint, p_status text)
returns public.bins
language plpgsql
security definer
set search_path = ''
as $function$
declare
  b public.bins%rowtype;
begin
  if auth.uid() is null or public.current_app_role() <> 'supervisor' then
    raise exception 'Supervisor access required';
  end if;

  if p_status not in ('available','out-of-service') then
    raise exception 'Invalid bin status';
  end if;

  update public.bins
  set status = p_status, updated_at = now()
  where id = p_bin_id
  returning * into b;

  if b.id is null then raise exception 'Bin not found'; end if;

  if p_status = 'out-of-service' then
    update public.assignments
    set status = 'cancelled', updated_at = now()
    where bin_id = p_bin_id
      and status not in ('collected','cancelled');
  end if;

  return b;
end
$function$;

-- 7) Remove default PUBLIC execution on security-definer functions. Only
-- authenticated users may call app RPCs; the helper is used by authenticated
-- RLS policies. The auth trigger function is trigger-only.
revoke all on function public.current_app_role() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.invite_worker(text,text) from public, anon, authenticated;
revoke all on function public.assign_collection_task(bigint,uuid) from public, anon, authenticated;
revoke all on function public.set_worker_task_status(uuid,text) from public, anon, authenticated;
revoke all on function public.complete_collection(uuid,double precision,double precision,double precision) from public, anon, authenticated;
revoke all on function public.supervisor_set_bin_status(bigint,text) from public, anon, authenticated;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.invite_worker(text,text) to authenticated;
grant execute on function public.assign_collection_task(bigint,uuid) to authenticated;
grant execute on function public.set_worker_task_status(uuid,text) to authenticated;
grant execute on function public.complete_collection(uuid,double precision,double precision,double precision) to authenticated;
grant execute on function public.supervisor_set_bin_status(bigint,text) to authenticated;

commit;

-- Post-migration sanity checks (run separately if desired):
-- select tablename, policyname, cmd, roles, qual, with_check
-- from pg_policies where schemaname='public'
--   and tablename in ('profiles','staff_invites','bins','assignments','collection_history','waste_requests')
-- order by tablename, policyname;
