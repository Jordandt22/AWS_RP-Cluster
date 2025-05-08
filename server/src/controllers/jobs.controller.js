const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } =
  process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  submitJob: async (req, res, next) => {
    const { jobDetails, data } = req.body;
    const jobID = uuidv4();
    const timestamp = new Date().toISOString();
    const job = {
      jobDetails: {
        ...jobDetails,
        jobID,
        timestamp,
      },
      data,
    };
    const fileName = `${timestamp}_${jobID}/job.json`;

    // Store the new job folder in the jobs directory in the S3 Bucket
    await s3.send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: `jobs/${fileName}`,
        Body: JSON.stringify(job, null, 2),
        ContentType: "application/json",
      })
    );

    res.status(200).json({ job });
  },
};
