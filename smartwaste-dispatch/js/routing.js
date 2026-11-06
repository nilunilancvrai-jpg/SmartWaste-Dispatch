
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.routing = (function () {
    let routeControl = null;

    const FOOT_ROUTING_URL =
        "https://routing.openstreetmap.de/routed-foot/route/v1";

    function showRoute(map, userLocation, bin) {
        if (!window.L || !L.Routing) {
            throw new Error(
                "Routing library did not load. Check your internet connection."
            );
        }

        if (!map || !userLocation || !bin) {
            throw new Error("Location or bin information is missing.");
        }

        if (
            !Number.isFinite(Number(userLocation.lat)) ||
            !Number.isFinite(Number(userLocation.lng)) ||
            !Number.isFinite(Number(bin.lat)) ||
            !Number.isFinite(Number(bin.lng))
        ) {
            throw new Error("Invalid location coordinates.");
        }

        // Remove previous route
        if (routeControl) {
            map.removeControl(routeControl);
            routeControl = null;
        }

        const message = document.getElementById("message");

        if (message) {
            message.textContent = "Calculating your walking route...";
            message.style.display = "block";
        }

        // Configure the actual FOOT routing server
        const footRouter = L.Routing.osrmv1({
            serviceUrl: FOOT_ROUTING_URL,
            profile: "driving",
            timeout: 30000,
            useHints: false
        });

        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(
                    Number(userLocation.lat),
                    Number(userLocation.lng)
                ),
                L.latLng(
                    Number(bin.lat),
                    Number(bin.lng)
                )
            ],

            router: footRouter,

            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,

            // Keep the map clean; show route summary in the message.
            show: false,
            collapsible: true,

            lineOptions: {
                styles: [
                    {
                        color: "#ffffff",
                        opacity: 0.95,
                        weight: 9
                    },
                    {
                        color: "#087653",
                        opacity: 1,
                        weight: 6
                    }
                ],
                extendToWaypoints: true
            },

            createMarker: function () {
                return null;
            }
        }).addTo(map);

        // Walking route successfully calculated
        routeControl.on("routesfound", function (event) {
            const route = event.routes[0];

            if (!route || !route.summary) return;

            const distanceKm = route.summary.totalDistance / 1000;

            const walkingMinutes = Math.ceil(
                route.summary.totalTime / 60
            );

            if (message) {
                message.textContent =
                    "Walking route ready · " +
                    distanceKm.toFixed(2) +
                    " km · About " +
                    walkingMinutes +
                    " minutes.";
                message.style.display = "block";
            }
        });

        // Route calculation failed
        routeControl.on("routingerror", function () {
            if (message) {
                message.textContent =
                    "Could not calculate a walking route. Please try again.";
                message.style.display = "block";
            }
        });

        return routeControl;
    }

    function clearRoute(map) {
        if (map && routeControl) {
            map.removeControl(routeControl);
            routeControl = null;
        }
    }

    return {
        showRoute: showRoute,
        clearRoute: clearRoute
    };
})();

console.log("SmartWaste: Walking routing module loaded.");
