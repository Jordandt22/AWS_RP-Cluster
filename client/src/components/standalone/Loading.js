import React from "react";

// Contexts
import { useGlobal } from "../../context/global/Global.context";

function Loading() {
  const {
    state: {
      loading: { show, message },
    },
  } = useGlobal();
  return (
    <>
      {show && (
        <div className="loading-container center">
          <div className="center-vertical">
            <span className="loader"></span>
            <p>{message}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Loading;
