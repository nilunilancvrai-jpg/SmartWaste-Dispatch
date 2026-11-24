# SmartWaste Dispatch

Role-based waste discovery and collection coordination using HTML, CSS, vanilla JavaScript, Supabase and Leaflet.

## Run the application
1. Open this folder in VS Code.
2. Start Live Server from `smartwaste-dispatch/login.html`.
3. Sign in with a Public, Worker or Supervisor account.

## Main pages
- `smartwaste-dispatch/login.html` — authentication and registration.
- `smartwaste-dispatch/index.html` — Public waste selection, bin map and collection requests.
- `smartwaste-dispatch/dashboard.html` — Worker assignments with assigned-bin map, live worker GPS and walking route.
- `smartwaste-dispatch/supervisor.html` — Supervisor operations with a shared-data map of all registered bins and supervisor location.
- `smartwaste-dispatch/dashboard.html` — Worker assignments and collection workflow.
- `smartwaste-dispatch/supervisor.html` — bin, staff, assignment and operations management.

## Public waste flow
- Small: Get directions to a suitable public bin.
- Medium: Get directions or book waste collection.
- Large: Book a driver or book waste pickup.

Medium and Large booking actions require the additive migration `smartwaste-dispatch/supabase/003_public_waste_requests.sql`. Run it in the Supabase SQL Editor before testing booking. The booking form can request GPS permission and save pickup latitude, longitude, reported GPS accuracy and a Google Maps URL alongside the typed address. Requests are stored with `pending` status and are visible to the requester and supervisor under the migration's RLS policies.

## Project setup
Follow [`SETUP.md`](SETUP.md) for Supabase configuration, roles, local testing and operational limitations.

## Project structure
- `smartwaste-dispatch/` — application source.
- `smartwaste-dispatch/css/` — page styles.
- `smartwaste-dispatch/js/` — authentication, map, data and role workflows. `mapMarkers.js` supplies consistent 3D-style bin and person markers across all three dashboards.
- `smartwaste-dispatch/supabase/` — ordered SQL schema/migrations.
- `smartwaste-dispatch/data/` — demo data.
- `design-references/` — retained Stitch design references.
- `docs/` — project flow documentation.

## Important
Sample bin coordinates are demonstration data, not verified public infrastructure. Browser GPS and public tile/routing endpoints are not production-grade guarantees. Never expose a Supabase service-role key in frontend code.


### Map tiles
All three dashboards use the standard OpenStreetMap tile service and its required attribution. No CARTO API key is required. The public OSM tile service is rate-limited and intended for reasonable interactive use; for high-traffic production deployments, use a tile provider or self-hosted tile service that meets the deployment's usage needs.


### Nearby public waste locations
The Public map first recommends a Supabase bin only when its status is `available`, its fill reading is below 80%, and it is within 5 km. If no such live-capacity record exists, the map queries OpenStreetMap for nearby mapped `waste_basket` / `waste_disposal` features. Those OSM features are shown as **capacity unknown** and are never presented as verified available bins. OSM coverage is incomplete and these features may not exist for every neighbourhood.

If the Supabase `bins` table is empty and you want sample data for a demo, optionally run `smartwaste-dispatch/supabase/004_optional_demo_bins.sql`. It inserts clearly labelled DEMO records only when the table is empty. Do not use these sample coordinates as real municipal bin locations.


## Security hardening v21
See `SECURITY_HARDENING_v21.md`. Apply `smartwaste-dispatch/supabase/005_security_hardening.sql` in Supabase SQL Editor after migrations 001–003. The migration is not applied to the live database by creating this ZIP.


## v22 public-first access
See `PUBLIC_FIRST_AUTH_v22.md`. Apply `smartwaste-dispatch/supabase/006_public_map_access.sql` after the v21 security migration.
