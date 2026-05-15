const awsIot = require("aws-iot-device-sdk");
const { CLUSTER_RESULTS } = require("../topics");
const {
  iotEndpoint,
  clientIdScript,
  certBasenameScript,
} = require("../config/awsEnv");

module.exports = {
  connectScriptMessenger: (data) => {
    // Certificate File Path
    const absoluteFilePath =
      "/mnt/shared/code/MQTT_Job_Distributor/src/shared/helpers/";
    const certificateFilePath =
      absoluteFilePath + "connect_device_package/" + certBasenameScript();
    const device = awsIot.device({
      keyPath: certificateFilePath + ".private.key",
      certPath: certificateFilePath + ".cert.pem",
      caPath: absoluteFilePath + "connect_device_package/AmazonRootCA1.pem",
      clientId: clientIdScript(),
      host: iotEndpoint(),
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
