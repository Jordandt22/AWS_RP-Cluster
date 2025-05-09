import React from "react";
import { useFormik } from "formik";

// MISC
import { cities } from "../../../misc/cities";
import { JobSchema } from "../../../validation/Schemas";

// Contexts
import { useAPI } from "../../../context/API/API.context";
import { useUI } from "../../../context/UI/UI.context";
import { useGlobal } from "../../../context/global/Global.context";

const checkError = (formik, name) => {
  return formik.errors[name] && formik.touched[name];
};

function JobForm() {
  const { submitJob } = useAPI();
  const { curNode } = useUI();
  const { systemMetrics } = useGlobal();
  const formik = useFormik({
    initialValues: {
      name: "",
      desc: "",
      type: "generateWeatherGraph",
      city: "San Jose",
    },
    validationSchema: JobSchema,
    onSubmit: async (values, { resetForm }) => {
      const { name, desc, type, city } = values;
      await submitJob(
        {
          jobDetails: { name, desc, slurmFile: type },
          data: { city },
        },
        (res) => {
          resetForm();
          systemMetrics.refetch();
        }
      );
    },
  });

  const potentialJobs = [
    {
      value: "generateWeatherGraph",
      label: "Generate Weather Graph",
    },
  ];

  return (
    <div className="job-form-container">
      <form onSubmit={formik.handleSubmit}>
        <h1 className="job-form__title">Submit a Job</h1>

        {/* Job Name */}
        <div key="JobName" className="job-form__input">
          <label htmlFor="name">Job Name</label>
          <input
            name="name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.name}
            placeholder="Create a name..."
          />
          {checkError(formik, "name") && (
            <p className="job-form__error">{formik.errors.name}</p>
          )}
        </div>

        {/* Job Desc */}
        <div key="JobDesc" className="job-form__input">
          <label htmlFor="desc">Job Description</label>
          <textarea
            name="desc"
            rows="4"
            cols="50"
            onChange={formik.handleChange}
            value={formik.values.desc}
            placeholder="Enter a description..."
          ></textarea>
          {checkError(formik, "desc") && (
            <p className="job-form__error">{formik.errors.desc}</p>
          )}
        </div>

        {/* Job Type */}
        <div key="JobType" className="job-form__input">
          <label htmlFor="type">Job Type</label>
          <select
            name="type"
            onChange={formik.handleChange}
            value={formik.values.type}
          >
            {potentialJobs.map((job) => {
              const { value, label } = job;

              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          {checkError(formik, "type") && (
            <p className="job-form__error">{formik.errors.type}</p>
          )}
        </div>

        {/* City */}
        <div key="City" className="job-form__input">
          <label htmlFor="city">Major U.S. Cities</label>
          <select
            name="city"
            onChange={formik.handleChange}
            value={formik.values.city}
          >
            {cities.map((job) => {
              const { value, label } = job;

              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          {checkError(formik, "city") && (
            <p className="job-form__error">{formik.errors.city}</p>
          )}
        </div>

        <div className="row">
          <button type="submit" className="job-form__submit">
            Submit
          </button>

          <button
            type="button"
            className="job-form__reset"
            onClick={formik.resetForm}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobForm;
