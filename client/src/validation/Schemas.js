import * as Yup from "yup";

// Job Schema
export const JobSchema = Yup.object({
  name: Yup.string().min(1).max(100).required("A job name is required."),
  desc: Yup.string().min(1).max(300).required("A job description is required."),
  type: Yup.string().min(1).max(100).required(),
  city: Yup.string().min(1).max(100).required(),
});
