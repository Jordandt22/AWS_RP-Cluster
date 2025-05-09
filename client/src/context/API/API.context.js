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

  const submitJob = async (jobData, cb) => {
    showLoading("Submitting your new job...");
    const res = await axios.post(REACT_APP_API_URI + "/jobs", jobData);
    cb(res);
    closeLoading();
  };

  return (
    <APIContext.Provider value={{ submitJob }}>
      {props.children}
    </APIContext.Provider>
  );
};
