import React from "react";

// Components
import JobForm from "./JobForm";
import RPNodeInfo from "./RPNodeInfo";

function Home() {
  return (
    <div className="home-container">
      <div className="main-content row">
        <JobForm />
        <RPNodeInfo />
      </div>
    </div>
  );
}

export default Home;
