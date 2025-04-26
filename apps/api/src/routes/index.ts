import { Router } from "express";
import { checkJwt } from "../config/auth";

const router: Router = Router();

// Public routes
router.get("/", (req, res) => {
  res.send("API is running");
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Protected routes
router.get("/protected", checkJwt, (req, res) => {
  res.send("Protected route");
});

// Add more routes or import from other files
// Example:
// import userRoutes from "./user.routes";
// router.use("/users", userRoutes);

export default router;
