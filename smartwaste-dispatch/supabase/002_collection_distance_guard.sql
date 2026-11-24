-- SmartWaste Dispatch: harden collection completion.
-- Apply AFTER 001_smartwaste_schema.sql. This migration does not drop tables or data.
-- Browser GPS can be spoofed; this enforces the submitted coordinates server-side,
-- but does not constitute tamper-proof proof of physical presence.

create or replace function public.complete_collection(
  p_task_id uuid,
  p_worker_lat double precision,
  p_worker_lng double precision,
  p_gps_accuracy_m double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
    raise exception 'Active task not found. Mark the task as on the way first.';
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

  insert into public.collection_history(
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
end;
$$;

revoke all on function public.complete_collection(uuid,double precision,double precision,double precision) from public;
grant execute on function public.complete_collection(uuid,double precision,double precision,double precision) to authenticated;
