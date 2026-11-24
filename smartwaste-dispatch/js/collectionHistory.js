
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.collectionHistory = (function () {

    const STORAGE_KEY = "smartwaste_collection_history";

    function getAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch (error) {
            console.error("Could not read collection history:", error);
            return [];
        }
    }

    function recordCollection(bin, workerId) {
        if (!bin || !bin.id) {
            return false;
        }

        const history = getAll();

        const record = {
            id: "COL-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            binId: bin.id,
            binName: bin.name || "Unknown Bin",
            workerId: workerId || "UNKNOWN",
            previousFill: Number(bin.fill),
            completedAt: Date.now()
        };

        history.push(record);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            return record;
        } catch (error) {
            console.error("Could not save collection history:", error);
            return false;
        }
    }

    function getCompletedCount() {
        return getAll().length;
    }

    return {
        getAll,
        recordCollection,
        getCompletedCount
    };

})();

console.log("SmartWaste: Collection history module loaded.");
