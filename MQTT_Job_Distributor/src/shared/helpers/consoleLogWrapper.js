require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { CLUSTER_CONSOLE } = require("../topics");
const nodeName = os.hostname();

// Certificate File Path
let startingPath = "/mnt/shared";
if (nodeName === "node04") {
  startingPath = "/srv/nfs/shared";
}

const absoluteFilePath = path.join(
  startingPath,
  "/code/MQTT_Job_Distributor/src/shared/helpers"
);
const certificateFilePath = path.join(
  absoluteFilePath,
  "/connect_device_package/rpw-script-helper"
);
const device = awsIot.device({
  keyPath: certificateFilePath + ".private.key",
  certPath: certificateFilePath + ".cert.pem",
  caPath: absoluteFilePath + "/connect_device_package/AmazonRootCA1.pem",
  clientId: "rpc-logger",
  host: "a3ajycnqmw7di7-ats.iot.us-west-1.amazonaws.com",
});

module.exports = {
  log: (message) => {
    // The File path is different for the master node and the worker nodes
    let filePath = path.join(
      startingPath,
      `/code/MQTT_Job_Distributor/src/shared/logging/logs/${nodeName}.log`
    );

    // Add the console.log message to log file
    const timestamp = new Date().toISOString();
    const fullMsg = `[${timestamp}] ${message}`;
    fs.appendFileSync(filePath, fullMsg + "\n");

    // Send the console.log data to the Frontend
    device.publish(
      CLUSTER_CONSOLE,
      JSON.stringify({
        nodeName,
        message: fullMsg,
      })
    );

    console.log(fullMsg);
  },
};
