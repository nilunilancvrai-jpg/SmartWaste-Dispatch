// Supabase browser client. Publishable keys are safe to expose; never use service_role here.
const SMARTWASTE_SUPABASE_URL = "https://ivwjaujoxxwbujhgrbxg.supabase.co";
const SMARTWASTE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_olofH-0ve_Q5UfRMLppl7g_u3WpcLp6";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
  throw new Error("Supabase JS SDK did not load. Check your internet connection.");
}
window.smartWasteSupabase = window.smartWasteSupabase || window.supabase.createClient(
  SMARTWASTE_SUPABASE_URL,
  SMARTWASTE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
