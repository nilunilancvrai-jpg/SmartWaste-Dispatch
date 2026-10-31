
/*
  SmartWaste Dispatch
  File: js/storage.js

  Purpose:
  Save and load bin data using browser localStorage.

  Note:
  This is local browser storage, not a shared database.
*/

window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.storage = {

    // Save the bin list in the browser.
    saveBins: function (bins) {
        try {
            const json = JSON.stringify(bins);

            localStorage.setItem("smartwaste_bins", json);

            return true;
        } catch (error) {
            console.error("Could not save bin data:", error);
            return false;
        }
    },

    // Load saved bins from the browser.
    loadBins: function () {
        try {
            const json = localStorage.getItem("smartwaste_bins");

            if (!json) {
                return null;
            }

            const bins = JSON.parse(json);

            // Only return an array of bin records.
            if (!Array.isArray(bins)) {
                return null;
            }

            return bins;
        } catch (error) {
            console.error("Could not load bin data:", error);
            return null;
        }
    },

    // Remove saved data and restore demo defaults next time.
    clearBins: function () {
        try {
            localStorage.removeItem("smartwaste_bins");
            return true;
        } catch (error) {
            console.error("Could not clear bin data:", error);
            return false;
        }
    }
};

console.log("SmartWaste: Storage module loaded.");
