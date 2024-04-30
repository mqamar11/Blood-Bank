const winston = require("winston");
require("winston-daily-rotate-file");

module.exports = () => {
  const transport = new winston.transports.DailyRotateFile({
    filename: __dirname + "/../../logs/%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d", //If you set maxFiles:3d, it will delete all log files created in the last 3 days.
  });

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      // winston.format.printf(i => `${i.message}${i.stack} \r\n ${i.timestamp} \r\n`),
      winston.format.printf(
        (i) =>
          `{"level": "${i.level}", "message": "${i.message}", \r\n "stack": "${i.stack}", \r\n "timestamp":  "${i.timestamp}" \r\n}`
      )
    ),
    transports: [transport],
  });

  process.on("uncaughtException", (ex) => {
    // winston.error(ex.message, ex);
    logger.error(ex.message, ex);
  });

  process.on("unhandledRejection", (ex) => {
    // winston.error(ex.message, ex);
    logger.error(ex.message, ex);
  });

  process.on("warning", (warning) => {
    logger.warn(warning.stack);
  });

  //winston, to save errors in log file
  // winston.add(new winston.transports.File({ filename: './logs/logFile.log', level: 'error' }));

  return logger;
};
