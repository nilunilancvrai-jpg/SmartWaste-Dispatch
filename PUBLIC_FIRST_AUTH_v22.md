# SmartWaste Dispatch v22 — public-first access

## User experience
- `index.html` opens directly to the public map without requiring login.
- Public bin map data is loaded from `public.public_bins`, a read-only projection.
- The Profile button requires Google OAuth verification as a public user; successful sign-in returns to `profile.html`.
- Medium collection booking requires Google OAuth verification on a public profile and resumes the booking form after login.
- Worker and Supervisor pages retain their role guards and invitation-based authorization.

## Database migration
Apply `smartwaste-dispatch/supabase/006_public_map_access.sql` after migration 005. It grants `anon` SELECT only on a view containing public map fields. It does not grant anonymous access to profiles, staff invitations, assignments, collection history, or waste requests, and it does not grant anonymous access to the underlying `bins` table.

## Validation
Run `node --check` on the changed JavaScript files and inspect the SQL migration. Browser/OAuth and live Supabase behavior must still be tested in the user's project after applying migration 006.
