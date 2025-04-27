import { Router, Request, Response } from "express";
import { checkJwt } from "../middlewares/auth.middlewares";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import path from "path";
import express from "express";

const router: Router = Router();

// Public routes
router.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀");
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running 🚀" });
});

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/api/users", checkJwt, userRoutes);

// Serve static files from uploads folder
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Protected routes
router.get("/protected", checkJwt, (req: Request, res: Response) => {
  res.send("Protected route");
});

export default router;
