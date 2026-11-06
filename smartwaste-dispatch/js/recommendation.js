
window.SmartWaste = window.SmartWaste || {};

// Maximum search distance: 5 km
window.SmartWaste.SEARCH_RADIUS_KM = 5;

// Progressive search distances
window.SmartWaste.SEARCH_RADII = [
    0.5,
    1,
    2,
    5
];

// Get all suitable bins within the maximum search distance
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
                    {
                        lat: bin.lat,
                        lng: bin.lng
                    }
                );

            return {
                ...bin,
                distanceKm: distanceKm
            };

        })
        .filter(function (bin) {

            return (
                Number.isFinite(bin.distanceKm) &&
                bin.distanceKm <= window.SmartWaste.SEARCH_RADIUS_KM
            );

        });

    // Sort from nearest to farthest
    suitableBins.sort(function (a, b) {
        return a.distanceKm - b.distanceKm;
    });

    return suitableBins;
};


// Find the nearest suitable bin using progressive search
window.SmartWaste.getRecommendedBin = function (userLocation) {

    // Get all suitable bins within 5 km
    const suitableBins =
        window.SmartWaste.getSuitableBins(userLocation);

    // Search progressively
    for (const radius of window.SmartWaste.SEARCH_RADII) {

        // Find bins inside the current search radius
        const nearbyBins = suitableBins.filter(function (bin) {

            return bin.distanceKm <= radius;

        });

        // If suitable bins exist, recommend the nearest one
        if (nearbyBins.length > 0) {

            const recommendedBin = nearbyBins[0];

            return {
                ...recommendedBin,
                searchRadiusKm: radius
            };

        }
    }

    // No suitable bin found within 5 km
    return null;
};


console.log(
    "SmartWaste: Progressive recommendation module loaded."
);
