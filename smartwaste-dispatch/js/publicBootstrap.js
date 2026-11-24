document.addEventListener('smartwaste:authorized', async () => {
  try {
    const bins = await window.SmartWaste.data.getBins();
    window.SmartWaste.storage.saveBins(bins);
    document.dispatchEvent(new Event('smartwaste:bins-ready'));
  } catch (error) {
    console.error('Could not load shared bins:', error);
    const message = document.getElementById('message');
    if (message) { message.textContent = 'Could not load bins from the database: ' + error.message; message.style.display='block'; }
    document.dispatchEvent(new Event('smartwaste:bins-ready'));
  }
}, { once: true });
