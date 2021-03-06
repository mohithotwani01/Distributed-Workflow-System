
import Task, { compareTaskByCost } from "./Task.js";
import Graph from "../utils/Graph.js";
import PriorityQueue from "../utils/PriorityQueue.js";
import Stats from "../utils/Statistics.js";

class Workflow {
    constructor(index, name, scheduledAt, tasks) {
        this._index = index;
        this._name = name;
        this._scheduledAt = scheduledAt;
        this._completedAt = -1;
        this._taskMap = new Map();
        this._dependentMap = new Map();
        for (let i = 0; i < tasks.length; i++) {
            if (!this._dependentMap.has(tasks[i].name)) {
                this._dependentMap.set(tasks[i].name, []);
            }
            const deps = tasks[i].dependencies;
            for (let j = 0; j < deps.length; j++) {
                if (this._dependentMap.has(deps[j])) {
                    this._dependentMap.get(deps[j]).push(tasks[i].name);
                } else {
                    this._dependentMap.set(deps[j], new Array(tasks[i].name));
                }
            }
        }
        for (let i = 0; i < tasks.length; i++) {
            const task =
                new Task(tasks[i].cost, tasks[i].name, tasks[i].description, tasks[i].dependencies, this._dependentMap.get(tasks[i].name), this._name);
            this._taskMap.set(task.name, task);
        }

        // free unused memory
        delete this._dependentMap;

        this._inDegree = new Map();
        for (const taskName of this._taskMap.keys()) {
            this._inDegree.set(taskName, 0);
        }
        
        for (const [taskName, task] of this._taskMap.entries()) {
            for (const neighbour of task.dependents) {
                this._inDegree.set(neighbour, this._inDegree.get(neighbour) + 1);
            }
        }

        //...................//
        this._pq = new PriorityQueue(compareTaskByCost);
        this._polled = [];  // FIFO
        for (const [taskName, task] of this._taskMap.entries()) {
            if (this._inDegree.get(taskName) === 0) {
                this._pq.push(task);
            }
        }
    }

    get name() {
        return this._name;
    }

    get scheduledAt() {
        return this._scheduledAt;
    }

    get tasks() {
        return Array.from(this._taskMap.values());
    }

    get completedAt() {
        return this._completedAt;
    }

    get index() {
        return this._index;
    }

    _updateDependents(task) {
        for (const depName of task.dependents) {
            this._inDegree.set(depName, this._inDegree.get(depName) - 1);
            if (this._inDegree.get(depName) === 0) {
                this._pq.push(this._taskMap.get(depName));
            }
        }
    }

    _pollFromPQ() {
        if (!this._pq.isEmpty()) {
            return this._pq.pop();
        }
        return null;
    }

    _peekFromPQ() {
        if (!this._pq.isEmpty()) {
            return this._pq.peek();
        }
        return null;
    }

    _isNotReadyForNextTask(currentTime) {
        return (this.isCompleted() || currentTime < this._scheduledAt);
    }

    /**
     * These fns will interact with system
     */
    nextTask(currentTime) {
        if (this._isNotReadyForNextTask(currentTime)) {
            return null;
        }
        const task = this._pollFromPQ();
        if (task !== null) {
            task.assigned(currentTime);
        }
        return task;
    }

    peekNextTask(currentTime) {
        if (this._isNotReadyForNextTask(currentTime)) {
            return null;
        }
        return this._peekFromPQ();
    }

    isCompleted() {
        return this._polled.length === this._taskMap.size;
    }

    onTaskCompleted(taskName, workerId, startTime, endTime) {
        const task = this._taskMap.get(taskName);
        this._polled.push(taskName);
        task.executed(workerId, startTime, endTime);
        this._updateDependents(task);
        if (this.isCompleted()) {
            this._completedAt = endTime;
        }
    }

    getOutput() {
        if (!this.isCompleted()) {
            return null;
        }
        return {
            "name": this._name,
            "scheduled_at": this._scheduledAt,
            "completed_at": this._completedAt,
            "tasks": Array.from(this._taskMap.values()).map(task => task.getOutput()),
        }
    }

    getStats() {
        return {
            startedAt: this._scheduledAt,
            completedAt: this._completedAt,
            executionTime: this._completedAt - this._scheduledAt,
            tasksCount: this._taskMap.size,
            avgTaskCost: Stats.calcAvg(Array.from(this._taskMap.values()).map(task => task.cost))
        }
    }
}

export default Workflow;