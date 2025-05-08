const Yup = require("yup");

// Job Data Schema
const JobDataSchema = Yup.object({
  jobDetails: Yup.object({
    name: Yup.string().min(3).max(100).required(),
    slurmFile: Yup.string().min(1).max(20).required(),
  }).required(),
  data: Yup.object().required(),
});

// Node Name Schema
const NodeNameSchema = Yup.object({
  nodeName: Yup.string().min(6).max(10).required(),
});

module.exports = { JobDataSchema, NodeNameSchema };
