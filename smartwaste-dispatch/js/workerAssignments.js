
window.SmartWaste = window.SmartWaste || {};

window.SmartWaste.workerAssignments = (function () {
    const STORAGE_KEY = "smartwaste_worker_assignments";

    function getAssignments() {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
    }

    function saveAssignments(assignments) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(assignments)
        );
    }

    // Find the worker currently assigned to a bin
    function getAssignmentByBin(binId) {
        return getAssignments().find(function (task) {
            return (
                String(task.binId) === String(binId) &&
                task.status !== "collected" &&
                task.status !== "cancelled"
            );
        }) || null;
    }

    // Assign a bin to exactly one worker
    function assignBin(binId, workerId) {
        if (!binId || !workerId) {
            return { success: false, message: "Missing bin or worker ID." };
        }

        const bin = window.SmartWaste.binService.getBinById(binId);

        if (!bin || bin.status !== "available" || bin.fill < 80) {
            return { success: false, message: "This bin does not require collection." };
        }

        const assignments = getAssignments();

        const existing = assignments.find(function (task) {
            return (
                String(task.binId) === String(binId) &&
                task.status !== "collected" &&
                task.status !== "cancelled"
            );
        });

        if (existing) {
            return {
                success: false,
                message: "This bin is already assigned to another worker."
            };
        }

        const newTask = {
            id: "TASK-" + Date.now(),
            binId: bin.id,
            workerId: String(workerId),
            status: "assigned",
            assignedAt: Date.now()
        };

        assignments.push(newTask);
        saveAssignments(assignments);

        return { success: true, task: newTask };
    }

    // Get only this worker's assigned tasks
    function getWorkerTasks(workerId) {
        return getAssignments().filter(function (task) {
            return (
                String(task.workerId) === String(workerId) &&
                task.status !== "collected" &&
                task.status !== "cancelled"
            );
        });
    }

    // Get bins not yet assigned
    function getUnassignedBins() {
        const assignedBinIds = getAssignments()
            .filter(function (task) {
                return task.status !== "collected" &&
                       task.status !== "cancelled";
            })
            .map(function (task) {
                return String(task.binId);
            });

        return window.SmartWaste.workerActions
            .getBinsForCollection()
            .filter(function (bin) {
                return !assignedBinIds.includes(String(bin.id));
            });
    }

    // Update assignment status
    function updateTaskStatus(taskId, status) {
        const allowedStatuses = [
            "assigned",
            "on-the-way",
            "collecting",
            "collected",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return false;
        }

        const assignments = getAssignments();

        const task = assignments.find(function (item) {
            return item.id === taskId;
        });

        if (!task || task.status === "collected" ||
            task.status === "cancelled") {
            return false;
        }

        task.status = status;
        task.updatedAt = Date.now();

        if (status === "collected") {
            task.completedAt = Date.now();
        }

        saveAssignments(assignments);
        return true;
    }

    return {
        getAssignments,
        getAssignmentByBin,
        assignBin,
        getWorkerTasks,
        getUnassignedBins,
        updateTaskStatus
    };
})();
