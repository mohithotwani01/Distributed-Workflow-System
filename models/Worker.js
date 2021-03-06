import Task from "./Task.js";

class Worker {
    constructor(id) {
        this._nextTick = 0;
        this._id = id;
        this._processedTasks = [];
        this._lastCollectionTime = 0;
        this._busyTime = 0;
        this._idleTime = 0;
        this._totalIdleTime = 0;
    }

    get id() {
        return this._id;
    }

    get nextTick() {
        return this._nextTick;
    }

    isFree(currentTime) {
        return currentTime >= this._nextTick;
    }

    startNextTask(currentTime, task) {
        if (!this.isFree(currentTime)) {
            return false;
        }

        // indicate nextTick for this worker
        this._nextTick = currentTime + task.cost;

        // add this tasks cost to busyTime
        this._busyTime += task.cost;

        // add to task passsed queue
        this._processedTasks.push({
            task: task,
            startTime: currentTime,
            endTime: this._nextTick,
        });
        return true;
    }

    getProcessedList(currentTime) {
        const tasks = [];
        if (currentTime < this._lastCollectionTime) {
            return tasks;
        }
        while (this._processedTasks.length > 0) {
            if (this._processedTasks[0].endTime > currentTime) {
                break;
            }
            tasks.push(this._processedTasks.shift());
        }
        this._lastCollectionTime = currentTime;
        return tasks;
    }

    get busyTime() {
        return this._busyTime;
    }

    get totalIdleTime() {
        return this._totalIdleTime;
    }

    get idleTime() {
        return this._idleTime;
    }

    shutDown(currentTime, systemIdleTime) {
        this._totalIdleTime = currentTime - this._busyTime;
        this._idleTime = this._totalIdleTime - systemIdleTime;
    }

    getStats() {
        return {
            id: this.id,
            busyTime: this._busyTime,
            idleTime: this._idleTime,
            totalIdleTime: this._totalIdleTime,
        }
    }
}

export default Worker;