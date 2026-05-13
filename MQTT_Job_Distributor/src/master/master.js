require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const os = require("os");
const { exec } = require("child_process");
const {
  CLUSTER_JOB_PENDING,
  CLUSTER_JOBS,
  CLUSTER_RESULTS,
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

// Certificate File Path
const absoluteFilePath = "/home/pi/certs/";
const certificateFilePath =
  absoluteFilePath + "connect_device_package/rp-master-node";
const device = awsIot.device({
  keyPath: certificateFilePath + ".private.key",
  certPath: certificateFilePath + ".cert.pem",
  caPath: absoluteFilePath + "connect_device_package/AmazonRootCA1.pem",
  clientId: "rp-master-node",
  host: "a3ajycnqmw7di7-ats.iot.us-west-1.amazonaws.com",
});

// Current Worker Nodes that can be used for submitting a job
let submitterQueue = [];
let jobsInProgress = [];

device.on("connect", function () {
  log(`Master node(${os.hostname()}) connected to AWS IoT Core!`);

  // Listen for jobs available in pending directory in S3 Bucket
  device.subscribe(CLUSTER_JOB_PENDING);

  // Listen for results from workers
  device.subscribe(CLUSTER_RESULTS);

  // Listen for workers who are registering
  device.subscribe(CLUSTER_WORKER_REGISTRATION);

  // Listen for workers who are done submitting their Slurm job
  device.subscribe(CLUSTER_JOB_SUBMITTED);

  // Listen for requestSystemMetrics (Lambda) requesting system metrics
  device.subscribe(CLUSTER_METRICS);

  // Listen for requestSystemMetrics (Lambda) requesting system logs
  device.subscribe(CLUSTER_LOGS);

  // Listen for requestSystemMetrics (Lambda) requesting console logs
  device.subscribe(CLUSTER_CONSOLE_LOGS);
});

device.on("message", function (topic, payload) {
  if (topic === CLUSTER_JOB_PENDING) {
    const jobData = JSON.parse(payload.toString());
    const curSubmitter = submitterQueue[0];
    const jobID = jobData.jobDetails.jobID;

    if (jobsInProgress.includes(jobID)) {
      log(`Duplicate Request: Job(${jobID}) is currently in-progress.`);
    } else {
      //  If there are messengers available
      if (submitterQueue.length > 0 && curSubmitter.status === 0) {
        // Running a command to check the statuses of the worker nodes
        exec('sinfo -h -o "%T"', (error, stdout, stderr) => {
          if (error) {
            log(`Error running sinfo: ${error.message}`);
            return;
          }

          // Checks if there are any worker nodes available that can execute the job (not submitting the job)
          const states = stdout.trim().split("\n");
          if (states.includes("idle") || states.includes("mixed")) {
            const { jobDetails } = jobData;
            device.publish(
              CLUSTER_JOBS,
              JSON.stringify({
                submitterNodeName: curSubmitter.workerNodeName,
                jobData,
              }),
              () => {
                log(
                  `Publishing job: ${jobDetails.name}(${jobID}) to ${curSubmitter.workerNodeName}...`
                );
              }
            );

            // Move current submitter to the back of the queue and set status to busy
            const tempSubmitter = submitterQueue.shift();
            submitterQueue.push({ ...tempSubmitter, status: 1 });
            jobsInProgress.push(jobID);
          } else {
            log("No worker nodes available at the moment!");
          }
        });
      } else {
        log("No Job Submitters available at the moment!");
      }
    }
  }

  if (topic === CLUSTER_RESULTS) {
    const {
      workerDetails: { workerNodeName },
      jobData: {
        jobDetails: { jobID },
      },
    } = JSON.parse(payload.toString());
    jobsInProgress = jobsInProgress.filter((jobs) => jobs !== jobID);
    log(`Job(${jobID}) completed by worker node: ${workerNodeName}`);
  }

  if (topic === CLUSTER_JOB_SUBMITTED) {
    const { submitterNodeName, jobData } = JSON.parse(payload.toString());
    // Set the worker's to idle
    submitterQueue.map((submitter) => {
      if (submitter.workerNodeName === submitterNodeName) {
        submitter.status = 0;
      }
    });

    log(
      `Slurm Job(${jobData.jobDetails.jobID}) submitted by worker node: ${submitterNodeName}`
    );
  }

  if (topic === CLUSTER_WORKER_REGISTRATION) {
    const newSubmitter = JSON.parse(payload.toString());
    submitterQueue.push(newSubmitter);

    log(`${newSubmitter.workerNodeName} is ready to submit jobs!`);
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

device.on("error", function (error) {
  log("Error: " + error);
});
