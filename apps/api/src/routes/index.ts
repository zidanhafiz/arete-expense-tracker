import { Router, Request, Response } from "express";
import { checkJwt } from "../middlewares/auth.middlewares";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import path from "path";
import express from "express";
import expenseRoutes from "./expense.routes";

const router: Router = Router();

// Home endpoint
router.get("/", (req: Request, res: Response) => {
  res.send("API is running 🚀");
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running 🚀" });
});

// Serve static files from uploads folder
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/api/users", checkJwt, userRoutes);

// Expense routes
router.use("/api/expenses", checkJwt, expenseRoutes);

export default router;
