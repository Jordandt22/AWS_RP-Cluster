import React, { createContext, useContext, useState } from "react";

// UI Context
const UIContext = createContext();
export const useUI = () => useContext(UIContext);
export const UIContextProvider = (props) => {
  const [curNode, setNode] = useState({ name: "node04", type: "Master" });
  const switchNode = (node) => setNode(node);

  const nodes = [
    {
      name: "node04",
      type: "Master",
    },
    {
      name: "node03",
      type: "Worker",
    },
    {
      name: "node02",
      type: "Worker",
    },
  ];

  return (
    <UIContext.Provider value={{ curNode, nodes, switchNode }}>
      {props.children}
    </UIContext.Provider>
  );
};
