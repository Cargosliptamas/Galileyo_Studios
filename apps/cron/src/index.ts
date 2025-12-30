import { createJiti } from "jiti";

import jobs from "./jobs/index.js";
import { worker } from "./worker.js";

const jiti = createJiti(import.meta.url);
await jiti.import("./env.js");

async function main() {
  await worker.init(jobs);
}

main()
  .then(() => {
    console.log("Queue initialized");
  })
  .catch((error) => {
    console.error(error);
  });
