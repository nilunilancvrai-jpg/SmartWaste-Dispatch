# SmartWaste Dispatch v21 — Security hardening

## What changed in the code
- Public booking no longer sends `status` from the browser. The database default controls the initial status.
- Booking response now reads back `id`, `status`, and `created_at`.
- Added `supabase/005_security_hardening.sql`.

## What the database migration enforces
- Resets RLS policies on `profiles`, `staff_invites`, `bins`, `assignments`, `collection_history`, and `waste_requests` to the exact policies in this migration. This prevents an older permissive policy from remaining OR-combined with the hardened policy.
- Browser roles cannot directly write profiles, staff invites, bins, assignments, or collection history.
- Authenticated users can only read their own profile, assignments, collection history and waste requests; supervisors can read the operational records needed by the supervisor dashboard.
- Public waste-request creation is limited to the authenticated user's own Medium waste collection request.
- Browser users cannot set initial request status or `updated_at`; the database default keeps status at `pending`.
- Only supervisors can update request status.
- Security-definer functions use an empty search path and fully-qualified application table names.
- RPC execution is revoked from PUBLIC/anon and granted only to authenticated users, with role checks inside each RPC.
- Worker task status transitions are forward-only.
- Collection completion retains server-side coordinate-range, GPS-accuracy, ownership, distance and atomic history/reset checks.

## Required manual step — not performed automatically
The SQL migration has NOT been run against the user's live Supabase project. The project owner must:
1. Open Supabase Dashboard → SQL Editor.
2. Open `smartwaste-dispatch/supabase/005_security_hardening.sql` from this ZIP.
3. Review the warning at the top, especially if custom policies were added to the six named tables.
4. Run the complete SQL file.
5. Confirm it completes without errors.
6. Run the policy verification query commented at the bottom of the migration.

## Important limitations
- This is application-level database hardening, not a formal penetration test.
- Browser GPS can still be spoofed; server-side distance checks validate submitted coordinates, not a trusted hardware attestation.
- Supervisors are still provisioned through a privileged Supabase SQL Editor bootstrap action; never expose database-owner credentials to browser users.
- Use Supabase Auth email confirmation, strong passwords, HTTPS, Google OAuth redirect allowlists, and MFA for supervisors where available.
- Keep the service-role key out of frontend files and GitHub.
