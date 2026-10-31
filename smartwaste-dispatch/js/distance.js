
/*
  SmartWaste Dispatch
  File: js/distance.js

  Purpose:
  Calculate the distance between two GPS coordinates.

  Input:
  Two objects containing latitude and longitude.

  Output:
  Distance in kilometres.
*/

window.SmartWaste = window.SmartWaste || {};


/**
 * Convert degrees into radians.
 * Trigonometric calculations use radians.
 */
window.SmartWaste.toRadians = function (degrees) {
    return degrees * Math.PI / 180;
};


/**
 * Calculate straight-line distance between two locations.
 *
 * Example:
 * const distance = SmartWaste.calculateDistance(
 *     { lat: 12.9716, lng: 77.5946 },
 *     { lat: 12.9730, lng: 77.5970 }
 * );
 *
 * The result is in kilometres.
 */
window.SmartWaste.calculateDistance = function (pointA, pointB) {

    const earthRadiusKm = 6371;

    const latitudeA = pointA.lat;
    const longitudeA = pointA.lng;

    const latitudeB = pointB.lat;
    const longitudeB = pointB.lng;

    // Convert coordinate differences to radians.
    const latitudeDifference = window.SmartWaste.toRadians(
        latitudeB - latitudeA
    );

    const longitudeDifference = window.SmartWaste.toRadians(
        longitudeB - longitudeA
    );

    // Haversine calculation.
    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(window.SmartWaste.toRadians(latitudeA)) *
        Math.cos(window.SmartWaste.toRadians(latitudeB)) *
        Math.sin(longitudeDifference / 2) ** 2;

    // Protect against floating-point rounding errors.
    const safeA = Math.min(1, Math.max(0, a));

    const centralAngle = 2 * Math.atan2(
        Math.sqrt(safeA),
        Math.sqrt(1 - safeA)
    );

    return earthRadiusKm * centralAngle;
};


/**
 * Format a distance for display.
 * Example: 0.45 km becomes 450 m.
 */
window.SmartWaste.formatDistance = function (distanceKm) {

    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        return "Distance unavailable";
    }

    if (distanceKm < 1) {
        return Math.round(distanceKm * 1000) + " m";
    }

    return distanceKm.toFixed(2) + " km";
};


console.log("SmartWaste: Distance module loaded.");

