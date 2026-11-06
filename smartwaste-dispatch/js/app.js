
window.SmartWaste = window.SmartWaste || {};

(function () {
    let map;
    let userMarker = null;
    let binMarker = null;

    let currentLocation = null;
    let currentRecommendedBin = null;

    let watchId = null;

    // IMPORTANT: false allows the blue marker to move
    // relative to the map during GPS updates.
    let followUser = false;

    let firstLocationReceived = false;
    let routeActive = false;

    let lastRecommendationUpdate = 0;
    let lastRouteUpdate = 0;
    let lastRouteLocation = null;

    const app = window.SmartWaste;

    const locateBtn = document.getElementById("locateBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const allBinsBtn = document.getElementById("allBinsBtn");
    const locationNavBtn = document.getElementById("locationNavBtn");
    const exploreBtn = document.getElementById("exploreBtn");
    const binCard = document.getElementById("binCard");
    const message = document.getElementById("message");

    // SETTINGS
    const RECOMMENDATION_INTERVAL = 15000;
    const ROUTE_UPDATE_INTERVAL = 30000;
    const ROUTE_MOVEMENT_THRESHOLD = 40;

    // Display messages
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

    // Initialize map
    function initializeMap() {
        if (!window.L) {
            showMessage("Map library failed to load.");
            return;
        }

        map = L.map("map", {
            zoomControl: true
        }).setView([12.5970, 75.8496], 15);

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19,
                subdomains: ["a", "b", "c"]
            }
        ).addTo(map);

        // Stop following when user manually drags the map
        map.on("dragstart", function () {
            followUser = false;
        });

        console.log("SmartWaste map initialized.");
    }

    // Calculate distance in metres
    function distanceBetween(a, b) {
        return app.calculateDistance(a, b) * 1000;
    }

    // Remove old bin marker
    function clearBinMarker() {
        if (binMarker && map) {
            map.removeLayer(binMarker);
            binMarker = null;
        }
    }

    // Display only one recommended bin
    function displayBinMarker(bin) {
        clearBinMarker();

        if (!bin || !map) return;

        binMarker = L.circleMarker(
            [bin.lat, bin.lng],
            {
                radius: 11,
                color: "#07543e",
                fillColor: "#0b8a61",
                fillOpacity: 1,
                weight: 3
            }
        ).addTo(map);

        binMarker.bindPopup(
            "<b>" + bin.name + "</b><br>" +
            "Fill level: " + bin.fill + "%<br>" +
            "Status: Available"
        );
    }

    // Update distance shown in the card
    function updateDisplayedDistance(bin) {
        const distanceElement = binCard
            ? binCard.querySelector(".distance-value")
            : null;

        if (distanceElement && bin) {
            distanceElement.textContent =
                app.formatDistance(bin.distanceKm);
        }
    }

    // Display recommended bin
    function displayRecommendedBin(bin) {
        if (!binCard) return;

        currentRecommendedBin = bin;
        binCard.style.display = "block";

        if (!bin) {
            binCard.innerHTML = `
                <div class="empty-state">
                    <h3>No suitable bin found</h3>
                    <p>
                        No available bin below 80% capacity
                        was found within 5 km.
                    </p>
                </div>
            `;

            clearBinMarker();

            if (routeActive && app.routing) {
                app.routing.clearRoute(map);
                routeActive = false;
            }

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
                    <div class="stat-value distance-value">
                        ${app.formatDistance(bin.distanceKm)}
                    </div>
                </div>
            </div>

            <div class="progress">
                <div class="progress-bar"
                     style="width: ${bin.fill}%">
                </div>
            </div>

            <button class="directions-btn" id="directionsBtn">
                Get Walking Directions
            </button>
        `;

        const directionsBtn =
            document.getElementById("directionsBtn");

        if (directionsBtn) {
            directionsBtn.addEventListener("click", function () {

                if (!currentLocation) {
                    showMessage("Your location is not available.");
                    return;
                }

                if (!app.routing || !app.routing.showRoute) {
                    showMessage("Walking directions are not configured.");
                    return;
                }

                try {
                    routeActive = true;
                    lastRouteUpdate = Date.now();
                    lastRouteLocation = { ...currentLocation };

                    showMessage("Calculating walking directions...");

                    app.routing.showRoute(
                        map,
                        currentLocation,
                        currentRecommendedBin
                    );

                } catch (error) {
                    routeActive = false;
                    showMessage(error.message);
                }
            });
        }

        displayBinMarker(bin);
    }

    // Update the user's blue marker
    function updateUserMarker(location) {
        const position = [
            location.lat,
            location.lng
        ];

        if (userMarker) {
            // Move existing marker to new GPS coordinates
            userMarker.setLatLng(position);
        } else {
            // Create marker for the first GPS update
            userMarker = L.marker(position).addTo(map);
            userMarker.bindPopup("Your live location");
        }
    }

    // Refresh nearest bin recommendation
    function updateRecommendation(force = false) {
        if (!currentLocation) return;

        const now = Date.now();

        if (
            !force &&
            now - lastRecommendationUpdate <
            RECOMMENDATION_INTERVAL
        ) {
            return;
        }

        lastRecommendationUpdate = now;

        const newBin = app.getRecommendedBin(currentLocation);

        const binChanged =
            (!newBin && currentRecommendedBin) ||
            (newBin && !currentRecommendedBin) ||
            (
                newBin &&
                currentRecommendedBin &&
                newBin.name !== currentRecommendedBin.name
            );

        if (binChanged) {
            displayRecommendedBin(newBin);

            if (routeActive && newBin) {
                updateWalkingRoute(true);
            }
        } else if (newBin) {
            currentRecommendedBin = newBin;
            updateDisplayedDistance(newBin);
        }
    }

    // Update walking route when user moves
    function updateWalkingRoute(force = false) {
        if (
            !routeActive ||
            !currentLocation ||
            !currentRecommendedBin ||
            !app.routing
        ) {
            return;
        }

        const now = Date.now();

        if (lastRouteLocation) {
            const moved = distanceBetween(
                lastRouteLocation,
                currentLocation
            );

            if (
                !force &&
                moved < ROUTE_MOVEMENT_THRESHOLD
            ) {
                return;
            }
        }

        if (
            !force &&
            now - lastRouteUpdate < ROUTE_UPDATE_INTERVAL
        ) {
            return;
        }

        lastRouteUpdate = now;
        lastRouteLocation = { ...currentLocation };

        try {
            console.log("Recalculating walking route...");

            app.routing.showRoute(
                map,
                currentLocation,
                currentRecommendedBin
            );

        } catch (error) {
            console.error("Route update failed:", error);
            showMessage("Unable to refresh walking directions.");
        }
    }

    // Handle every GPS update
    function handleLocationUpdate(position) {

        console.log("GPS UPDATE RECEIVED");

        console.log(
            "Latitude:",
            position.coords.latitude
        );

        console.log(
            "Longitude:",
            position.coords.longitude
        );

        console.log(
            "Accuracy:",
            position.coords.accuracy,
            "meters"
        );

        console.log(
            "Timestamp:",
            new Date(position.timestamp)
        );

        const previousLocation = currentLocation;

        currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Calculate movement
        if (previousLocation) {
            const movement = distanceBetween(
                previousLocation,
                currentLocation
            );

            console.log(
                "Movement since previous GPS update:",
                movement.toFixed(2),
                "meters"
            );
        }

        // Update blue marker
        updateUserMarker(currentLocation);

        // Map follows only when the user requests recentering
        if (followUser) {
            map.panTo(
                [
                    currentLocation.lat,
                    currentLocation.lng
                ],
                {
                    animate: true,
                    duration: 0.5
                }
            );
        }

        // First location update
        if (!firstLocationReceived) {
            firstLocationReceived = true;
            updateRecommendation(true);
            hideMessage();
        } else {
            updateRecommendation();
            updateWalkingRoute();
        }

        if (locateBtn) {
            locateBtn.disabled = false;
            locateBtn.textContent = "My live location";
        }
    }

    // GPS error handling
    function handleLocationError(error) {
        console.error("GPS ERROR:", error);

        let errorMessage = "Unable to access your location.";

        if (error.code === 1) {
            errorMessage =
                "Location permission denied. Allow location access.";
        } else if (error.code === 2) {
            errorMessage =
                "Location unavailable. Check GPS settings.";
        } else if (error.code === 3) {
            errorMessage =
                "Location request timed out. Please try again.";
        }

        showMessage(errorMessage);

        if (locateBtn) {
            locateBtn.disabled = false;
            locateBtn.textContent = "Retry location";
        }
    }

    // Start continuous GPS tracking
    function startLiveTracking() {
        if (!navigator.geolocation) {
            showMessage("GPS is not supported by your browser.");
            return;
        }

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
        }

        showMessage("Detecting your live location...");

        if (locateBtn) {
            locateBtn.disabled = true;
            locateBtn.textContent = "Finding location...";
        }

        console.log("Starting SmartWaste live GPS tracking...");

        watchId = navigator.geolocation.watchPosition(
            handleLocationUpdate,
            handleLocationError,
            {
                enableHighAccuracy: false,
                maximumAge: 2000,
                timeout: 60000
            }
        );
    }

    // Recenter map when user clicks location button
    function recenterMap() {
        if (!currentLocation) {
            startLiveTracking();
            return;
        }

        followUser = true;

        map.setView(
            [
                currentLocation.lat,
                currentLocation.lng
            ],
            17,
            {
                animate: true
            }
        );
    }

    // Location button
    if (locateBtn) {
        locateBtn.addEventListener("click", function () {
            if (currentLocation) {
                recenterMap();
            } else {
                startLiveTracking();
            }
        });
    }

    // Refresh nearest bin
    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            if (!currentLocation) {
                startLiveTracking();
                return;
            }

            updateRecommendation(true);
            showMessage("Nearest suitable bin refreshed.");
        });
    }

    // Hide All Bins
    if (allBinsBtn) {
        allBinsBtn.hidden = true;
    }

    // Explore button
    if (exploreBtn) {
        exploreBtn.addEventListener("click", function () {
            if (!currentLocation) {
                startLiveTracking();
                return;
            }

            updateRecommendation(true);
            recenterMap();
        });
    }

    // Compatibility with existing HTML
    if (locationNavBtn) {
        locationNavBtn.addEventListener("click", recenterMap);
    }

    // Start application
    initializeMap();

    if (map) {
        startLiveTracking();
    }

})();
