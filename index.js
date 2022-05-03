import System from "./models/System.js";
import fs from "fs";

function process_workflows(workflows, worker_count) {
    // preprocess inputs
    if (typeof workflows === "string") {
        workflows = JSON.parse(workflows);
    }
    if (typeof worker_count === "string") {
        worker_count = Number.parseInt(worker_count);
    }

    // execution
    const system = new System(workflows, worker_count);
    system.start();
    const result = system.getOuptut();
    const outputStr = JSON.stringify(result, null, 2);
    const stats = system.getStats();

    // prints results
    console.log("Result:");
    console.log(outputStr);
    console.log("Statistics:");
    console.log(JSON.stringify(stats, null, 2));
}


const exampleWF = JSON.parse(fs.readFileSync("./Examples/example2.json"));
process_workflows(exampleWF.workflows, exampleWF.worker_count);