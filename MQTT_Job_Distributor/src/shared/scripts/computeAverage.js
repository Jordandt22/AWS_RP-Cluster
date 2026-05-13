const os = require("os");
const { connectScriptMessenger } = require("../helpers/scriptMessenger");
const args = process.argv.slice(2);

// Parse the JSON string into an object
const JSONData = JSON.parse(args[0]);

function computeAverage(arr) {
  let avg = 0;
  const sum = arr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  avg = sum / arr.length;
  return avg;
}

const {
  submitterNodeName,
  jobData: {
    data: { nums },
  },
} = JSONData;
let averageVal = computeAverage(nums);
console.log("Average Value of the array is: " + averageVal);

connectScriptMessenger({
  workerDetails: {
    submitterNodeName,
    workerNodeName: os.hostname(),
  },
  jobData: JSONData.jobData,
  result: { sortedArr },
});
