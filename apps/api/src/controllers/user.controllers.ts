import User from "../models/user.models";
import { Request, Response } from "express";
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from "../utils/userSchemas";
import { logger } from "../config/logger";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/authUtils";
import { handleError } from "../utils/errorHandling";
import {
  deleteImage,
  getImageUrl,
  uploadImage,
} from "../utils/cloudinaryUtils";

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
    logger.error(`Error registering user: ${error}`);
    handleError(error, res);
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
    logger.error(`Error logging in user: ${error}`);
    handleError(error, res);
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
    handleError(error, res);
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

    if (user.avatar) {
      user.avatar = await getImageUrl(user.avatar);
    }

    res.status(200).json({ message: "User fetched successfully", data: user });
  } catch (error) {
    logger.error(`Error getting user: ${error}`);
    handleError(error, res);
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { first_name, last_name, nickname, password } =
      updateUserSchema.parse(req.body);

    if (!first_name && !last_name && !nickname && !password) {
      res.status(400).json({ message: "At least one field must be provided" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        first_name: first_name || user?.first_name,
        last_name: last_name || user?.last_name,
        nickname: nickname || user?.nickname,
        password: password || user?.password,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    logger.error(`Error updating user: ${error}`);
    handleError(error, res);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);

    if (user?.avatar) {
      await deleteImage(user.avatar);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting user: ${error}`);
    handleError(error, res);
  }
};

const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { file } = req;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const userAvatar = await User.findById(userId).select("avatar");

    if (userAvatar?.avatar) {
      await deleteImage(userAvatar.avatar);
    }

    const imageUrl = await uploadImage(file, "avatar");

    await User.findByIdAndUpdate(userId, { avatar: imageUrl });

    res.status(200).json({ message: "Avatar uploaded successfully" });
  } catch (error) {
    logger.error(`Error uploading avatar: ${error}`);
    handleError(error, res);
  }
};

const userController = {
  registerUser,
  loginUser,
  refreshToken,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
};

export default userController;
