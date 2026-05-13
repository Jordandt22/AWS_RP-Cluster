require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const os = require("os");
const {
  RPC_SYSTEM_METRICS,
  RPC_SYSTEM_LOGS,
  RPC_CONSOLE_LOGS,
} = require("./logGroups");
const { log } = require("../helpers/consoleLogWrapper");

const nodeName = os.hostname();
const logStreamName = `rpc-${nodeName}`;

const client = new CloudWatchLogsClient({
  region: "us-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Ensure log stream exists
async function ensureLogStream(logGroupName) {
  const streams = await client.send(
    new DescribeLogStreamsCommand({
      logGroupName,
      logStreamNamePrefix: logStreamName,
    })
  );

  const exists = streams.logStreams.find(
    (s) => s.logStreamName === logStreamName
  );
  if (!exists) {
    await client.send(
      new CreateLogStreamCommand({ logGroupName, logStreamName })
    );
  }
  return exists?.uploadSequenceToken;
}

async function sendSystemLogs() {
  // Use journalctl to get the last 10 lines of logs
  const logData = execSync("journalctl -n 10 --no-pager").toString(); // Get the last 10 logs
  const lines = logData.trim().split("\n");

  const token = await ensureLogStream(RPC_SYSTEM_LOGS);

  const logEvents = lines.map((msg, i) => ({
    message: msg,
    timestamp: Date.now() + i, // You can adjust this if needed
  }));

  try {
    await client.send(
      new PutLogEventsCommand({
        logGroupName: RPC_SYSTEM_LOGS,
        logStreamName,
        logEvents,
        sequenceToken: token,
      })
    );
    log("System Logs sent to CloudWatch.");
  } catch (error) {
    log(`Error sending logs to CloudWatch: ${error}`);
  }
}

async function sendSystemMetrics() {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const load = os.loadavg();

  const message = {
    timestamp: new Date().toISOString(),
    nodeName,
    cpuLoad1m: load[0].toFixed(2),
    memoryUsed: totalMem - freeMem,
    memoryFree: freeMem,
    memoryTotal: totalMem,
    memoryUsagePercent: (((totalMem - freeMem) / totalMem) * 100).toFixed(2),
    memoryUsage: memUsage,
  };

  const token = await ensureLogStream(RPC_SYSTEM_METRICS);

  const logEvents = [
    {
      message: JSON.stringify(message),
      timestamp: Date.now(),
    },
  ];

  try {
    await client.send(
      new PutLogEventsCommand({
        logGroupName: RPC_SYSTEM_METRICS,
        logStreamName,
        logEvents,
        sequenceToken: token,
      })
    );
    log("System Metrics logged to CloudWatch.");
  } catch (error) {
    log(`Error sending logs to CloudWatch: ${error}`);
  }
}

async function sendConsoleLogs() {
  // Ensure log stream exists
  const token = await ensureLogStream(RPC_CONSOLE_LOGS);

  // Read the log file
  let startingPath = "/mnt/shared";
  if (nodeName === "node04") {
    startingPath = "/srv/nfs/shared";
  }

  // Read the log file
  const logFilePath = path.join(
    startingPath,
    `/code/MQTT_Job_Distributor/src/shared/logging/logs/${nodeName}.log`
  );
  const logData = fs.readFileSync(logFilePath, "utf8");
  const logLines = logData.trim().split("\n");

  // Prepare the log events for CloudWatch
  const logEvents = logLines.map((line, index) => ({
    message: line,
    timestamp: Date.now() + index, // Ensure unique timestamps for each log line
  }));

  try {
    await client.send(
      new PutLogEventsCommand({
        logGroupName: RPC_CONSOLE_LOGS,
        logStreamName,
        logEvents,
        sequenceToken: token,
      })
    );
    log("Console Logs sent to CloudWatch.");

    // Clear the log file after sending the logs
    fs.truncateSync(logFilePath, 0);

    log("Cleared the log file.");
  } catch (error) {
    log(`Error sending logs to CloudWatch: ${error}`);
  }
}

module.exports = {
  sendSystemLogs,
  sendSystemMetrics,
  sendConsoleLogs,
};
