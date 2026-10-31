
window.SmartWaste = window.SmartWaste || {};

// Maximum distance to search for a bin
window.SmartWaste.SEARCH_RADIUS_KM = 5;

// A bin is suitable only when its fill level is below 80%
window.SmartWaste.getSuitableBins = function (userLocation) {
    const bins = window.SmartWaste.binService.getAllBins();

    const suitableBins = bins
        .filter(function (bin) {
            return (
                bin.status === "available" &&
                Number.isFinite(bin.fill) &&
                bin.fill >= 0 &&
                bin.fill < 80 &&
                Number.isFinite(bin.lat) &&
                Number.isFinite(bin.lng)
            );
        })
        .map(function (bin) {
            const distanceKm =
                window.SmartWaste.calculateDistance(
                    userLocation,
                    { lat: bin.lat, lng: bin.lng }
                );

            return {
                ...bin,
                distanceKm: distanceKm
            };
        })
        .filter(function (bin) {
            return bin.distanceKm <=
                window.SmartWaste.SEARCH_RADIUS_KM;
        });

    // Show the nearest suitable bin first
    suitableBins.sort(function (a, b) {
        return a.distanceKm - b.distanceKm;
    });

    return suitableBins;
};

// Return the nearest suitable bin, or null if none is found
window.SmartWaste.getRecommendedBin = function (userLocation) {
    const bins = window.SmartWaste.getSuitableBins(userLocation);

    if (bins.length === 0) {
        return null;
    }

    return bins[0];
};

console.log("SmartWaste: Recommendation module loaded.");
