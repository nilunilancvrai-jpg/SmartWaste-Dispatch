
window.SmartWaste = window.SmartWaste || {};

(function () {
    let map;
    let userMarker;
    let binMarkers = [];
    let currentLocation = null;

    const app = window.SmartWaste;

    const locateBtn = document.getElementById("locateBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const allBinsBtn = document.getElementById("allBinsBtn");
    const locationNavBtn = document.getElementById("locationNavBtn");
    const exploreBtn = document.getElementById("exploreBtn");
    const binCard = document.getElementById("binCard");
    const message = document.getElementById("message");

    // Display a message to the user
    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.style.display = "block";
        }
    }

    function hideMessage() {
        if (message) {
            message.textContent = "";
            message.style.display = "none";
        }
    }

    // Create the map
    function initializeMap() {
        if (!window.L) {
            showMessage("Map library failed to load. Check your internet connection.");
            return;
        }

        map = L.map("map").setView([12.9716, 77.5946], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        displayBins();
    }

    // Clear old bin markers
    function clearBinMarkers() {
        binMarkers.forEach(function (marker) {
            map.removeLayer(marker);
        });

        binMarkers = [];
    }

    // Display bins on the map
    function displayBins() {
        if (!map) return;

        clearBinMarkers();

        const bins = app.binService.getAllBins();

        bins.forEach(function (bin) {
            const markerColor =
                bin.status !== "available" ? "#777777" :
                bin.fill >= 80 ? "#dc2626" :
                bin.fill >= 50 ? "#f59e0b" : "#16a34a";

            const marker = L.circleMarker([bin.lat, bin.lng], {
                radius: 9,
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.85,
                weight: 2
            }).addTo(map);

            marker.bindPopup(
                "<b>" + bin.name + "</b><br>" +
                bin.address + "<br>" +
                "Fill level: " + bin.fill + "%<br>" +
                "Status: " + bin.status
            );

            binMarkers.push(marker);
        });
    }

    // Display the recommended bin
    function displayRecommendedBin(bin) {
        if (!binCard) return;

        binCard.style.display = "block";

        if (!bin) {
            binCard.innerHTML =
                "<h3>No suitable bin found</h3>" +
                "<p>There are no available bins under 80% full within 5 km.</p>";
            return;
        }

        binCard.innerHTML = `
            <div class="bin-top">
                <div>
                    <div class="bin-name">${bin.name}</div>
                    <div class="bin-address">${bin.address}</div>
                </div>
                <span class="status available">Available</span>
            </div>

            <div class="bin-stats">
                <div>
                    <div class="stat-label">Fill level</div>
                    <div class="stat-value">${bin.fill}%</div>
                </div>
                <div>
                    <div class="stat-label">Distance</div>
                    <div class="stat-value">${app.formatDistance(bin.distanceKm)}</div>
                </div>
            </div>

            <div class="progress">
                <div class="progress-bar" style="width: ${bin.fill}%"></div>
            </div>

            <button class="directions-btn" id="directionsBtn">
                Get Walking Directions
            </button>
        `;

        
document.getElementById("directionsBtn").addEventListener("click", function () {
    if (!currentLocation) {
        showMessage("Find your location first.");
        return;
    }

    try {
        app.routing.showRoute(map, currentLocation, bin);
        showMessage("Calculating your walking route...");
    } catch (error) {
        showMessage(error.message || "Could not display the walking route.");
    }
});

    }

    // Get location and recommend the nearest suitable bin
    async function findNearestBin() {
        hideMessage();

        if (locateBtn) {
            locateBtn.disabled = true;
            locateBtn.textContent = "Finding location...";
        }

        showMessage("Requesting your location...");

        try {
            currentLocation = await app.getUserLocation();

            if (userMarker) {
                map.removeLayer(userMarker);
            }

            userMarker = L.marker([
                currentLocation.lat,
                currentLocation.lng
            ]).addTo(map);

            userMarker.bindPopup("Your location").openPopup();

            map.setView([
                currentLocation.lat,
                currentLocation.lng
            ], 15);

            displayBins();

            const recommendedBin =
                app.getRecommendedBin(currentLocation);

            displayRecommendedBin(recommendedBin);

            hideMessage();

            if (!recommendedBin) {
                showMessage("No suitable bin found within 5 km. Try again later.");
            }
        } catch (error) {
            showMessage(error.message || "Could not find your location.");
        } finally {
            if (locateBtn) {
                locateBtn.disabled = false;
                locateBtn.textContent = "Find Nearest Bin";
            }
        }
    }

    // Show all bins
    function showAllBins() {
        displayBins();

        if (map && binMarkers.length > 0) {
            const group = L.featureGroup(binMarkers);
            map.fitBounds(group.getBounds().pad(0.15));
        }

        showMessage("Showing all demo bins on the map.");
    }

    // Explore suitable bins near the current location
    function exploreBins() {
        if (!currentLocation) {
            showMessage("Find your location first to explore nearby bins.");
            return;
        }

        const bins = app.getSuitableBins(currentLocation);

        if (bins.length === 0) {
            showMessage("No suitable bins found within 5 km.");
            return;
        }

        displayRecommendedBin(bins[0]);
        showMessage("Found " + bins.length + " suitable bin(s) nearby.");
    }

    // Open directions to the user's current location
    function openLocationInMaps() {
        if (!currentLocation) {
            showMessage("Find your location first.");
            return;
        }

        const url =
            "https://www.google.com/maps/search/?api=1&query=" +
            currentLocation.lat + "," + currentLocation.lng;

        window.open(url, "_blank", "noopener,noreferrer");
    }

    // Connect buttons
    if (locateBtn) {
        locateBtn.addEventListener("click", findNearestBin);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            displayBins();

            if (currentLocation) {
                displayRecommendedBin(
                    app.getRecommendedBin(currentLocation)
                );
                showMessage("Bin information refreshed.");
            } else {
                showMessage("Bin information refreshed. Find your location for a recommendation.");
            }
        });
    }

    if (allBinsBtn) {
        allBinsBtn.addEventListener("click", showAllBins);
    }

    if (locationNavBtn) {
        locationNavBtn.addEventListener("click", openLocationInMaps);
    }

    if (exploreBtn) {
        exploreBtn.addEventListener("click", exploreBins);
    }

    // Start the application
    initializeMap();
})();
