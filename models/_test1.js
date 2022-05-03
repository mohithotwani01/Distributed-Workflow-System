import System from "./System.js";
import PriorityQueue from "../utils/PriorityQueue.js";

const tasksOfWorkflow1 = [
    {
        name: "task0",
        description: "Fetch customer data",
        cost: 1,
        dependencies: [
            "task1",
            "task3"
        ],
    }, {
        name: "task1",
        description: "Extract order information",
        cost: 1,
        dependencies: [
            "task2"
        ]
    }, {
        name: "task2",
        description: "Run Order validation rules",
        cost: 1,
        dependencies: [
            "task3"
        ]
    }, {
        name: "task3",
        description: "Run Company validation rules",
        cost: 1,
        dependencies: []
    }, {
        name: "task4",
        description: "Post validation results",
        cost: 1,
        dependencies: [
            "task3",
        ]
    }, {
        name: "task5",
        description: "Post validation results",
        cost: 1,
        dependencies: [
            "task4"
        ]
    }, {
        name: "task6",
        description: "Post validation results",
        cost: 1,
        dependencies: [
            "task5",
            "task4"
        ]
    }
];

let tasks = tasksOfWorkflow1;
const workflow1 = {
    name: "workflow1",
    scheduled_at: 1641480759,
    tasks,
}


const workflows = [workflow1];
const numOfWorkers = 2;

const system = new System(workflows, numOfWorkers);
system.start();
console.log(JSON.stringify(system.getOuptut(), null, numOfWorkers));
console.log("Stats for each Worker");
console.log(JSON.stringify(system.getStats(), null, numOfWorkers));

