-- SmartWaste Dispatch v22: anonymous read-only access to safe public bin data.
-- Apply AFTER 005_security_hardening.sql.
-- This exposes only public map fields. It does NOT grant anon access to the
-- underlying bins table, profiles, assignments, staff invitations or history.

begin;

create or replace view public.public_bins
with (security_barrier = true)
as
select
  id,
  name,
  address,
  lat,
  lng,
  fill,
  status,
  updated_at
from public.bins;

-- Supabase SQL Editor runs as the database owner. Keep the view owner as the
-- trusted database owner so the view can read the RLS-protected base table,
-- while callers receive only the explicitly selected columns above.
alter view public.public_bins owner to postgres;

revoke all on public.public_bins from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.public_bins to anon, authenticated;

-- Explicitly keep anonymous access off the underlying operational table.
revoke all on public.bins from anon;

comment on view public.public_bins is
  'Safe read-only map projection for anonymous public bin discovery; do not add private columns.';

commit;
