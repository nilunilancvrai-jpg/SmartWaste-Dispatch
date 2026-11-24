
window.SmartWaste = window.SmartWaste || {};

// Verified disposal locations.
// Only add real locations after confirming their details.

window.SmartWaste.disposalPoints = [
  {
    id: "DP001",
    name: "Public Recycling Station 01",
    type: "public_bin",

    lat: 12.9560,
    lng: 77.7160,

    accepts: ["plastic", "paper", "metal"],
    publicAccess: true,
    fill: 35,
    capacityKg: 50,

    verificationStatus: "demo",
    isDemo: true
  }
];
