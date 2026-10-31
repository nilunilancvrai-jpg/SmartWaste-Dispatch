
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.routing = (function () {
    let routeControl = null;

    function showRoute(map, userLocation, bin) {
        if (!window.L || !L.Routing) {
            throw new Error("Routing library did not load. Check your internet connection.");
        }

        if (!map || !userLocation || !bin) {
            throw new Error("Location or bin information is missing.");
        }

        // Remove the previous route before drawing another
        if (routeControl) {
            map.removeControl(routeControl);
            routeControl = null;
        }

        routeControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(bin.lat, bin.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            collapsible: true,
            lineOptions: {
                styles: [
                    { color: "#ffffff", opacity: 0.9, weight: 9 },
                    { color: "#16834a", opacity: 0.95, weight: 6 }
                ],
                extendToWaypoints: true
            },
            createMarker: function () {
                return null;
            }
        }).addTo(map);

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

console.log("SmartWaste: Routing module loaded.");

