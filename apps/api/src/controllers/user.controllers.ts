import User from "../models/user.models";
import { Request, Response } from "express";
import { loginUserSchema, registerUserSchema } from "../utils/userSchemas";
import { logger } from "../config/logger";
import { z } from "zod";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/authUtils";

const registerUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, nickname, email, password } =
      registerUserSchema.parse(req.body);

    const user = new User({
      first_name,
      last_name,
      nickname,
      email,
      password,
    });

    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    logger.info(`User registered successfully: ${user._id}`);
    res.status(201).json({
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`Error registering user: ${error.name}`);
      res
        .status(400)
        .json({ message: "Invalid request data", errors: error.format() });
      return;
    }

    logger.error(`Error registering user: ${error}`);
    res.status(500).json({ message: "Error registering user", errors: error });
    return;
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    logger.info(`User logged in successfully: ${user._id}`);
    res.status(200).json({
      message: "User logged in successfully",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error(`Error logging in user: ${error.name}`);
      res
        .status(400)
        .json({ message: "Invalid request data", errors: error.format() });
      return;
    }
    logger.error(`Error logging in user: ${error}`);
    res.status(500).json({ message: "Error logging in user", errors: error });
  }
};

const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    const decoded = verifyRefreshToken(refresh_token);

    if (!decoded) {
      res.status(400).json({ message: "Invalid refresh token" });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.status(200).json({
      message: "Token refreshed successfully",
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    logger.error(`Error refreshing token: ${error}`);
    res.status(500).json({ message: "Error refreshing token", errors: error });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User fetched successfully", data: user });
  } catch (error) {
    logger.error(`Error getting user: ${error}`);
    res.status(500).json({ message: "Error getting user", errors: error });
  }
};

const userController = {
  registerUser,
  loginUser,
  getUser,
  refreshToken,
};

export default userController;
