(() => {
  const auth = window.smartWasteSupabase;
  const form = document.getElementById('resetForm');
  const message = document.getElementById('resetMessage');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('newPassword').value;
    if (password.length < 8) { message.textContent = 'Use at least 8 characters.'; return; }
    const { error } = await auth.auth.updateUser({ password });
    if (error) { message.textContent = error.message; return; }
    message.textContent = 'Password updated. You can now sign in.';
    setTimeout(() => location.replace('login.html'), 1200);
  });
})();
