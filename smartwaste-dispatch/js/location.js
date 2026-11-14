
/*
  SmartWaste Dispatch
  File: js/location.js

  Purpose:
  1. Request the user's location.
  2. Return latitude and longitude.
  3. Handle permission errors and timeouts.

  Note:
  GPS access normally requires localhost or HTTPS.
*/

window.SmartWaste = window.SmartWaste || {};


/**
 * Get the user's current location.
 *
 * Usage:
 * SmartWaste.getUserLocation()
 *     .then(location => console.log(location))
 *     .catch(error => console.error(error.message));
 *
 * Success result:
 * {
 *     lat: 12.9716,
 *     lng: 77.5946
 * }
 */
window.SmartWaste.getUserLocation = function () {

    return new Promise(function (resolve, reject) {

        // Check whether the browser supports GPS location.
        if (!navigator.geolocation) {
            reject(
                new Error(
                    "Your browser does not support location services."
                )
            );
            return;
        }

        // Ask the browser for the user's current position.
        navigator.geolocation.getCurrentPosition(

            // Called when location access succeeds.
            function (position) {

                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                console.log(
                    "SmartWaste: User location received."
                );

                resolve(location);
            },

            // Called when location access fails.
            function (error) {

                let message;

                switch (error.code) {

                    case error.PERMISSION_DENIED:
                        message =
                            "Location permission denied. Allow location access in your browser settings.";
                        break;

                    case error.POSITION_UNAVAILABLE:
                        message =
                            "Your location is unavailable. Check your device location settings and try again.";
                        break;

                    case error.TIMEOUT:
                        message =
                            "The location request timed out. Please try again.";
                        break;

                    default:
                        message =
                            "Unable to get your location. Please try again.";
                }

                reject(new Error(message));
            },

            // Location request settings.
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    });
};


console.log("SmartWaste: Location module loaded.");
