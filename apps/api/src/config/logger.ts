import winston from "winston";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === "production") {
  const logDir = path.join(__dirname, "../../logs");

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

// Create a stream object for Morgan to use
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Define skip function to avoid logging health check endpoints
const skipHealthCheck = (req: Request, res: Response) => {
  return req.url === "/health" || req.url === "/healthz";
};

export { logger, morganStream, skipHealthCheck };
