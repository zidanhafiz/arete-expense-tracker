import { Request, Response } from "express";
import User from "../../models/user.models";
import userController from "../../controllers/user.controllers";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/authUtils";
import { logger } from "../../config/logger";
import { z } from "zod";

// Mock dependencies
jest.mock("../../models/user.models");
jest.mock("../../utils/authUtils");
jest.mock("../../config/logger");

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
      email: "john@example.com",
      password: "hashedpassword123",
      comparePassword: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
    };

    // Mock request and response
    mockRequest = {
      body: {},
      userId: mockUserId,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock User model
    (User.findOne as jest.Mock).mockReset();
    (User.findById as jest.Mock).mockReset();

    // Mock token generation functions
    (generateAccessToken as jest.Mock).mockReturnValue("mock-access-token");
    (generateRefreshToken as jest.Mock).mockReturnValue("mock-refresh-token");
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

      const zodError = new z.ZodError([]);
      // jest.spyOn(z.ZodError.prototype, 'format').mockReturnValue({ _errors: ['Validation error'] });
      // // Mock the zod schema validation to throw an error
      // jest.spyOn(z, 'ZodError', 'get').mockImplementation(() => {
      //   return zodError.constructor as typeof z.ZodError;
      // });

      // // Mock parse to throw ZodError
      // jest.spyOn(z.object.prototype, 'parse').mockImplementation(() => {
      //   throw zodError;
      // });

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
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Error registering user",
        errors: serverError,
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

      const selectMock = jest.fn().mockReturnValue(userWithoutPassword);
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

      const selectMock = jest.fn().mockReturnValue(null);
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
});
