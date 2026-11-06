
/*
  SmartWaste Dispatch
  File: js/location.js

  Purpose:
  1. Automatically request the user's live location.
  2. Return latitude and longitude.
  3. Handle permission errors and timeouts.
*/

window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.getUserLocation = function () {

    return new Promise(function (resolve, reject) {

        if (!navigator.geolocation) {
            reject(new Error(
                "Your browser does not support location services."
            ));
            return;
        }

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log("SmartWaste: Live location received.", location);

                resolve(location);
            },

            function (error) {

                let message;

                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        message = "Location permission denied. Allow location access in Chrome settings.";
                        break;

                    case error.POSITION_UNAVAILABLE:
                        message = "Location unavailable. Check your device's location settings.";
                        break;

                    case error.TIMEOUT:
                        message = "Location request timed out. Please try again.";
                        break;

                    default:
                        message = "Unable to detect your location.";
                }

                console.error("SmartWaste GPS Error:", error.code, error.message);

                reject(new Error(message));
            },

            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    });
};

console.log("SmartWaste: Location module loaded.");
