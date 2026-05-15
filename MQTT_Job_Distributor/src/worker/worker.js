require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const os = require("os");
const { exec } = require("child_process");
const {
  CLUSTER_JOBS,
  CLUSTER_JOB_SUBMITTED,
  CLUSTER_WORKER_REGISTRATION,
  CLUSTER_METRICS,
  CLUSTER_LOGS,
  CLUSTER_CONSOLE_LOGS,
} = require("../shared/topics");
const {
  sendSystemLogs,
  sendSystemMetrics,
  sendConsoleLogs,
} = require("../shared/logging/rpLogger");
const { log } = require("../shared/helpers/consoleLogWrapper");
const {
  iotEndpoint,
  clientIdWorker,
  certBasenameWorker,
} = require("../shared/config/awsEnv");

const JOBS_FOLDER = "/mnt/shared/code/MQTT_Job_Distributor/src/shared/jobs/";
const workerNodeName = os.hostname();

// Certificate File Path
const absoluteFilePath = "/home/pi/certs/";
const certificateFilePath =
  absoluteFilePath +
  "connect_device_package/" +
  certBasenameWorker(workerNodeName);
const device = awsIot.device({
  keyPath: certificateFilePath + ".private.key",
  certPath: certificateFilePath + ".cert.pem",
  caPath: absoluteFilePath + "connect_device_package/AmazonRootCA1.pem",
  clientId: clientIdWorker(workerNodeName),
  host: iotEndpoint(),
});

device.on("connect", () => {
  log(`${workerNodeName} connected to AWS IoT Core!`);

  // Registers itself to the master node with it's worker ID
  // Status: 0 = idle / 1 = busy
  device.publish(
    CLUSTER_WORKER_REGISTRATION,
    JSON.stringify({ workerNodeName, status: 0 }),
    () => {
      log(`${workerNodeName} registered to Master Node!`);
    }
  );

  device.subscribe(CLUSTER_JOBS);
  device.subscribe(CLUSTER_METRICS);
  device.subscribe(CLUSTER_LOGS);
  device.subscribe(CLUSTER_CONSOLE_LOGS);
});

device.on("message", (topic, payload) => {
  if (topic === CLUSTER_JOBS) {
    const { submitterNodeName, jobData } = JSON.parse(payload.toString());
    // If the job is assigned to this worker node
    if (submitterNodeName === workerNodeName) {
      // Submit Slurm Job
      exec(
        `sbatch ${
          JOBS_FOLDER + jobData.jobDetails.slurmFile
        }.slurm '${JSON.stringify({ submitterNodeName, jobData })}'`,
        (err, stdout, stderr) => {
          if (err) {
            log(`Failed to Submit Slurm Job: ${err}`);
            return;
          }

          /* 
            Send out a message to cluster/job_submitted with the Job Data, 
            both the Master Node and the IoT Core will receive the message, 
            which will trigger the jobProcessor Lambda Function
          */
          const jobID = jobData.jobDetails.jobID;
          device.publish(
            CLUSTER_JOB_SUBMITTED,
            JSON.stringify({
              submitterNodeName,
              jobData,
            }),
            () => {
              log("Slurm Job: " + jobID + " Submitted");
            }
          );
        }
      );
    }
  }

  if (topic === CLUSTER_METRICS) {
    sendSystemMetrics().catch(console.error);
  }

  if (topic === CLUSTER_LOGS) {
    sendSystemLogs().catch(console.error);
  }

  if (topic === CLUSTER_CONSOLE_LOGS) {
    sendConsoleLogs().catch(console.error);
  }
});

device.on("error", (err) => {
  log(`Failed to Submit Slurm Job: ${err}`);
});
