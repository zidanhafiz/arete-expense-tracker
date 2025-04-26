import dotenv from "dotenv";

dotenv.config({
  path: [".env.local", ".env", ".env.development", ".env.production"],
});

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3002,
  isProduction: process.env.NODE_ENV === "production",
  logLevel: process.env.LOG_LEVEL || "info",
  clientUrl: process.env.CLIENT_URL || "*",
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};
