class Graph {
    constructor(tasks) {
        this.adjacencyList = {};
        this._createGraph(tasks);
    }

    _addVertex(vertex) {
        if (this.adjacencyList[vertex] === undefined) {
            this.adjacencyList[vertex] = [];
        }
    }

    _addEdge(v1, v2) {
        console.log(v1, "->", v2);
        this.adjacencyList[v1].push(v2);
    }

    _createGraph(tasks) {
        for (let i = 0; i < tasks.length; i++) {
            this._addVertex(tasks[i].name);
            for (let j = 0; j < tasks[i].dependencies.length; j++) {
                this._addVertex(tasks[i].dependencies[j]);
                this._addEdge(tasks[i].dependencies[j], tasks[i].name);
            }
        }
    }

    // _topologicalSortHelper(v, n, visited, topologicalNums) {
    //     visited[v] = true;
    //     const neighbors = this.adjacencyList[v];
    //     for (const neighbor of neighbors) {
    //         if (!visited[neighbor]) {
    //             n = this._topologicalSortHelper(neighbor, n, visited, topologicalNums);
    //         }
    //     }
    //     topologicalNums[v] = n;
    //     return n - 1;
    // }

    // topologicalSort() {
    //     const vertices = Object.keys(this.adjacencyList);
    //     const in_degree = {};
    //     const topologicalOrder = [];
    //     const queue = [];
    //     let n = vertices.length - 1;
    //     for (const v of vertices) {
    //         if (!visited[v]) {
    //             n = this._topologicalSortHelper(v, n, visited, topologicalOrder);
    //         }
    //     }
    //     return topologicalNums;
    // }


    /*
        For Verifying Run "_test2.js" and uncomment the console.log()
        that are written inside topological sort code
        Graph is:
        0: ->1->3
        1: ->2
        2: ->3
        3: 
        4: ->3->5->6
        5: ->6
        6: 
    */
    topologicalSort() {
        const vertices = Object.keys(this.adjacencyList);
        const inDegree = {};
        for (const v of vertices) {
            inDegree[v] = 0;
        }
        for (const v of vertices) {
            for (const neighbor of this.adjacencyList[v]) {
                inDegree[neighbor] = inDegree[neighbor] + 1 || 1;
            }
        }
        // console.log(inDegree);
        const queue = [];
        for (const v of vertices) {
            if (inDegree[v] == 0) {
                queue.push(v);
            }
        }
        const topologicalOrder = [];
        let index = 0;
        while (queue.length) {
            // console.log(queue);
            const v = queue.shift();
            topologicalOrder.push(v);
            for (const neighbor of this.adjacencyList[v]) {
                if (--inDegree[neighbor] === 0) {
                    queue.push(neighbor);
                }
            }
        }
        // console.log(topologicalNums);
        return topologicalOrder;
    }
}

export default Graph;