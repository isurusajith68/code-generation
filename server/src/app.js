const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const codeGenerationRoutes = require("./routes/code-generation-routes");
const healthRoutes = require("./routes/health-routes");

const errorHandler = require("./middleware/error-handler");
const requestLogger = require("./middleware/request-logger");
const   systemAdminRouter  = require("./routes/system-admin-router");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:2555",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Code Generation API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/code-generation", codeGenerationRoutes);
app.use("/api/sys", systemAdminRouter);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      // "GET /",
      // "GET /api/health",
      // "POST /api/code-generation/replace-files",
      // "GET /api/code-generation/project-structure",
    ],
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server Information:");
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log(
    `🎯 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log("📋 Available endpoints:");
  console.log("   GET  / - Server status");
  console.log("   GET  /api/health - Health check");
  console.log(
    "   POST /api/code-generation/replace-files - Replace generated files"
  );
  console.log(
    "   GET  /api/code-generation/project-structure - Get project structure"
  );
  console.log("");
});

module.exports = app;
