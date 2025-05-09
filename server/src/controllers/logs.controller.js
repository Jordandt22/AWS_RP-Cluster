const { getLogs } = require("../helpers/AWS.helpers");
const nodeNames = {
  node04: true,
  node03: true,
  node02: true,
};

module.exports = {
  getSystemMetrics: async (req, res, next) => {
    const { nodeName } = req.params;
    if (!nodeNames[nodeName]) {
      return res
        .status(422)
        .json({ message: "There is no node with the name: " + nodeName });
    }

    const logGroupName = "/rpc/metrics";
    const logStreamName = `rpc-${nodeName.toLowerCase()}`;
    const metrics = await getLogs(logGroupName, logStreamName, 10, 10);

    res.status(200).json({
      nodeName,
      cloudWatch: { logGroupName, logStreamName },
      metrics: metrics.map((event) => ({ data: JSON.parse(event.message) })),
    });
  },
  getSystemLogs: async (req, res, next) => {
    const { nodeName } = req.params;
    if (!nodeNames[nodeName]) {
      return res
        .status(422)
        .json({ message: "There is no node with the name: " + nodeName });
    }

    const logGroupName = "/rpc/logs";
    const logStreamName = `rpc-${nodeName.toLowerCase()}`;
    const logs = await getLogs(logGroupName, logStreamName, 30, 30);

    res
      .status(200)
      .json({ nodeName, cloudWatch: { logGroupName, logStreamName }, logs });
  },
  getConsoleLogs: async (req, res, next) => {
    const { nodeName } = req.params;
    if (!nodeNames[nodeName]) {
      return res
        .status(422)
        .json({ message: "There is no node with the name: " + nodeName });
    }

    const logGroupName = "/rpc/console_logs";
    const logStreamName = `rpc-${nodeName.toLowerCase()}`;
    const logs = await getLogs(logGroupName, logStreamName, 30, 30);

    res
      .status(200)
      .json({ nodeName, cloudWatch: { logGroupName, logStreamName }, logs });
  },
};
