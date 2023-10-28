import { workerData, parentPort } from "worker_threads";
import { existsSync, truncate, createReadStream, writeFile } from "fs";
import { createInterface } from "readline";
import pkgColors from "colors";

const { blue } = pkgColors;

const reIp1 = /89.123.1.41/;
const reIp2 = /34.48.240.111/;

const writeFiles = (line) => {
  if (line.match(reIp1)) {
    writeFile(
      "./%89.123.1.41%_requests.log",
      line + "\n",
      { flag: "a" },
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  } else if (line.match(reIp2)) {
    writeFile(
      "./%34.48.240.111%_requests.log",
      line + "\n",
      { flag: "a" },
      function (err) {
        if (err) {
          return console.log(err);
        }
      }
    );
  }
};

const startProcess = (filePath) => {
  if (existsSync("./%89.123.1.41%_requests.log")) {
    truncate("./%89.123.1.41%_requests.log", (err) => {
      if (err) throw err;
    });
  }

  if (existsSync("./%34.48.240.111%_requests.log")) {
    truncate("./%34.48.240.111%_requests.log", (err) => {
      if (err) throw err;
    });
  }

  const readStream = createReadStream(filePath, "utf-8");
  const rl = createInterface({ input: readStream });
  rl.on("line", (line) => {
    writeFiles(line);
  });

  rl.on("error", (error) => console.log(error.message));
  rl.on("close", () => {
    return console.log(
      blue(
        "String search and file read/write operations completed successfully"
      )
    );
  });
};

startProcess(workerData);

parentPort.postMessage({ result: "Worker successfully completed" });
