import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/authUtils";
import { logger } from "../config/logger";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    logger.error("No token provided");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    logger.error("Invalid token");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.userId = decoded.userId;
  next();
};
