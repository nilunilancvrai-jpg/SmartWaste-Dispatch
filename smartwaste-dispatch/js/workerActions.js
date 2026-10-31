
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.workerActions = {

    // Find bins that need collection
    getBinsForCollection: function () {
        const bins = window.SmartWaste.binService.getAllBins();

        return bins
            .filter(function (bin) {
                return (
                    bin.status === "available" &&
                    Number.isFinite(bin.fill) &&
                    bin.fill >= 80 &&
                    bin.fill <= 100
                );
            })
            .sort(function (a, b) {
                // Bins with the highest fill level come first
                return b.fill - a.fill;
            });
    },

    // Update a bin after a worker collects the waste
    markAsCollected: function (binId) {
        return window.SmartWaste.binService.updateBin(binId, {
            fill: 0,
            updatedAt: Date.now()
        });
    },

    // Mark a bin as out of service
    markOutOfService: function (binId) {
        return window.SmartWaste.binService.updateBin(binId, {
            status: "out-of-service",
            updatedAt: Date.now()
        });
    },

    // Restore a bin to service
    restoreBin: function (binId) {
        return window.SmartWaste.binService.updateBin(binId, {
            status: "available",
            updatedAt: Date.now()
        });
    }
};

console.log("SmartWaste: Worker actions module loaded.");
