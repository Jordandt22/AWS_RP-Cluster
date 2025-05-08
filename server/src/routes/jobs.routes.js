const jobsRouter = require("express-promise-router")();
const { submitJob } = require("../controllers/jobs.controller");
const { bodyValidator } = require("../middleware/validators");
const { JobDataSchema } = require("../schemas/jobs.schemas");

// Submit a Job
jobsRouter.post("/", bodyValidator(JobDataSchema), submitJob);

module.exports = jobsRouter;
