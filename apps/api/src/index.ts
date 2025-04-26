import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import configuration
import { config } from "./config/env";
import { logger, morganStream, skipHealthCheck } from "./config/logger";
import { corsOptions, rateLimiter, helmetConfig } from "./config/middleware";

// Import routes
import router from "./routes";

// App initialization
const app = express();
const port = config.port;

// Apply middleware
app.use(cors(corsOptions));
app.use(helmetConfig());

// Configure Morgan based on environment
if (config.isProduction) {
  // Use Apache combined format in production
  app.use(
    morgan("combined", {
      stream: morganStream,
      skip: skipHealthCheck,
    })
  );
} else {
  // Use developer-friendly format in development
  app.use(
    morgan("dev", {
      stream: morganStream,
      skip: skipHealthCheck,
    })
  );
}

app.use(express.json({ limit: "1mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimiter); // Apply rate limiting

// Trust proxy if behind reverse proxy like Nginx
if (config.isProduction) {
  app.set("trust proxy", 1);
}

// Register routes
app.use(router);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.url}`, {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    body: req.body,
  });

  res.status(500).json({
    message: "Internal Server Error",
    ...(config.nodeEnv === "development" && { error: err.message }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
