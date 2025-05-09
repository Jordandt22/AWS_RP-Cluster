import React from "react";

// Components
import { APIContextProvider } from "./API/API.context";
import { GlobalContextProvider } from "./global/Global.context";

function ContextProvider(props) {
  return (
    <GlobalContextProvider>
      <APIContextProvider>{props.children}</APIContextProvider>;
    </GlobalContextProvider>
  );
}

export default ContextProvider;
