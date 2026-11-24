-- Optional demo seed: inserts sample bins ONLY if the bins table is empty.
-- These are demonstration coordinates, NOT verified municipal waste-bin locations.
-- Do not run this migration if you already have real bin records or do not want demo data.

insert into public.bins (name, address, lat, lng, fill, status)
select seed.name, seed.address, seed.lat, seed.lng, seed.fill, seed.status
from (values
  ('DEMO Bin Station 01','DEMO · Near Kundalahalli Main Road',12.9560,77.7160,35,'available'),
  ('DEMO Bin Station 02','DEMO · Near AECS Layout',12.9590,77.7130,65,'available'),
  ('DEMO Bin Station 03','DEMO · Near Whitefield Main Road',12.9690,77.7500,95,'available'),
  ('DEMO Bin Station 04','DEMO · Near Kundalahalli Bus Stop',12.9520,77.7200,20,'out-of-service')
) as seed(name,address,lat,lng,fill,status)
where not exists (select 1 from public.bins);

select setval(
  pg_get_serial_sequence('public.bins','id'),
  greatest((select coalesce(max(id),1) from public.bins),1)
);
