import React, { createContext, useContext, useState } from "react";

// Global Context
const GlobalContext = createContext();
export const useGlobal = () => useContext(GlobalContext);
export const GlobalContextProvider = (props) => {
  const [state, setState] = useState({
    loading: {
      show: false,
      message: "Loading...",
    },
  });

  const showLoading = (message) =>
    setState((curState) => ({
      ...curState,
      loading: { ...curState.loading, show: true, message },
    }));
  const closeLoading = () =>
    setState((curState) => ({
      ...curState,
      loading: { ...curState.loading, show: false, message: "Loading..." },
    }));

  return (
    <GlobalContext.Provider value={{ state, showLoading, closeLoading }}>
      {props.children}
    </GlobalContext.Provider>
  );
};
