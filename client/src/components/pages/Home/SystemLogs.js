import React from "react";
import { useQuery } from "@tanstack/react-query";

// Contexts
import { useUI } from "../../../context/UI/UI.context";
import { useAPI } from "../../../context/API/API.context";

function SystemLogs() {
  const { curNode } = useUI();
  const { getSystemLogs } = useAPI();

  // Queries
  const { data, error, isLoading, isError } = useQuery({
    queryKey: [`SYSTEM_LOGS_${curNode.name}`],
    queryFn: () => getSystemLogs(curNode),
    refetchInterval: 180 * 1000, // 3 mins
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

      <div className="system-logs">
        {sortedLogs.map((log) => {
          const { message } = log;

          return <p>{message}</p>;
        })}
      </div>
    </>
  );
}

export default SystemLogs;
