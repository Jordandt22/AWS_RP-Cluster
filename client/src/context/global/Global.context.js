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

  const [systemMetrics, setSystemMetrics] = useState({ refetch: null });
  const [consoleLogs, setConsoleLogs] = useState({ refetch: null });

  return (
    <GlobalContext.Provider
      value={{
        state,
        showLoading,
        closeLoading,
        systemMetrics,
        setSystemMetrics,
        consoleLogs,
        setConsoleLogs,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};
