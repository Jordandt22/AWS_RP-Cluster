import React, { createContext, useContext } from "react";
import axios from "axios";

// Contexts
import { useGlobal } from "../global/Global.context";

// API Context
const APIContext = createContext();
export const useAPI = () => useContext(APIContext);
export const APIContextProvider = (props) => {
  const { REACT_APP_API_URI } = process.env;
  const { showLoading, closeLoading } = useGlobal();

  // Submit a Job
  const submitJob = async (jobData, cb) => {
    showLoading("Submitting your new job...");
    const res = await axios.post(REACT_APP_API_URI + "/jobs", jobData);
    cb(res);
    closeLoading();
  };

  // Get System Metrics
  const getSystemMetrics = async (curNode) => {
    const { name, type } = curNode;
    showLoading(`Getting System Metrics for ${name} (${type})...`);
    const res = await axios.get(REACT_APP_API_URI + `/logs/${name}/metrics`);
    closeLoading();

    return res;
  };

  // Get Console Logs
  const getConsoleLogs = async (curNode) => {
    const { name, type } = curNode;
    showLoading(`Getting Console Logs for ${name} (${type})...`);
    const res = await axios.get(REACT_APP_API_URI + `/logs/${name}/console`);
    closeLoading();

    return res;
  };

  // Get System Logs
  const getSystemLogs = async (curNode) => {
    const { name, type } = curNode;
    showLoading(`Getting System Logs for ${name} (${type})...`);
    const res = await axios.get(REACT_APP_API_URI + `/logs/${name}`);
    closeLoading();

    return res;
  };

  return (
    <APIContext.Provider
      value={{ submitJob, getSystemMetrics, getConsoleLogs, getSystemLogs }}
    >
      {props.children}
    </APIContext.Provider>
  );
};
