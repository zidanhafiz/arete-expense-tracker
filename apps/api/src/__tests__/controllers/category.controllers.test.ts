import { Request, Response } from "express";
import Category from "../../models/category.models";
import categoryController from "../../controllers/category.controllers";
import { ZodError } from "zod";
import { logger } from "../../config/logger";
import mongoose from "mongoose";

// Mock dependencies
jest.mock("../../models/category.models");
jest.mock("../../config/logger");

describe("Category Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCategory: any;
  let mockUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserId = "507f1f77bcf86cd799439011";
    mockCategory = {
      _id: "category1",
      user: mockUserId,
      name: "Food",
      icon: "🍔",
      toJSON: function () {
        return this;
      },
    };

    mockRequest = {
      body: {},
      params: {},
      query: {},
      userId: mockUserId,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    (Category.create as jest.Mock).mockReset();
    (Category.find as jest.Mock).mockReset();
    (Category.findOne as jest.Mock).mockReset();
    (Category.findOneAndUpdate as jest.Mock).mockReset();
    (Category.findOneAndDelete as jest.Mock).mockReset();
    (Category.countDocuments as jest.Mock).mockReset();
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      mockRequest.body = {
        name: mockCategory.name,
        icon: mockCategory.icon,
      };
      (Category.create as jest.Mock).mockResolvedValue(mockCategory);

      await categoryController.createCategory(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.create).toHaveBeenCalledWith({
        name: mockCategory.name,
        icon: mockCategory.icon,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category created successfully",
        category: mockCategory,
      });
    });

    it("should return 400 for invalid request body", async () => {
      mockRequest.body = {};

      await categoryController.createCategory(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid request body",
          errors: expect.any(Object),
        })
      );
      expect(Category.create).not.toHaveBeenCalled();
    });
  });

  describe("listCategories", () => {
    it("should list categories with pagination", async () => {
      const categoriesArray = [mockCategory];
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(categoriesArray);
      (Category.find as jest.Mock).mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });
      (Category.countDocuments as jest.Mock).mockResolvedValue(1);

      await categoryController.listCategories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Categories fetched successfully",
        categories: categoriesArray,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it("should filter categories by search term", async () => {
      mockRequest.query = { search: "Food" };
      const categoriesArray = [mockCategory];
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(categoriesArray);
      (Category.find as jest.Mock).mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });
      (Category.countDocuments as jest.Mock).mockResolvedValue(1);

      await categoryController.listCategories(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.find).toHaveBeenCalledWith({
        user: mockUserId,
        $or: [{ name: { $regex: "Food", $options: "i" } }],
      });
    });
  });

  describe("getCategoryById", () => {
    it("should return a category when found", async () => {
      mockRequest.params = { id: mockCategory._id };
      (Category.findOne as jest.Mock).mockResolvedValue(mockCategory);

      await categoryController.getCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: mockCategory._id,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category fetched successfully",
        category: mockCategory,
      });
    });

    it("should return 404 if category not found", async () => {
      mockRequest.params = { id: "nonexistent" };
      (Category.findOne as jest.Mock).mockResolvedValue(null);

      await categoryController.getCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
    });
  });

  describe("updateCategoryById", () => {
    it("should update a category successfully", async () => {
      const updateBody = {
        name: "Updated Food",
        icon: "🍕",
      };
      mockRequest.params = { id: mockCategory._id };
      mockRequest.body = updateBody;
      const updatedCategory = { ...mockCategory, ...updateBody };
      (Category.findOneAndUpdate as jest.Mock).mockResolvedValue(
        updatedCategory
      );

      await categoryController.updateCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockCategory._id, user: mockUserId },
        updateBody,
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category updated successfully",
        category: updatedCategory,
      });
    });

    it("should return 404 if category not found", async () => {
      mockRequest.params = { id: "nonexistent" };
      mockRequest.body = { name: "Updated", icon: "🍕" };
      (Category.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await categoryController.updateCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
    });
  });

  describe("deleteCategoryById", () => {
    it("should delete a category successfully", async () => {
      mockRequest.params = { id: mockCategory._id };
      (Category.findOneAndDelete as jest.Mock).mockResolvedValue(mockCategory);

      await categoryController.deleteCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockCategory._id,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category deleted successfully",
      });
    });

    it("should return 404 if category not found", async () => {
      mockRequest.params = { id: "nonexistent" };
      (Category.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await categoryController.deleteCategoryById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
    });
  });
});
