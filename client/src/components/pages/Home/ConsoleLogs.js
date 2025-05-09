import React from "react";
import { useQuery } from "@tanstack/react-query";

// Contexts
import { useUI } from "../../../context/UI/UI.context";
import { useAPI } from "../../../context/API/API.context";

function ConsoleLogs() {
  const { curNode } = useUI();
  const { getConsoleLogs } = useAPI();

  // Queries
  const { data, error, isLoading, isError } = useQuery({
    queryKey: [`CONSOLE_LOGS_${curNode.name}`],
    queryFn: () => getConsoleLogs(curNode),
    refetchInterval: 60 * 1000, // 1 min
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  const sortedLogs = data.data.logs.sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  return (
    <>
      <h2>System Console Logs</h2>

      <div className="console-logs">
        {sortedLogs.map((log) => {
          const { timestamp, message } = log;
          const date = new Date(timestamp);
          const options = {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          };

          return (
            <p key={message}>
              [{date.toLocaleString("en-US", options)}] {message.split("] ")[1]}
            </p>
          );
        })}
      </div>
    </>
  );
}

export default ConsoleLogs;
