
window.SmartWaste = window.SmartWaste || {};

// SIMULATED DEMO DATA — Somwarpet, Kodagu
// These are test coordinates, NOT verified real waste-bin locations.

window.SmartWaste.sampleBins = [
    {
        id: 1,
        name: "Demo Bin Station 01",
        address: "Demo point near Somwarpet Town Centre",
        lat: 12.5970,
        lng: 75.8496,
        fill: 35,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 2,
        name: "Demo Bin Station 02",
        address: "Demo point north of Somwarpet Centre",
        lat: 12.6000,
        lng: 75.8490,
        fill: 65,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 3,
        name: "Demo Bin Station 03",
        address: "Demo point east of Somwarpet Centre",
        lat: 12.5975,
        lng: 75.8530,
        fill: 95,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 4,
        name: "Demo Bin Station 04",
        address: "Demo point south of Somwarpet Centre",
        lat: 12.5940,
        lng: 75.8500,
        fill: 20,
        status: "out-of-service",
        updatedAt: Date.now()
    },
    {
        id: 5,
        name: "Demo Bin Station 05",
        address: "Demo point west of Somwarpet Centre",
        lat: 12.5960,
        lng: 75.8460,
        fill: 45,
        status: "available",
        updatedAt: Date.now()
    }
];

console.log(
    "SmartWaste: Somwarpet demo bins loaded:",
    window.SmartWaste.sampleBins.length
);
