(() => {
  const db = window.smartWasteSupabase;
  const $ = id => document.getElementById(id);
  document.addEventListener('smartwaste:authorized', async () => {
    const profile = window.SmartWaste?.currentProfile;
    if (!profile) return;
    const user = window.SmartWaste?.currentUser;
    const googleVerified = user?.app_metadata?.provider === 'google' ||
      (Array.isArray(user?.identities) && user.identities.some(identity => identity.provider === 'google'));
    if (!googleVerified) {
      sessionStorage.setItem('smartwaste_selected_login_role', 'public');
      sessionStorage.setItem('smartwaste_post_login_destination', 'profile.html');
      sessionStorage.setItem('smartwaste_require_google', 'true');
      location.replace('login.html');
      return;
    }
    $('profileName').textContent = profile.full_name || 'Name not provided';
    $('profileEmail').textContent = profile.email || window.SmartWaste.currentUser?.email || '—';
    try {
      const { data, error } = await db.from('waste_requests')
        .select('id,service_type,waste_size,status,created_at,pickup_address')
        .eq('requester_id', window.SmartWaste.currentUser.id)
        .order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      $('bookingCount').textContent = String(data.length);
      const list = $('bookingList');
      list.replaceChildren();
      if (!data.length) {
        const empty = document.createElement('p'); empty.textContent = 'No collection requests yet.'; list.appendChild(empty); return;
      }
      data.forEach(item => {
        const row = document.createElement('article'); row.className = 'booking-item';
        const info = document.createElement('div');
        const title = document.createElement('strong'); title.textContent = item.service_type || 'Collection request';
        const detail = document.createElement('small'); detail.textContent = `${item.pickup_address || 'Pickup address not provided'} · ${new Date(item.created_at).toLocaleDateString()}`;
        info.append(title, detail);
        const status = document.createElement('span'); status.className = 'booking-status'; status.textContent = item.status || 'pending';
        row.append(info, status); list.appendChild(row);
      });
    } catch (error) {
      $('bookingCount').textContent = '—';
      $('bookingList').textContent = 'Could not load collection requests: ' + error.message;
    }
  }, { once: true });
  $('profileSignOut')?.addEventListener('click', async () => {
    $('profileSignOut').disabled = true;
    const { error } = await db.auth.signOut();
    if (error) { $('profileMessage').textContent = error.message; $('profileSignOut').disabled = false; return; }
    location.replace('index.html');
  });
})();