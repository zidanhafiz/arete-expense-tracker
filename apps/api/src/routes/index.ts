import { Router, Request, Response } from "express";
import { checkJwt } from "../middlewares/auth.middlewares";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import path from "path";
import express from "express";
import expenseRoutes from "./expense.routes";
import categoryRoutes from "./category.routes";
import incomeRoutes from "./income.routes";
import sourceRoutes from "./source.routes";

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

// Protect routes
router.use("/api", checkJwt);

// User routes
router.use("/api/users", userRoutes);

// Expense routes
router.use("/api/expenses", expenseRoutes);

// Category routes
router.use("/api/categories", categoryRoutes);

// Income routes
router.use("/api/incomes", incomeRoutes);

// Source routes
router.use("/api/sources", sourceRoutes);

export default router;
