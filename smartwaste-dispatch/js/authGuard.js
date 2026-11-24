// Secure role guard with session recovery. Temporary profile/network failures
// must never sign the user out or redirect them to login.
(function () {
  const supabase = window.smartWasteSupabase;
  const requiredRole = document.body.dataset.requiredRole;
  let redirecting = false;
  let checking = false;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function goLogin() {
    if (redirecting) return;
    redirecting = true;
    location.replace(new URL('login.html', window.location.href).href);
  }

  function showProfileError(error) {
    console.error('SmartWaste authentication check:', error);
    document.documentElement.style.visibility = 'visible';
    let panel = document.getElementById('authGuardError');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'authGuardError';
      panel.style.cssText = 'position:fixed;z-index:99999;inset:0;display:grid;place-content:center;gap:12px;padding:24px;background:#0b1510;color:#e8f2e9;text-align:center;font:14px DM Sans,sans-serif';
      panel.innerHTML = '<strong style="font-size:20px">We could not verify your session</strong><p id="authGuardErrorText" style="max-width:460px;color:#a9b9ad;line-height:1.6"></p><button id="authGuardRetry" style="padding:12px 18px;border:0;border-radius:10px;background:#21b879;color:#062416;font-weight:700;cursor:pointer">Try again</button><button id="authGuardLogin" style="padding:10px;border:1px solid #385341;border-radius:10px;background:transparent;color:#dcebe0;cursor:pointer">Return to sign in</button>';
      document.body.appendChild(panel);
      panel.querySelector('#authGuardRetry').addEventListener('click', async () => {
        panel.remove();
        document.documentElement.style.visibility = 'hidden';
        await protectPage(true);
      });
      panel.querySelector('#authGuardLogin').addEventListener('click', goLogin);
    }
    panel.querySelector('#authGuardErrorText').textContent =
      error?.message || 'A temporary connection problem stopped account verification. Your session has not been deliberately cleared.';
  }

  async function readSession() {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await supabase.auth.getSession();
        if (result.error) throw result.error;
        if (result.data?.session) return result.data.session;
        if (attempt === 1) {
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.error) throw refreshed.error;
          if (refreshed.data?.session) return refreshed.data.session;
        }
      } catch (error) {
        lastError = error;
      }
      if (attempt < 2) await wait(700 * (attempt + 1));
    }
    if (lastError) throw lastError;
    return null;
  }

  async function readProfile(userId) {
    let lastError = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const { data, error } = await supabase.from('profiles')
          .select('id,email,full_name,role')
          .eq('id', userId)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
        lastError = new Error('Your SmartWaste profile row was not found. Check the profiles table and auth-user trigger.');
      } catch (error) {
        lastError = error;
      }
      if (attempt < 3) await wait(600 * (attempt + 1));
    }
    throw lastError || new Error('Profile verification failed.');
  }

  async function protectPage(isRetry = false) {
    if (checking) return;
    checking = true;
    try {
      if (!supabase) throw new Error('Supabase did not initialize. Check your internet connection and js/supabaseClient.js.');
      const session = await readSession();
      if (!session) {
        // Allow Supabase's persisted session listener and refresh-token storage to settle.
        await wait(1000);
        const secondTry = await supabase.auth.getSession();
        if (!secondTry.error && secondTry.data?.session) {
          return await finishAuthorization(secondTry.data.session);
        }
        goLogin();
        return;
      }
      await finishAuthorization(session);
    } catch (error) {
      showProfileError(error);
    } finally {
      checking = false;
    }
  }

  async function finishAuthorization(session) {
    const profile = await readProfile(session.user.id);
    if (!['public','worker','supervisor'].includes(profile.role)) {
      throw new Error('Your account has no valid SmartWaste role. Ask the supervisor to check your profile.');
    }
    if (profile.role !== requiredRole) {
      const destination = profile.role === 'supervisor' ? 'supervisor.html' :
        profile.role === 'worker' ? 'dashboard.html' : 'index.html';
      location.replace(new URL(destination, window.location.href).href);
      return;
    }

    window.SmartWaste = window.SmartWaste || {};
    window.SmartWaste.currentUser = session.user;
    window.SmartWaste.currentProfile = profile;
    document.documentElement.style.visibility = 'visible';
    document.dispatchEvent(new Event('smartwaste:authorized'));

    const header = document.querySelector('header');
    if (header && !document.getElementById('smartWasteLogout')) {
      const button = document.createElement('button');
      button.id = 'smartWasteLogout';
      button.type = 'button';
      button.textContent = 'Sign out';
      button.style.cssText = 'margin:8px;padding:9px 14px;border:1px solid #385341;border-radius:9px;background:#17251c;color:#dcebe0;cursor:pointer;font-weight:600;font:600 11px DM Sans,sans-serif';
      button.addEventListener('click', async () => {
        button.disabled = true;
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out failed:', error);
          alert(error.message);
          button.disabled = false;
          return;
        }
        goLogin();
      });
      header.appendChild(button);
    }
  }

  if (supabase?.auth?.onAuthStateChange) {
    supabase.auth.onAuthStateChange((event) => {
      // Token refresh/initial session events are normal and must not navigate away.
      if (event === 'SIGNED_OUT') goLogin();
    });
  }

  protectPage();
})();
