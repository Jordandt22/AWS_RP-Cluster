const logsRouter = require("express-promise-router")();
const {
  getSystemMetrics,
  getSystemLogs,
  getConsoleLogs,
} = require("../controllers/logs.controller");
const { paramsValidator } = require("../middleware/validators");
const { NodeNameSchema } = require("../schemas/jobs.schemas");

// Get system metrics for a specific node
logsRouter.get(
  "/:nodeName/metrics",
  paramsValidator(NodeNameSchema),
  getSystemMetrics
);

// Get system logs for a specific node
logsRouter.get("/:nodeName", paramsValidator(NodeNameSchema), getSystemLogs);

// Get console logs for a specific node
logsRouter.get(
  "/:nodeName/console",
  paramsValidator(NodeNameSchema),
  getConsoleLogs
);

module.exports = logsRouter;
