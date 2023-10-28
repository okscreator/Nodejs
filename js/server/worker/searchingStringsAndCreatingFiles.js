import { Worker } from "worker_threads";

export const searchingStringsAndCreatingFiles = async (workerData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./js/server/worker/worker.js", {
      workerData,
    });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
};
