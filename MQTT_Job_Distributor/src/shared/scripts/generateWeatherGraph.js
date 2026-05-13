require("dotenv").config();
const os = require("os");
const fs = require("fs");
const axios = require("axios");
const QuickChart = require("quickchart-js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { connectScriptMessenger } = require("../helpers/scriptMessenger");
const args = process.argv.slice(2);
const { API_AWS_ACCESS_KEY_ID, API_AWS_SECRET_ACCESS_KEY, WEATHER_API_KEY } =
  process.env;

// Parse the JSON string into an object
const JSONData = JSON.parse(args[0]);
const {
  submitterNodeName,
  jobData: {
    jobDetails: { jobID },
    data: { city },
  },
} = JSONData;

// AWS credentials (make sure your credentials are set up correctly, either via IAM role or environment variables)
const s3Client = new S3Client({
  region: "us-west-1",
  credentials: {
    accessKeyId: API_AWS_ACCESS_KEY_ID,
    secretAccessKey: API_AWS_SECRET_ACCESS_KEY,
  },
});

// Get Weather Data
async function fetchWeatherData() {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=5&aqi=no&alerts=no`;

  const response = await axios.get(url);
  return response.data.forecast.forecastday.map((day) => ({
    date: day.date,
    temp: day.day.avgtemp_c,
  }));
}

// Generate the chart
(async () => {
  try {
    const data = await fetchWeatherData();
    const labels = data.map((d) => d.date);
    const temps = data.map((d) => d.temp);

    // Configure chart
    const chart = new QuickChart();
    chart.setConfig({
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Avg Temp (°C)",
            data: temps,
          },
        ],
      },
    });
    chart.setWidth(500).setHeight(300);

    // Save chart to local file
    const path = `/mnt/shared/code/MQTT_Job_Distributor/src/shared/charts/chart_${jobID}.png`;
    await chart.toFile(path);
    console.log("Chart generated and saved locally.");

    // Upload to S3
    const fileContent = fs.readFileSync(path);
    await s3Client.send(
      new PutObjectCommand({
        Bucket: "rpc-weather",
        Key: `charts/chart_${jobID}.png`,
        Body: fileContent,
        ContentType: "image/png",
      })
    );
    console.log("File uploaded successfully.");

    // Optionally delete local file
    fs.unlinkSync(path);
    console.log("Local file deleted.");

    // Send result
    connectScriptMessenger({
      workerDetails: {
        submitterNodeName,
        workerNodeName: os.hostname(),
      },
      jobData: JSONData.jobData,
      result: {
        data,
        s3: { bucket: "rpc-weather", key: `charts/chart_${jobID}.png` },
      },
    });
  } catch (err) {
    console.error("Error:", err);
  }
})();
