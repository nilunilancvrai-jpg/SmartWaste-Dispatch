(() => {
  const auth = window.smartWasteSupabase;
  const form = document.getElementById('loginForm');
  const googleButton = document.getElementById('googleLoginBtn');
  const signupButton = document.getElementById('signupBtn');
  const forgotLink = document.getElementById('forgotPassword');
  const message = document.getElementById('authMessage');
  const submitButton = document.getElementById('loginBtn');
  const roleButtons = [...document.querySelectorAll('[data-role]')];
  const roleHint = document.getElementById('roleHint');
  const redirectUrl = new URL('login.html', window.location.href).href;
  const roleNames = { public: 'User', worker: 'Worker', supervisor: 'Supervisor' };
  const routeByRole = { public: 'index.html', worker: 'dashboard.html', supervisor: 'supervisor.html' };
  const ROLE_STORAGE_KEY = 'smartwaste_selected_login_role';
  const NEXT_STORAGE_KEY = 'smartwaste_post_login_destination';
  const REQUIRE_GOOGLE_KEY = 'smartwaste_require_google';
  let selectedRole = sessionStorage.getItem(ROLE_STORAGE_KEY) || 'public';

  function say(text, isError=false) {
    if (!message) return;
    message.textContent = text;
    message.style.color = isError ? '#c0392b' : '#16834a';
  }
  function busy(button, value) { if (button) button.disabled = value; }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function paintRole() {
    roleButtons.forEach(button => {
      const active = button.dataset.role === selectedRole;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (roleHint) {
      roleHint.textContent = selectedRole === 'public'
        ? 'Users can register with email or Google. Your account will be checked before opening the user dashboard.'
        : `${roleNames[selectedRole]} access is restricted. Your email must already be invited and authorized by a supervisor.`;
    }
    if (signupButton) {
      signupButton.disabled = selectedRole !== 'public';
      signupButton.title = selectedRole === 'public'
        ? 'Create a public user account'
        : 'Staff accounts must be invited by a supervisor';
    }
  }

  function selectRole(role) {
    if (!routeByRole[role]) return;
    selectedRole = role;
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
    paintRole();
    say(`${roleNames[role]} workspace selected. Sign in with the email authorized for this role.`);
  }

  async function getSessionWithRetry() {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await auth.auth.getSession();
        if (result.error) throw result.error;
        if (result.data?.session) return result.data.session;
      } catch (error) { lastError = error; }
      if (attempt < 2) await wait(500 * (attempt + 1));
    }
    if (lastError) throw lastError;
    return null;
  }

  async function routeAuthenticatedUser() {
    const session = await getSessionWithRetry();
    if (!session) return false;

    let profile = null;
    let lastError = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const result = await auth.from('profiles')
        .select('id,email,full_name,role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!result.error && result.data) {
        profile = result.data;
        break;
      }
      lastError = result.error || new Error('Profile row not found yet.');
      if (attempt < 3) await wait(600 * (attempt + 1));
    }
    if (!profile) {
      throw new Error(`Could not verify this account's workspace. ${lastError?.message || 'Check the profiles table and auth-user trigger.'}`);
    }

    if (profile.role !== selectedRole) {
      const actual = roleNames[profile.role] || 'Unassigned';
      throw new Error(`This email is authorized as ${actual}, not ${roleNames[selectedRole]}. Select ${actual} or contact the supervisor if this is incorrect.`);
    }

    if (sessionStorage.getItem(REQUIRE_GOOGLE_KEY) === 'true') {
      const hasGoogleIdentity = session.user.app_metadata?.provider === 'google' ||
        (Array.isArray(session.user.identities) && session.user.identities.some(identity => identity.provider === 'google'));
      if (!hasGoogleIdentity) throw new Error('Google verification is required for your profile and collection requests. Click Continue with Google.');
    }

    let destination = routeByRole[profile.role];
    if (!destination) throw new Error('This account has no valid SmartWaste role. Contact the supervisor.');
    const requestedDestination = sessionStorage.getItem(NEXT_STORAGE_KEY);
    if (profile.role === 'public' && requestedDestination === 'profile.html') destination = 'profile.html';
    if (profile.role === 'public' && requestedDestination === 'index.html') destination = 'index.html';
    sessionStorage.removeItem(NEXT_STORAGE_KEY);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    sessionStorage.removeItem(REQUIRE_GOOGLE_KEY);
    say(`Verified ${roleNames[profile.role]} access. Opening your workspace…`);
    location.replace(new URL(destination, window.location.href).href);
    return true;
  }

  if (!auth) {
    say('Supabase did not initialize. Check your internet connection and js/supabaseClient.js.', true);
    return;
  }

  roleButtons.forEach(button => button.addEventListener('click', () => selectRole(button.dataset.role)));
  paintRole();

  // After Google OAuth, Supabase returns to this page. The selected role is
  // preserved in sessionStorage and checked against the database profile.
  getSessionWithRetry().then(async session => {
    if (!session) return;
    say('Signed in. Verifying your selected workspace…');
    try { await routeAuthenticatedUser(); }
    catch (error) { say(error.message, true); }
  }).catch(error => say(error.message || 'Could not check your session.', true));

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (sessionStorage.getItem(REQUIRE_GOOGLE_KEY) === 'true') {
      say('For your profile and collection requests, please use Continue with Google.', true);
      return;
    }
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    busy(submitButton, true);
    say(`Signing in to the ${roleNames[selectedRole]} workspace…`);
    try {
      const { error } = await auth.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const routed = await routeAuthenticatedUser();
      if (!routed) throw new Error('Sign-in completed, but no active session was found. Please try again.');
    } catch (error) {
      say(error.message || 'Sign-in failed.', true);
    } finally {
      busy(submitButton, false);
    }
  });

  signupButton?.addEventListener('click', async () => {
    if (sessionStorage.getItem(REQUIRE_GOOGLE_KEY) === 'true') {
      return say('Use Continue with Google to verify your SmartWaste profile.', true);
    }
    if (selectedRole !== 'public') {
      return say('Worker and supervisor accounts cannot self-register. Ask an authorized supervisor to invite this exact email address.', true);
    }
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    if (!email || password.length < 8) {
      return say('Enter a valid email and a password of at least 8 characters.', true);
    }
    busy(signupButton, true);
    say('Creating your User account…');
    try {
      const { data, error } = await auth.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: '' } }
      });
      if (error) throw error;
      if (data.session) {
        await routeAuthenticatedUser();
      } else {
        say('User account created. Confirm your email, then select User and sign in.');
      }
    } catch (error) {
      say(error.message || 'Registration failed.', true);
    } finally {
      busy(signupButton, false);
    }
  });

  googleButton?.addEventListener('click', async () => {
    sessionStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    busy(googleButton, true);
    say(`Connecting to Google for ${roleNames[selectedRole]} access…`);
    try {
      const { error } = await auth.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl }
      });
      if (error) throw error;
    } catch (error) {
      say(error.message || 'Google sign-in failed.', true);
      busy(googleButton, false);
    }
  });

  forgotLink?.addEventListener('click', async event => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    if (!email) return say('Enter your email address first, then click Forgot password.', true);
    say('Sending password reset email…');
    const { error } = await auth.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('reset-password.html', window.location.href).href
    });
    say(error ? error.message : 'Password reset email sent. Check your inbox.');
    if (error) message.style.color = '#c0392b';
  });
})();
