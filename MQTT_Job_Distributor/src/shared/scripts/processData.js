const os = require("os");
const crypto = require("crypto");
const { connectScriptMessenger } = require("../helpers/scriptMessenger");
const args = process.argv.slice(2);

// Parse the JSON string into an object
const JSONData = JSON.parse(args[0]);

function loadData() {
  const data = [];
  for (let i = 0; i < 50000; i++) {
    data.push({
      id: i,
      value: Math.random() * 1000,
      name: `Item-${i}`,
    });
  }
  return data;
}

function heavyComputation(data) {
  // Sort by value descending and hash top 1000 items
  const sorted = data.sort((a, b) => b.value - a.value);
  return sorted.slice(0, 1000).map((item) => {
    const hash = crypto.createHash("sha256").update(item.name).digest("hex");
    return { id: item.id, hash };
  });
}

async function processData() {
  console.time("Processing time");

  const data = loadData();
  const result = heavyComputation(data);

  console.timeEnd("Processing time");
  return { data, result };
}

// Example usage
processData().then((output) => {
  const { submitterNodeName } = JSONData;
  console.log("Result: ", output.result.slice(0, 5));
  connectScriptMessenger({
    workerDetails: {
      submitterNodeName,
      workerNodeName: os.hostname(),
    },
    jobData: JSONData.jobData,
    result: { arr: output.data, sortedArr: output.result },
  });
});
