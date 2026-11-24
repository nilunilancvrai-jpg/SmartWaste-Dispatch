window.SmartWaste = window.SmartWaste || {};
window.SmartWaste.binService = {
  getAllBins() {
    const saved = window.SmartWaste.storage.loadBins();
    if (saved !== null) return saved;
    return (window.SmartWaste.sampleBins || []).map(bin => ({...bin}));
  },
  getBinById(id) { return this.getAllBins().find(bin => String(bin.id)===String(id)) || null; },
  updateBin(id, updates) {
    const bins=this.getAllBins(); const i=bins.findIndex(bin=>String(bin.id)===String(id));
    if(i<0) return false; bins[i]={...bins[i],...updates,id:bins[i].id};
    return window.SmartWaste.storage.saveBins(bins);
  },
  resetBins() { return window.SmartWaste.storage.saveBins((window.SmartWaste.sampleBins||[]).map(bin=>({...bin}))); }
};
