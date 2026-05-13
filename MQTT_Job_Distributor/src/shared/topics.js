module.exports = {
  // *** JOB TOPICS ***
  CLUSTER_JOB_PENDING: "cluster/job_pending",
  CLUSTER_JOBS: "cluster/jobs",
  CLUSTER_JOB_SUBMITTED: "cluster/job_submitted",
  CLUSTER_RESULTS: "cluster/results",

  // *** GENERAL TOPICS ***
  CLUSTER_WORKER_REGISTRATION: "cluster/worker_registration",

  // *** LOGGING TOPICS ***
  CLUSTER_METRICS: "cluster/metrics",
  CLUSTER_LOGS: "cluster/logs",
  CLUSTER_CONSOLE: "cluster/console", // For sending the console log message to the Frontend for Live Console UI
  CLUSTER_CONSOLE_LOGS: "cluster/console_logs", // For pushing the console log messsages to CloudWatch
};
