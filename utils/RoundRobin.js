function _removeFromArray(arr, data) {
    const index = arr.indexOf(data);
    if (index !== -1) {
        for (let i = index + 1; i < arr.length; i++) {
            arr[i - 1] = arr[i];
        }
        arr.pop();
        return true;
    }
    return false;
}

function defaultCheck() {
    return true;
}


class RoundRobin {
    constructor(datas) {
        this._q1 = [...datas];
        this._q2 = [];
    }

    _get(n, checkFunc) {
        const wfs = [];
        let lenA = this._q1.length;
        let lenB = this._q2.length;
        while (lenA > 0) {
            const wf = this._q1.shift();
            lenA--;
            if (this._now < wf.scheduledAt) {
                this._q1.push(wf);
                continue;
            }
            if (checkFunc(wf)) {
                this._q2.push(wf);
                wfs.push(wf);
            } else {
                this._q1.push(wf);
            }
            if (wfs.length === n) {
                return wfs;
            }
        }
        if (wfs.length === n) {
            return wfs;
        }
        while (lenB > 0) {
            const wf = this._q2.shift();
            lenB--;
            if (this._now < wf.scheduledAt) {
                this._q1.push(wf);
                continue;
            }
            if (checkFunc(wf)) {
                this._q2.push(wf);
                wfs.push(wf);
            } else {
                this._q1.push(wf);
            }
            if (wfs.length === n) {
                return wfs;
            }
        }
        return wfs;
    }

    getNext(check = defaultCheck) {
        if (typeof check !== "function") {
            check = defaultCheck;
        }
        return this._get(1, check)[0];
    }

    getNextN(n = 1, check = defaultCheck) {
        if (typeof n !== "number") {
            n = 1;
        }
        if (typeof check !== "function") {
            check = defaultCheck;
        }
        n = Math.floor(n);
        n = Math.max(n, 0);
        n = Math.min(this.size(), n);
        return this._get(n, check);
    }

    add(data) {
        this._q1.unshift(data);
    }

    remove(data) {
        const q1Test = _removeFromArray(this._q1, data);
        if (!q1Test) {
            _removeFromArray(this._q2, data);
        }
    }

    size() {
        return this._q1.length + this._q2.length;
    }
}

export default RoundRobin;

