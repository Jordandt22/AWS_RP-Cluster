import React from "react";

// Contexts
import { useUI } from "../../../context/UI/UI.context";

// Components
import SystemMetrics from "./SystemMetrics";
import ConsoleLogs from "./ConsoleLogs";
import SystemLogs from "./SystemLogs";

function RPNodeInfo() {
  const { curNode, nodes, switchNode } = useUI();

  return (
    <div className="node-info-container">
      <h1>Raspberry PI Cluster Information</h1>
      {/* Nodes */}
      <div className="node-info__nodes row">
        {nodes.map((node) => {
          const { name, type } = node;
          const isActive = curNode.name === name;

          return (
            <button
              type="button"
              key={name}
              className={`node-info__node ${
                isActive ? "node-info__active" : ""
              }`}
              onClick={() => switchNode(node)}
            >
              {name} ({type})
            </button>
          );
        })}
      </div>

      {/* System Metrics */}
      <SystemMetrics />

      {/* Console Logs */}
      <ConsoleLogs />

      {/* System Logs */}
      <SystemLogs />
    </div>
  );
}

export default RPNodeInfo;
