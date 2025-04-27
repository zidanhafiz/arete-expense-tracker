import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import { checkJwt } from "../middlewares/auth.middlewares";

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

// Protected routes
router.get("/protected", checkJwt, (req: Request, res: Response) => {
  res.send("Protected route");
});

export default router;
