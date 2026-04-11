import { createLogger, format, transports } from 'winston';

// Create the logger instance
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    new transports.Console(),
    // Write all errors to error.log
    new transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to combined.log
    new transports.File({ filename: "logs/combined.log" })
  ],
  exceptionHandlers: [
    new transports.File({ filename: "logs/exceptions.log" })
  ]
});

// Add colorized console output for development
if (process.env.ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }));
}

// Named export to match your import { logger } in app.js
export { logger };