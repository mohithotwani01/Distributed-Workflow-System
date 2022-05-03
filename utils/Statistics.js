class Stats {
    static calcMedian(arr) {
        arr.sort((a,b)=> a < b);
        const size = arr.length;
        let median = 0;
        if (size %2 == 0) {
            median = arr[size/2 - 1] / 2 + arr[size/2] / 2;
        } else {
            median = arr[size/2];
        }
        return median;
    }

    static calcAvg(arr) {
        let avg = 0;
        for (let i = 0; i < arr.length; i++) {
            avg = avg * (i/(i+1)) + arr[i]/(i+1);
        }
        return avg;
    }
}

export default Stats;


