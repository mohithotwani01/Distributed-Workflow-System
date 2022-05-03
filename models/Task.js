class Task {
    constructor(cost, name, description, dependencies, dependents, workflowId) {
        this._workflowId = workflowId;
        this._cost = cost;
        this._name = name;
        this._description = description;
        this._dependencies = dependencies;
        this._dependents = dependents;
        this._workerId = null;
        this._assignedTime = -1;
        this._startedAt = -1;
        this._completedAt = -1;
        this._isDone = false;
    }

    get cost() {
        return this._cost;
    }

    get name() {
        return this._name;
    }

    get description() {
        return this._description;
    }

    get index() {
        return this._index;
    }

    get workflowId() {
        return this._workflowId;
    }

    get workerId() {
        return this._workerId;
    }

    get dependencies() {
        return this._dependencies;
    }

    get dependents() {
        return this._dependents;
    }

    assigned(assignedTime) {
        if (this._assignedTime !== -1) {
            this._assignedTime = assignedTime;
        }
    }

    executed(workerId, startTime, endTime) {
        if (this._isDone) {
            return;
        }
        this._isDone = true;
        this._startedAt = startTime;
        this._completedAt = endTime;
        this._workerId = workerId;
    }

    isDone() {
        return this._isDone;
    }

    getOutput() {
        if (!this.isDone()) {
            return null;
        }
        return {
            "name": this._name,
            "worker": this._workerId,
            "started_at": this._startedAt,
            "completed_at": this._completedAt,
        }
    }

}

export default Task;


export function compareTaskByCost(a, b) {
    return a.cost < b.cost;
}

