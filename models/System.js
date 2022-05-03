import Workflow from "./Workflow.js";
import Worker from "./Worker.js";
import RoundRobin from "../utils/RoundRobin.js";
import PriorityQueue from "../utils/PriorityQueue.js";
import Stats from "../utils/Statistics.js";

export class System {
    constructor(workflows, numOfWorkers) {
        this._now = 0;
        this._startTime = 0;
        this._endTime = 0;
        this._wfStartTime = Number.POSITIVE_INFINITY;
        this._systemIdleTime = 0;
        this._pending = new Map();
        this._completed = new Map();
        this._wfs = new Map();
        this._workers = [];
        for (let i = 0; i < workflows.length; i++) {
            const wf = new Workflow(i, workflows[i].name, workflows[i].scheduled_at, workflows[i].tasks);
            this._pending.set(workflows[i].name, wf);
            this._wfs.set(workflows[i].name, wf);
        }
        for (let i = 0; i < numOfWorkers; i++) {
            const id = `w${i + 1}`;
            const worker = new Worker(id);
            this._workers.push(worker);
        }
        this._rr = new RoundRobin(this._wfs.values());
        this._checkWfAvailability = this._checkWfAvailability.bind(this);
        this._compareWorkers = (a, b) => a.busyTime < b.busyTime;
        this._freeWorkerPQ = new PriorityQueue(this._compareWorkers);
    }

    get now() {
        return this._now;
    }

    _updateWFCompletion() {
        const toRemove = [];
        for (const [wfName, wf] of this._pending) {
            if (wf.isCompleted()) {
                toRemove.push(wfName);
            }
        }
        for (let key of toRemove) {
            this._completed.set(key, this._wfs.get(key));
            this._pending.delete(key);
            this._rr.remove(this._wfs.get(key));
        }
    }

    _checkWfAvailability(wf) {
        return wf.peekNextTask(this._now) !== null;
    }

    _pollWorkflows(n = 1) {
        const wfs = this._rr.getNextN(n, this._checkWfAvailability);
        const tasks = [];
        wfs.forEach(wf => {
            if (wf !== null) {
                tasks.push(wf.nextTask(this._now));
            }
        });
        return tasks;
    }

    _updateNow() {
        let nextTick = Number.POSITIVE_INFINITY;
        for (const w of this._workers) {
            if (w.nextTick > this._now) {
                nextTick = Math.min(nextTick, w.nextTick);
            }
        }
        if (nextTick === Number.POSITIVE_INFINITY) {
            let mini = Number.POSITIVE_INFINITY;
            for (const wf of this._pending.values()) {
                mini = Math.min(mini, wf.scheduledAt)
            }
            nextTick = mini;
            this._wfStartTime = Math.min(this._wfStartTime, nextTick);
            this._systemIdleTime += nextTick - this._now;
        }
        this._now = nextTick;
    }

    _getFreeWorkers() {
        this._freeWorkerPQ.clear();
        for (const w of this._workers) {
            if (w.isFree(this._now)) {
                this._freeWorkerPQ.push(w);
            }
        }
    }

    _checkCompletedTasks() {
        for (const w of this._workers) {
            const completedTasks = w.getProcessedList(this._now);
            for (const taskData of completedTasks) {
                const wf = this._wfs.get(taskData.task.workflowId);
                wf.onTaskCompleted(
                    taskData.task.name, w.id,
                    taskData.startTime, taskData.endTime
                );
            }
        }
    }

    _assignTasks() {
        this._getFreeWorkers();
        let freeWorkers = this._freeWorkerPQ.size();
        while (freeWorkers > 0 && this._pending.size > 0) {
            const x = Math.min(freeWorkers, this._pending.size);
            const nextTasks = this._pollWorkflows(x);
            freeWorkers -= nextTasks.length;
            if(nextTasks.length === 0) {
                break;
            }
            while (nextTasks.length > 0) {
                const task = nextTasks.shift();
                this._freeWorkerPQ.pop().startNextTask(this._now, task);
            }
        }
    }

    isCompleted() {
        return this._pending.size === 0;
    }

    start() {
        while (!this.isCompleted()) {
            this._updateNow();
            this._checkCompletedTasks();
            this._updateWFCompletion();
            this._assignTasks();
        }
        this._endTime = this._now;

        // Stop all workers
        for (const w of this._workers) {
            w.shutDown(this._endTime, this._systemIdleTime);
        }
    }

    getOuptut() {
        if (!this.isCompleted()) {
            return null;
        }
        const result = [];
        for (const wf of this._wfs.values()) {
            result.push(wf.getOutput());
        }
        return result;
    }

    getStats() {
        const workerStats = this._workers.map(w => w.getStats());
        const wfStats = [];
        for (const wf of this._wfs.values()) {
            wfStats.push(wf.getStats());
        }
        return {
            startTime: this._startTime,
            endTime: this._endTime,
            idleTime: this._systemIdleTime,
            avgWorkerIdleTime: Stats.calcAvg(workerStats.map(wS => wS.idleTime)),
            abgWorkerBusyTime: Stats.calcAvg(workerStats.map(wS => wS.busyTime)),
            medianWfExecTime: Stats.calcMedian(wfStats.map(wfS => wfS.executionTime)),
            workers: workerStats,
            workflows: wfStats,
        }
    }

}

export default System;

