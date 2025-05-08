const {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } =
  process.env;

const cloudwatchLogs = new CloudWatchLogsClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  getLogs: async (logGroupName, logStreamPrefix = null, limit, minsAgo) => {
    try {
      const startTime = Date.now() - minsAgo * 60 * 1000;
      const endTime = Date.now();

      // Get the [limit] most recent logs from [minsAgo] minutes ago to now
      const response = await cloudwatchLogs.send(
        new FilterLogEventsCommand({
          logGroupName,
          logStreamNamePrefix: logStreamPrefix,
          startTime,
          endTime,
          limit, // Max number of log events
        })
      );
      return response.events.map((event) => ({
        timestamp: new Date(event.timestamp).toISOString(),
        message: event.message,
      }));
    } catch (err) {
      console.error("Error fetching logs:", err);
      throw err;
    }
  },
};
