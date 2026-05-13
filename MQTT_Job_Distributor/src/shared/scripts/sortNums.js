const os = require("os");
const { connectScriptMessenger } = require("../helpers/scriptMessenger");
const args = process.argv.slice(2);

// Parse the JSON string into an object
const JSONData = JSON.parse(args[0]);

function sortGreatestToLeast(arr) {
  const newArr = arr;
  newArr.sort((a, b) => b - a);
  return newArr;
}

function sortLeastToGreatest(arr) {
  const newArr = arr;
  newArr.sort((a, b) => a - b);
  return newArr;
}

const {
  submitterNodeName,
  jobData: {
    data: { nums, isGreatestToLeast },
  },
} = JSONData;
let sortedArr;
if (isGreatestToLeast) {
  sortedArr = sortGreatestToLeast(nums);
  console.log("Sorted Arr (Greatest to Least): " + sortedArr);
} else {
  sortedArr = sortLeastToGreatest(nums);
  console.log("Sorted Arr (Least to Greatest): " + sortedArr);
}

connectScriptMessenger({
  workerDetails: {
    submitterNodeName,
    workerNodeName: os.hostname(),
  },
  jobData: JSONData.jobData,
  result: { sortedArr },
});
