const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error:", err);

  let error = {
    success: false,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
  };

  if (err.name === "ValidationError") {
    error.message = "Validation error";
    error.details = err.message;
    return res.status(400).json(error);
  }

  if (err.name === "CastError") {
    error.message = "Invalid data format";
    return res.status(400).json(error);
  }

  if (err.code === "ENOENT") {
    error.message = "File or directory not found";
    return res.status(404).json(error);
  }

  if (err.code === "EACCES") {
    error.message = "Permission denied";
    return res.status(403).json(error);
  }

  if (process.env.NODE_ENV === "development") {
    error.stack = err.stack;
    error.details = err.message;
  }

  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
