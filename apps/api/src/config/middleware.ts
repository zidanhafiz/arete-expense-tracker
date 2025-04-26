import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { CorsOptions } from "cors";
import { RateLimitRequestHandler } from "express-rate-limit";

// CORS configuration
const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL || "*", // Restrict to your frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

// Rate limiter configuration
const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Export helmet directly (no need for variable assignment)
export { corsOptions, rateLimiter, helmet as helmetConfig };
