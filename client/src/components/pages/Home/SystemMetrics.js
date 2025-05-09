import React from "react";
import { useQuery } from "@tanstack/react-query";

// Contexts
import { useUI } from "../../../context/UI/UI.context";
import { useAPI } from "../../../context/API/API.context";
import { useGlobal } from "../../../context/global/Global.context";

const convertToGB = (bytes) => {
  const val = Number(bytes) / 1073741824;
  return `${val.toFixed(3)} GB`;
};

function SystemMetrics() {
  const { curNode } = useUI();
  const { getSystemMetrics } = useAPI();
  const { setSystemMetrics } = useGlobal();

  // Queries
  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: [`SYSTEM_METRICS_${curNode.name}`],
    queryFn: () => getSystemMetrics(curNode),
    refetchInterval: 30 * 1000, // 30s
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  const numOfCores = 4;
  const sortedMetricsArr = data.data.metrics.sort(
    (a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp)
  );
  if (sortedMetricsArr.length <= 0) {
    return <div>Loading...</div>;
  }

  const {
    cpuLoad1m,
    memoryFree,
    memoryTotal,
    memoryUsagePercent,
    memoryUsed,
    timestamp,
  } = sortedMetricsArr[0]?.data;
  const metrics = [
    {
      label: "CPU Load",
      value: (cpuLoad1m / numOfCores) * 100,
      type: "percentage",
    },
    {
      label: "Memory (Ram) Free",
      value: convertToGB(memoryFree),
      type: "text",
    },
    {
      label: "Memory (Ram) Total",
      value: convertToGB(memoryTotal),
      type: "text",
    },
    {
      label: "Memory (Ram) Used",
      value: memoryUsagePercent,
      extra: memoryUsed,
      type: "percentage",
    },
  ];
  const date = new Date(timestamp);
  const options = {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  setSystemMetrics({ refetch });
  return (
    <>
      <h2>
        System Metrics <span>({date.toLocaleString("en-US", options)})</span>
      </h2>

      <div className="system-metrics">
        {metrics.map((metric) => {
          const { label, value, type } = metric;

          return (
            <div key={label} className="system-metrics__box">
              <h3>{label}</h3>
              {type === "text" ? (
                <p>{value}</p>
              ) : (
                <div className="row">
                  <div className="percent-bar">
                    <div
                      style={{ width: `${value}%` }}
                      className="progress"
                    ></div>
                  </div>
                  <p>{value}%</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default SystemMetrics;
