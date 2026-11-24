# SmartWaste Dispatch — end-to-end setup

## What is included
- Supabase Auth: email/password and Google OAuth.
- Server-side role assignment: public by default; workers are invited by a supervisor; supervisors are bootstrapped only through the Supabase SQL Editor.
- RLS-protected profiles, bins, assignments and collection history.
- Atomic RPCs for assigning tasks and completing collections.
- Role guards on the Public, Worker and Supervisor pages.
- Shared Supabase data instead of browser-only LocalStorage for operational data.

## 1. Configure Supabase database
The original schema (`smartwaste-dispatch/supabase/001_smartwaste_schema.sql`) creates the five core tables and role/RPC policies. The project history indicates these tables already exist in your Supabase project. **Do not rerun the initial schema blindly against a live database.**

1. Confirm `profiles`, `staff_invites`, `bins`, `assignments`, and `collection_history` exist.
2. Review `smartwaste-dispatch/supabase/002_collection_distance_guard.sql`.
3. Run that migration in Supabase SQL Editor. It replaces only the collection-completion function and does not drop tables or records.
4. Verify the function was created successfully before testing collection.

## 2. Bootstrap the first supervisor (required once)
1. Sign up or sign in with the email account that should be the first supervisor.
2. In Supabase → SQL Editor, run the following, replacing the email with the exact verified account email:

```sql
update public.profiles
set role = 'supervisor', updated_at = now()
where lower(email) = lower('YOUR_SUPERVISOR_EMAIL@example.com');
```

3. Confirm exactly one profile row was updated. Do not expose SQL Editor or database credentials to normal users. This bootstrap is a privileged administrator action.
4. Sign out and sign in again so the app reloads the role.

## 3. Supabase Auth configuration
In Authentication → URL Configuration:
- Site URL: `http://127.0.0.1:5500/smartwaste-dispatch/login.html` (for your current Live Server folder layout).
- Redirect URLs: add `http://127.0.0.1:5500/smartwaste-dispatch/**` and `http://localhost:5500/smartwaste-dispatch/**`.
- Keep your provider callback URL in Google Cloud exactly as Supabase displays it (`https://<project-ref>.supabase.co/auth/v1/callback`).

In Authentication → Sign In / Providers:
- Enable Email and Google.
- For Google OAuth, the Google Cloud OAuth client must contain the Supabase callback URL as an Authorized redirect URI.
- During Google OAuth consent-screen Testing, add each tester as a test user. Publish the consent screen before allowing general external users, if Google requires it.
- Email confirmation may be enabled. If enabled, users must click the confirmation email before first sign-in.

## 4. Frontend key
`smartwaste-dispatch/js/supabaseClient.js` uses the Supabase Project URL and publishable key. A publishable/anon key is designed to be public in browser code. NEVER put a `service_role` or secret key in this folder, HTML, JavaScript, or GitHub.

If you change the project, update `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `smartwaste-dispatch/js/supabaseClient.js`.

## 5. Public waste collection booking migration
The Public dashboard supports Small, Medium and Large waste flows. Medium waste can submit a collection request to `public.waste_requests`. Large waste offers nearby mapped locations/directions only; driver and pickup booking choices have been removed. Before testing those booking actions, run `smartwaste-dispatch/supabase/003_public_waste_requests.sql` in Supabase SQL Editor. This is an additive migration; it creates a new table and policies without dropping existing data. It also adds `gps_accuracy_m` and `maps_url` columns if the table already exists from the previous v14 migration. Re-running the updated file is safe for those columns and policies. Small and Large waste offer nearby-location directions. Medium waste offers directions or a collection request.

## 6. Nearby bin data and optional demo seed
The Public map recommends only Supabase bins with `status='available'`, `fill < 80`, valid coordinates, and distance within 5 km. When no live-capacity bin qualifies, it looks up OpenStreetMap `amenity=waste_basket` and `amenity=waste_disposal` features within 5 km. OpenStreetMap does not provide verified fill levels, so those are shown as capacity unknown and are not recommended as confirmed available bins.

If `public.bins` is empty and you want a demonstration, optionally run `smartwaste-dispatch/supabase/004_optional_demo_bins.sql`. It inserts clearly labelled DEMO locations only when the table is empty. Do not treat demo coordinates as real public infrastructure.

## 7. Run locally
1. Extract the ZIP.
2. In VS Code, open the `SmartWaste-Dispatch` folder.
3. Open `smartwaste-dispatch/login.html` with Live Server. The expected local URL is `http://127.0.0.1:5500/smartwaste-dispatch/login.html` if Live Server is serving the parent folder.
4. Create a normal account: it receives the `public` role automatically.
5. Sign in as the bootstrap supervisor, open `smartwaste-dispatch/supervisor.html`, invite worker emails, then ask each worker to register/sign in using that same email.
6. Worker role is assigned from the invite, never from a role dropdown.

## 8. App routes
- `login.html`: sign-in, public registration, Google OAuth, password reset.
- `index.html`: waste-size selection, action choices, public bin map and medium/large collection requests (public role only).
- `dashboard.html`: worker collection dashboard (worker role only).
- `supervisor.html`: supervisor operations (supervisor role only).

A worker/supervisor email is not a public account. A user without a staff invite receives the public role. If an existing public user is invited by a supervisor, their role is promoted to worker by the trusted RPC.

## 9. Operational notes and limitations
- Any DEMO bin coordinates around Kundalahalli / AECS Layout / Whitefield are sample coordinates, not verified municipal bin locations. OpenStreetMap nearby waste features may also be incomplete and do not contain live capacity readings.
- Browser GPS and reported accuracy can be spoofed. The collection RPC records the reported coordinates and checks the reported accuracy, but this is not tamper-proof proof of physical collection. A trusted device, signed sensor or field verification process is needed for production-grade proof.
- The OpenStreetMap tile and public OSRM routing services have usage policies and are not a guaranteed production routing backend. Use a suitable hosted routing provider or self-hosted routing service for production traffic.
- The app is a static frontend and does not need a custom Node server. Supabase provides the managed backend. Use HTTPS in production.
- Test with separate accounts and browser profiles: one public, one worker, one supervisor. Verify direct URL access is denied when roles do not match.

## 10. UI/UX and feature notes
- The refreshed interface uses a restrained forest-green identity, light operational surfaces, clear hierarchy and responsive layouts.
- The public experience is intentionally focused on one nearest suitable bin; the previous unconnected Smart Disposal / home-pickup mock workflow is not presented as a working feature.
- The supplied Stitch references contain illustrative values and locations. Those values are visual references only; this application uses the actual Supabase bin records.

## 11. Troubleshooting
- `Invalid login credentials`: account/password mismatch or email not confirmed.
- `Email not confirmed`: open the Supabase confirmation email.
- OAuth returns to a directory listing: ensure the redirect URL in `login.js` resolves to the actual `login.html` path and is present in Supabase Redirect URLs. Start Live Server from the parent folder if using the documented path.
- `Profile not found`: rerun the schema/backfill SQL and inspect `public.profiles` for the auth user.
- Worker does not appear: invite the exact email from the supervisor account; then worker signs in using that email.
- Supervisor page denied: bootstrap the intended email using the SQL statement above, then sign out/in.
