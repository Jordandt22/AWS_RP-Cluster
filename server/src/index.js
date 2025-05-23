require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const rateLimiter = require("express-rate-limit");
const slowDown = require("express-slow-down");
const app = express();

// Middleware
const { NODE_ENV, WEB_URL } = process.env;
const notProduction = NODE_ENV !== "production";
app.use(helmet());
app.use(
  cors({
    origin: notProduction ? "http://localhost:3000" : WEB_URL,
  })
);
app.use(express.json());
if (notProduction) {
  app.use(morgan("dev"));
} else {
  app.enable("trust proxy");
  app.set("trust proxy", 1);
}

// Rate & Speed Limiter Info
const timeLimit = 1000 * 60 * 15;
const maxReq = 200;
const limiter = rateLimiter({
  windowMs: timeLimit,
  max: maxReq,
});
const speedLimiter = slowDown({
  windowMs: timeLimit,
  delayAfter: maxReq / 2,
  delayMs: () => 500,
});

// Rate & Speed Limiters
app.use(speedLimiter);
app.use(limiter);

// Landing Page Route
app.get("/", (req, res) => {
  res.send("Raspberry PI Cluster API is Up and Running !");
});

// ---- API Routes ----

// Routes for Jobs
app.use(
  `/v${process.env.API_VERSION}/api/jobs`,
  require("./routes/jobs.routes")
);

// Routes for Logging and Monitoring
app.use(
  `/v${process.env.API_VERSION}/api/logs`,
  require("./routes/logs.routes")
);

// PORT and Sever
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`CORS Enabled Server, Listening to port: ${PORT}...`);
});

// Export the Express API
module.exports = server;
