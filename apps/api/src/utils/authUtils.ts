import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { logger } from "../config/logger";

export const generateAccessToken = (userId: string): string => {
  const secretKey = process.env.SECRET_ACCESS_KEY;

  if (!secretKey) {
    throw new Error("SECRET_ACCESS_KEY is not defined");
  }

  const options: SignOptions = {
    expiresIn: "7d",
    algorithm: "HS256",
  };

  const payload = {
    userId,
  };

  const token = jwt.sign(payload, secretKey, options);

  return token;
};

export const generateRefreshToken = (userId: string): string => {
  const refreshSecret = process.env.SECRET_REFRESH_KEY;

  if (!refreshSecret) throw new Error("SECRET_REFRESH_KEY is not defined");

  const options: SignOptions = {
    expiresIn: "30d",
    algorithm: "HS256",
  };

  const payload = {
    userId,
  };

  return jwt.sign(payload, refreshSecret, options);
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const secretKey = process.env.SECRET_ACCESS_KEY;

    if (!secretKey) throw new Error("SECRET_ACCESS_KEY is not defined");

    const options: VerifyOptions = {
      algorithms: ["HS256"],
    };

    return jwt.verify(token, secretKey, options) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.error("Invalid token");
    }
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const refreshSecret = process.env.SECRET_REFRESH_KEY;

    if (!refreshSecret) throw new Error("SECRET_REFRESH_KEY is not defined");

    const options: VerifyOptions = {
      algorithms: ["HS256"],
    };

    return jwt.verify(token, refreshSecret, options) as JwtPayload;
  } catch (error) {
    logger.error("Invalid token");
    return null;
  }
};
