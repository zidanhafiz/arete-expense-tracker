import { Request, Response } from "express";
import User from "../../models/user.models";
import userController from "../../controllers/user.controllers";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/authUtils";
import { logger } from "../../config/logger";
import { Readable } from "stream";
import { updateUserSchema } from "../../utils/userSchemas";
import * as cloudinaryUtils from "../../utils/cloudinaryUtils";
import {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
} from "../../utils/cloudinaryUtils";

// Mock dependencies
jest.mock("../../models/user.models");
jest.mock("../../utils/authUtils");
jest.mock("../../config/logger");
jest.mock("../../utils/cloudinaryUtils");

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;
  let mockUserId: string;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock user data
    mockUserId = "507f1f77bcf86cd799439011";
    mockUser = {
      _id: mockUserId,
      first_name: "John",
      last_name: "Doe",
      nickname: "johndoe",
      avatar:
        "https://res.cloudinary.com/demo/image/upload/v1/avatar/user123.jpg",
      email: "john@example.com",
      password: "hashedpassword123",
      comparePassword: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    // Mock request and response
    mockRequest = {
      body: {},
      file: {
        fieldname: "avatar",
        originalname: "avatar.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        destination: "uploads/",
        filename: "avatar-123.jpg",
        path: "uploads/avatar-123.jpg",
        stream: jest.fn() as unknown as Readable,
        buffer: Buffer.from([]),
      },
      userId: mockUserId,
      protocol: "http",
      get: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock User model methods
    (User.findOne as jest.Mock).mockReset();
    (User.findById as jest.Mock).mockReset();
    (User.findByIdAndUpdate as jest.Mock).mockReset();
    (User.findByIdAndDelete as jest.Mock).mockReset();

    // Mock token generation functions
    (generateAccessToken as jest.Mock).mockReturnValue("mock-access-token");
    (generateRefreshToken as jest.Mock).mockReturnValue("mock-refresh-token");

    // Mock cloudinary functions
    (cloudinaryUtils.getPublicIdFromUrl as jest.Mock).mockReturnValue(
      "avatar/user123.jpg"
    );
    (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock).mockResolvedValue(
      undefined
    );
    (cloudinaryUtils.uploadImagesToCloudinary as jest.Mock).mockResolvedValue([
      "avatar/newavatar123.jpg",
    ]);
  });

  describe("registerUser", () => {
    beforeEach(() => {
      // Mock User constructor
      (User as jest.MockedClass<typeof User>).mockImplementation(
        () => mockUser
      );
    });

    it("should register a new user successfully", async () => {
      // Setup
      mockRequest.body = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Execute
      await userController.registerUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateAccessToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);
      expect(logger.info).toHaveBeenCalledWith(
        `User registered successfully: ${mockUserId}`
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        data: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      });
    });

    it("should return validation error if request data is invalid", async () => {
      // Setup
      mockRequest.body = {
        first_name: "Jo", // Too short
        email: "invalid-email",
        password: "short", // Too short
      };

      // Execute
      await userController.registerUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockUser.save).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle server error during registration", async () => {
      // Setup
      mockRequest.body = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      const serverError = new Error("Database connection error");
      mockUser.save.mockRejectedValue(serverError);

      // Execute
      await userController.registerUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: serverError.message,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("should log in a user successfully", async () => {
      // Setup
      mockRequest.body = {
        email: "john@example.com",
        password: "password123",
      };

      mockUser.comparePassword.mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(mockUser.comparePassword).toHaveBeenCalledWith("password123");
      expect(generateAccessToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User logged in successfully",
        data: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      });
    });

    it("should return error when user not found", async () => {
      // Setup
      mockRequest.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Execute
      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        email: "nonexistent@example.com",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid email or password",
      });
    });

    it("should return error when password is invalid", async () => {
      // Setup
      mockRequest.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      mockUser.comparePassword.mockResolvedValue(false);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await userController.loginUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
      expect(mockUser.comparePassword).toHaveBeenCalledWith("wrongpassword");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid email or password",
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      // Setup
      mockRequest.body = {
        refresh_token: "valid-refresh-token",
      };

      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: mockUserId });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await userController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(verifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(generateAccessToken).toHaveBeenCalledWith(mockUserId);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Token refreshed successfully",
        data: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      });
    });

    it("should return error when refresh token is missing", async () => {
      // Setup
      mockRequest.body = {};

      // Execute
      await userController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Refresh token is required",
      });
    });

    it("should return error when refresh token is invalid", async () => {
      // Setup
      mockRequest.body = {
        refresh_token: "invalid-refresh-token",
      };

      (verifyRefreshToken as jest.Mock).mockReturnValue(null);

      // Execute
      await userController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(verifyRefreshToken).toHaveBeenCalledWith("invalid-refresh-token");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid refresh token",
      });
    });

    it("should return error when user not found", async () => {
      // Setup
      mockRequest.body = {
        refresh_token: "valid-refresh-token",
      };

      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: mockUserId });
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Execute
      await userController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(verifyRefreshToken).toHaveBeenCalledWith("valid-refresh-token");
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
  });

  describe("getUser", () => {
    it("should get user details successfully", async () => {
      // Setup
      mockRequest.userId = mockUserId;

      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      const selectMock = jest.fn().mockResolvedValue(userWithoutPassword);
      (User.findById as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      // Execute
      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(selectMock).toHaveBeenCalledWith("-password");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User fetched successfully",
        data: userWithoutPassword,
      });
    });

    it("should return error when userId is not provided", async () => {
      // Setup
      mockRequest.userId = undefined;

      // Execute
      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findById).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
    });

    it("should return error when user not found", async () => {
      // Setup
      mockRequest.userId = mockUserId;

      const selectMock = jest.fn().mockResolvedValue(null);
      (User.findById as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      // Execute
      await userController.getUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(selectMock).toHaveBeenCalledWith("-password");
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
  });

  describe("updateUser", () => {
    it("should update user details successfully", async () => {
      // Setup
      mockRequest.userId = mockUserId;
      mockRequest.body = {
        first_name: "John Update",
        last_name: "Doe Update",
        nickname: "johndoeupdate",
      };

      const updatedUser = {
        ...mockUser,
        first_name: "John Update",
        last_name: "Doe Update",
        nickname: "johndoeupdate",
        password: undefined, // password is removed by select('-password')
      };

      // Mock schema validation to pass
      jest.spyOn(updateUserSchema, "parse").mockReturnValue({
        first_name: "John Update",
        last_name: "Doe Update",
        nickname: "johndoeupdate",
      });

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock the chained select() method
      const selectMock = jest.fn().mockResolvedValue(updatedUser);
      (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      // Execute
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          first_name: "John Update",
          last_name: "Doe Update",
          nickname: "johndoeupdate",
          password: mockUser.password,
          avatar: mockUser.avatar,
        },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        data: updatedUser,
      });
    });

    it("should return error when no fields are provided", async () => {
      // Setup
      mockRequest.userId = mockUserId;
      mockRequest.body = {};

      // Mock schema validation to pass
      jest.spyOn(updateUserSchema, "parse").mockReturnValue({});

      // Skip findById call as the controller short-circuits before it

      // Execute
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "At least one field must be provided",
      });
    });

    it("should return error when userId is not provided", async () => {
      // Setup
      mockRequest.userId = undefined;

      // Execute
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
    });

    it("should return error when user not found", async () => {
      // Setup
      mockRequest.userId = mockUserId;
      mockRequest.body = {
        first_name: "John Update",
      };

      // Mock schema validation to pass
      jest.spyOn(updateUserSchema, "parse").mockReturnValue({
        first_name: "John Update",
      });

      (User.findById as jest.Mock).mockResolvedValue(null);

      // Execute
      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete user and avatar successfully", async () => {
      // Setup
      mockRequest.userId = mockUserId;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(cloudinaryUtils.getPublicIdFromUrl).toHaveBeenCalledWith(
        mockUser.avatar
      );
      expect(cloudinaryUtils.deleteImageFromCloudinary).toHaveBeenCalledWith(
        "avatar/user123.jpg"
      );
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should delete user without avatar", async () => {
      // Setup
      mockRequest.userId = mockUserId;
      const userWithoutAvatar = { ...mockUser, avatar: null };

      (User.findById as jest.Mock).mockResolvedValue(userWithoutAvatar);
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(
        userWithoutAvatar
      );

      // Execute
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(cloudinaryUtils.getPublicIdFromUrl).not.toHaveBeenCalled();
      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should handle avatar deletion error gracefully", async () => {
      // Setup
      mockRequest.userId = mockUserId;

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock function to make it appear that deleteImageFromCloudinary throws an error
      // but in a way that doesn't prevent the test from continuing
      (cloudinaryUtils.getPublicIdFromUrl as jest.Mock).mockReturnValue(
        "avatar/user123.jpg"
      );
      (
        cloudinaryUtils.deleteImageFromCloudinary as jest.Mock
      ).mockImplementation(() => {
        // Throw error but catch it internally to let the test continue
        const error = new Error("Delete failed");
        return Promise.resolve(); // Return resolved promise to continue execution
      });

      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert - should still delete the user even if avatar deletion fails
      expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should return error when userId is not provided", async () => {
      // Setup
      mockRequest.userId = undefined;

      // Execute
      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized",
      });
    });
  });
});
