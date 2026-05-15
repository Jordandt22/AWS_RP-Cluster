require("dotenv").config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const clientIdMaster = () =>
  process.env.AWS_IOT_CLIENT_ID_MASTER || "rp-master-node";

const clientIdWorkerPrefix = () =>
  process.env.AWS_IOT_CLIENT_ID_PREFIX_WORKER || "rpw-";

const clientIdWorker = (nodeName) =>
  `${clientIdWorkerPrefix()}${nodeName}`;

const clientIdScript = () =>
  process.env.AWS_IOT_CLIENT_ID_SCRIPT || "rpw-script-helper";

const clientIdLogger = () =>
  process.env.AWS_IOT_CLIENT_ID_LOGGER || "rpc-logger";

/** Certificate folder name under connect_device_package (often matches IoT thing name). */
const certBasenameScript = () =>
  process.env.AWS_IOT_CERT_BASENAME_SCRIPT || clientIdScript();

const certBasenameLogger = () =>
  process.env.AWS_IOT_CERT_BASENAME_LOGGER || certBasenameScript();

module.exports = {
  iotEndpoint: () => requireEnv("AWS_IOT_ENDPOINT"),
  s3ChartsBucket: () => requireEnv("AWS_S3_CHARTS_BUCKET"),
  awsRegion: () => process.env.AWS_REGION || "us-west-1",
  clientIdMaster,
  clientIdWorker,
  clientIdScript,
  clientIdLogger,
  certBasenameMaster: clientIdMaster,
  certBasenameWorker: clientIdWorker,
  certBasenameScript,
  certBasenameLogger,
};
