const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "ERROR" : "INFO";
    logger.info(
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
