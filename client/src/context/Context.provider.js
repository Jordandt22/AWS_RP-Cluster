import React from "react";

// Components
import { APIContextProvider } from "./API/API.context";
import { GlobalContextProvider } from "./global/Global.context";
import { UIContextProvider } from "./UI/UI.context";

function ContextProvider(props) {
  return (
    <GlobalContextProvider>
      <UIContextProvider>
        <APIContextProvider>{props.children}</APIContextProvider>
      </UIContextProvider>
    </GlobalContextProvider>
  );
}

export default ContextProvider;
