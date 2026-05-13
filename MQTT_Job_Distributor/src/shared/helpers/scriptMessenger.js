require("dotenv").config();
const awsIot = require("aws-iot-device-sdk");
const { CLUSTER_RESULTS } = require("../topics");

module.exports = {
  connectScriptMessenger: (data) => {
    // Certificate File Path
    const absoluteFilePath =
      "/mnt/shared/code/MQTT_Job_Distributor/src/shared/helpers/";
    const certificateFilePath =
      absoluteFilePath + "connect_device_package/rpw-script-helper";
    const device = awsIot.device({
      keyPath: certificateFilePath + ".private.key",
      certPath: certificateFilePath + ".cert.pem",
      caPath: absoluteFilePath + "connect_device_package/AmazonRootCA1.pem",
      clientId: "rpw-script-helper",
      host: "a3ajycnqmw7di7-ats.iot.us-west-1.amazonaws.com",
    });

    device.on("connect", () => {
      console.log("Script Messenger connected to AWS IoT Core for reporting!");

      const resultData = {
        ...data,
        jobFinishedTimestamp: new Date().toISOString(),
      };

      // Sends a message to the Master Node and IoT Core, which will trigger the resultProcessor Lambda Function
      device.publish(CLUSTER_RESULTS, JSON.stringify(resultData), () => {
        console.log("Job Completed by " + data.workerDetails.workerNodeName);
        device.end();
      });
    });
  },
};
