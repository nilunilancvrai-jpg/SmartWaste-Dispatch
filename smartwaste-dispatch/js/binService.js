
/*
  SmartWaste Dispatch
  File: js/binService.js

  Purpose:
  1. Load bin data.
  2. Return all bins.
  3. Find a bin by its ID.
  4. Update a bin's details.
*/

window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.binService = {

    // Get saved bins or use the sample data.
    getAllBins: function () {
        const savedBins = window.SmartWaste.storage.loadBins();

        if (savedBins !== null) {
            return savedBins;
        }

        return window.SmartWaste.sampleBins;
    },

    // Find a bin using its unique ID.
    getBinById: function (binId) {
        const bins = this.getAllBins();

        return bins.find(function (bin) {
            return bin.id === binId;
        }) || null;
    },

    // Update an existing bin and save the changes.
    updateBin: function (binId, updates) {
        const bins = this.getAllBins();

        const binIndex = bins.findIndex(function (bin) {
            return bin.id === binId;
        });

        if (binIndex === -1) {
            return false;
        }

        // Preserve the bin ID and apply allowed updates.
        bins[binIndex] = {
            ...bins[binIndex],
            ...updates,
            id: bins[binIndex].id
        };

        return window.SmartWaste.storage.saveBins(bins);
    },

    // Restore the original sample bin data.
    resetBins: function () {
        const sampleBins = window.SmartWaste.sampleBins;

        return window.SmartWaste.storage.saveBins(
            sampleBins.map(function (bin) {
                return { ...bin };
            })
        );
    }
};

console.log("SmartWaste: Bin service module loaded.");
