import { Request, Response } from "express";
import Expense from "../../models/expense.models";
import expenseController from "../../controllers/expense.controllers";
import Category from "../../models/category.models";
import * as cloudinaryUtils from "../../utils/cloudinaryUtils";

// Mock dependencies
jest.mock("../../models/expense.models");
jest.mock("../../models/category.models");
jest.mock("../../config/logger");
jest.mock("../../utils/cloudinaryUtils");

describe("Expense Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockExpense: any;
  let mockUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserId = "507f1f77bcf86cd799439011";
    mockExpense = {
      _id: "expense1",
      user: mockUserId,
      icon: "icon.png",
      name: "Lunch",
      description: "Business lunch",
      amount: 20,
      category: "507f1f77bcf86cd799439011",
      date: "2024-03-20",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/avatar/image1.jpg"],
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

    (Expense.create as jest.Mock).mockReset();
    (Expense.find as jest.Mock).mockReset();
    (Expense.findOne as jest.Mock).mockReset();
    (Expense.findOneAndUpdate as jest.Mock).mockReset();
    (Expense.findOneAndDelete as jest.Mock).mockReset();

    (Category.findOne as jest.Mock).mockReset();
    (Category.findOne as jest.Mock).mockResolvedValue({
      _id: mockExpense.category,
      user: mockUserId,
      name: mockExpense.category,
    });

    // Mock cloudinary functions
    (cloudinaryUtils.getPublicIdFromUrl as jest.Mock).mockReturnValue("avatar/image1.jpg");
    (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock).mockResolvedValue(undefined);
  });

  describe("createExpense", () => {
    it("should create a new expense successfully", async () => {
      mockRequest.body = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: mockExpense.category,
        date: mockExpense.date,
      };
      (Expense.create as jest.Mock).mockResolvedValue(mockExpense);

      await expenseController.createExpense(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: mockExpense.category,
        user: mockUserId,
      });
      expect(Expense.create).toHaveBeenCalledWith({
        user: mockUserId,
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category: mockExpense.category,
        date: mockExpense.date,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense created successfully",
        expense: mockExpense,
      });
    });

    it("should return 400 for invalid request body", async () => {
      mockRequest.body = {};

      await expenseController.createExpense(
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
      expect(Expense.create).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      mockRequest.body = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: mockExpense.category,
        date: mockExpense.date,
      };
      (Category.findOne as jest.Mock).mockResolvedValue({
        _id: mockExpense.category,
      });
      (Expense.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expenseController.createExpense(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });

    it("should return 404 if category not found", async () => {
      // simulate missing category
      (Category.findOne as jest.Mock).mockResolvedValueOnce(null);
      mockRequest.body = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: "nonexistentId",
        date: mockExpense.date,
      };
      await expenseController.createExpense(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Category.findOne).toHaveBeenCalledWith({
        _id: "nonexistentId",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
      expect(Expense.create).not.toHaveBeenCalled();
    });
  });

  describe("listExpenses", () => {
    it("should list expenses successfully", async () => {
      const expensesArray = [mockExpense];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(expensesArray);
      (Expense.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await expenseController.listExpenses(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Expense.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(populateMock).toHaveBeenCalledWith("category", "icon name");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expenses listed successfully",
        page: 1,
        limit: 10,
        total: expensesArray.length,
        totalPages: 1,
        expenses: expensesArray,
      });
    });

    it("should filter by category name in query", async () => {
      const categoryName = "Food";
      mockRequest.query = { category: categoryName };
      const expensesArray = [mockExpense];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(expensesArray);
      (Category.findOne as jest.Mock).mockResolvedValue({
        _id: mockExpense.category,
        name: categoryName,
        user: mockUserId,
      });
      (Expense.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await expenseController.listExpenses(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOne).toHaveBeenCalledWith({
        name: categoryName,
        user: mockUserId,
      });
      expect(Expense.find).toHaveBeenCalledWith({
        user: mockUserId,
        category: mockExpense.category,
      });
      expect(populateMock).toHaveBeenCalledWith("category", "icon name");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expenses listed successfully",
        page: Number(mockRequest.query.page) || 1,
        limit: Number(mockRequest.query.limit) || 10,
        total: expensesArray.length,
        totalPages: 1,
        expenses: expensesArray,
      });
    });

    it("should return empty list if category name not found", async () => {
      // simulate missing category for name filter
      mockRequest.query = { category: "NonExist" };
      (Category.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expenseController.listExpenses(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Category.findOne).toHaveBeenCalledWith({
        name: "NonExist",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expenses listed successfully",
        page: 1,
        limit: 10,
        total: 0,
        expenses: [],
      });
    });

    it("should handle server error", async () => {
      (Expense.find as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await expenseController.listExpenses(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("getExpenseById", () => {
    it("should return the expense when found", async () => {
      const populateMock = jest.fn().mockResolvedValue(mockExpense);
      (Expense.findOne as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      mockRequest.params = { id: mockExpense._id };

      await expenseController.getExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Expense.findOne).toHaveBeenCalledWith({
        _id: mockExpense._id,
        user: mockUserId,
      });
      expect(populateMock).toHaveBeenCalledWith("category", "icon name");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense found successfully",
        expense: mockExpense,
      });
    });

    it("should return 404 if expense not found", async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      (Expense.findOne as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      mockRequest.params = { id: "notFound" };

      await expenseController.getExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense not found",
      });
    });

    it("should handle server error", async () => {
      (Expense.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await expenseController.getExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("updateExpenseById", () => {
    it("should update the expense successfully", async () => {
      const updateBody = {
        icon: mockExpense.icon,
        name: "Dinner",
        description: "Team dinner",
        amount: 50,
        category_id: mockExpense.category,
        date: mockExpense.date,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockExpense._id };
      (Category.findOne as jest.Mock).mockResolvedValue({
        _id: updateBody.category_id,
      });
      (Expense.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockExpense,
        ...updateBody,
      });

      await expenseController.updateExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: updateBody.category_id,
        user: mockUserId,
      });
      expect(Expense.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockExpense._id, user: mockUserId },
        {
          icon: updateBody.icon,
          name: updateBody.name,
          description: updateBody.description,
          amount: updateBody.amount,
          category: mockExpense.category,
          date: updateBody.date,
        },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense updated successfully",
        expense: {
          ...mockExpense,
          ...{
            icon: updateBody.icon,
            name: updateBody.name,
            description: updateBody.description,
            amount: updateBody.amount,
            category: mockExpense.category,
            category_id: updateBody.category_id,
            date: updateBody.date,
          },
        },
      });
    });

    it("should return 404 if expense not found", async () => {
      mockRequest.body = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: mockExpense.category,
        date: mockExpense.date,
      };
      mockRequest.params = { id: "notFound" };
      (Category.findOne as jest.Mock).mockResolvedValue({
        _id: mockExpense.category,
      });
      (Expense.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await expenseController.updateExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense not found",
      });
    });

    it("should return 400 for validation error", async () => {
      mockRequest.body = {};

      await expenseController.updateExpenseById(
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
      expect(Expense.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      const updateBody = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: mockExpense.category,
        date: mockExpense.date,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockExpense._id };
      (Category.findOne as jest.Mock).mockResolvedValue({
        _id: updateBody.category_id,
      });
      (Expense.findOneAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await expenseController.updateExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });

    it("should return 404 if category not found for update", async () => {
      // simulate missing category
      (Category.findOne as jest.Mock).mockResolvedValueOnce(null);
      const updateBody = {
        icon: mockExpense.icon,
        name: mockExpense.name,
        description: mockExpense.description,
        amount: mockExpense.amount,
        category_id: "nonexistentId",
        date: mockExpense.date,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockExpense._id };
      await expenseController.updateExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Category.findOne).toHaveBeenCalledWith({
        _id: "nonexistentId",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category not found",
      });
      expect(Expense.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteExpenseById", () => {
    it("should delete the expense and its images successfully", async () => {
      mockRequest.params = { id: mockExpense._id };
      
      // Mock finding the expense first to get its images
      (Expense.findOne as jest.Mock).mockResolvedValue(mockExpense);
      (Expense.findOneAndDelete as jest.Mock).mockResolvedValue(mockExpense);

      await expenseController.deleteExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Check that we tried to get the public ID
      expect(cloudinaryUtils.getPublicIdFromUrl).toHaveBeenCalledWith(
        mockExpense.images[0]
      );
      
      // Check that we tried to delete the image
      expect(cloudinaryUtils.deleteImageFromCloudinary).toHaveBeenCalledWith(
        "avatar/image1.jpg"
      );
      
      expect(Expense.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockExpense._id,
        user: mockUserId,
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense deleted successfully",
      });
    });

    it("should handle image deletion failures gracefully", async () => {
      mockRequest.params = { id: mockExpense._id };
      
      // Mock finding the expense with multiple images
      const expenseWithMultipleImages = {
        ...mockExpense,
        images: [
          "https://res.cloudinary.com/demo/image/upload/v1/avatar/image1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1/avatar/image2.jpg"
        ]
      };
      
      (Expense.findOne as jest.Mock).mockResolvedValue(expenseWithMultipleImages);
      (Expense.findOneAndDelete as jest.Mock).mockResolvedValue(mockExpense);
      
      // Mock one successful deletion and one failed deletion
      (cloudinaryUtils.getPublicIdFromUrl as jest.Mock)
        .mockReturnValueOnce("avatar/image1.jpg")
        .mockReturnValueOnce("avatar/image2.jpg");
      
      (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Failed to delete image"));

      await expenseController.deleteExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Should still succeed despite one image failing to delete
      expect(Expense.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockExpense._id,
        user: mockUserId,
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense deleted successfully",
      });
    });

    it("should return 404 if expense not found", async () => {
      mockRequest.params = { id: "notFound" };
      (Expense.findOne as jest.Mock).mockResolvedValue(null);

      await expenseController.deleteExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(Expense.findOneAndDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Expense not found",
      });
    });

    it("should handle server error", async () => {
      mockRequest.params = { id: mockExpense._id };
      
      // Mock finding the expense first to get its images
      (Expense.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await expenseController.deleteExpenseById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("downloadExcel", () => {
    it("should generate and download expenses Excel file", async () => {
      // Mock expenses data
      const expensesArray = [
        {
          _id: "expense1",
          user: mockUserId,
          name: "Test Expense",
          description: "Description",
          amount: 100,
          date: "2024-03-20",
          category: {
            name: "Food",
            icon: "🍔",
          },
        },
      ];

      // Setup mock for Expense.find().populate()
      const populateMock = jest.fn().mockResolvedValue(expensesArray);
      (Expense.find as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      // Create a mock response that supports streaming
      const mockWritableResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };

      await expenseController.downloadExcel(
        mockRequest as Request,
        mockWritableResponse as any
      );

      expect(Expense.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(populateMock).toHaveBeenCalledWith("category", "name icon");
      expect(mockWritableResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(mockWritableResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=expenses.xlsx"
      );
    });

    it("should handle date range filters", async () => {
      mockRequest.query = {
        fromDate: "2024-01-01",
        toDate: "2024-12-31",
      };

      const populateMock = jest.fn().mockResolvedValue([]);
      (Expense.find as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      // Create a mock response that supports streaming
      const mockWritableResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      };

      await expenseController.downloadExcel(
        mockRequest as Request,
        mockWritableResponse as any
      );

      expect(Expense.find).toHaveBeenCalledWith({
        user: mockUserId,
        date: {
          $gte: "2024-01-01",
          $lte: "2024-12-31",
        },
      });
      expect(populateMock).toHaveBeenCalledWith("category", "name icon");
    });

    it("should handle errors properly", async () => {
      (Expense.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expenseController.downloadExcel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Database error",
      });
    });
  });
});
