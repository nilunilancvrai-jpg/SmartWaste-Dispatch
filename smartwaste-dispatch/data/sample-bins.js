
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.sampleBins = [
    {
        id: 1,
        name: "Bin Station 01",
        address: "Near Kundalahalli Main Road",
        lat: 12.9560,
        lng: 77.7160,
        fill: 35,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 2,
        name: "Bin Station 02",
        address: "Near AECS Layout",
        lat: 12.9590,
        lng: 77.7130,
        fill: 65,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 3,
        name: "Bin Station 03",
        address: "Near Whitefield Main Road",
        lat: 12.9690,
        lng: 77.7500,
        fill: 95,
        status: "available",
        updatedAt: Date.now()
    },
    {
        id: 4,
        name: "Bin Station 04",
        address: "Near Kundalahalli Bus Stop",
        lat: 12.9520,
        lng: 77.7200,
        fill: 20,
        status: "out-of-service",
        updatedAt: Date.now()
    }
];

console.log(
    "SmartWaste: Sample bins loaded:",
    window.SmartWaste.sampleBins.length
);
