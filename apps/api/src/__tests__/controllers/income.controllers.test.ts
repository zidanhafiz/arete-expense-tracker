import { Request, Response } from "express";
import Income from "../../models/income.models";
import incomeController from "../../controllers/income.controllers";
import Source from "../../models/source.models";
import * as cloudinaryUtils from "../../utils/cloudinaryUtils";

// Mock dependencies
jest.mock("../../models/income.models");
jest.mock("../../models/source.models");
jest.mock("../../config/logger");
jest.mock("../../utils/cloudinaryUtils");

describe("Income Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockIncome: any;
  let mockUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserId = "507f1f77bcf86cd799439011";
    mockIncome = {
      _id: "income1",
      user: mockUserId,
      icon: "icon.png",
      name: "Salary",
      description: "Monthly salary",
      amount: 5000,
      date: "2024-03-20",
      source: "507f1f77bcf86cd799439011",
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/avatar/income1.jpg",
      ],
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

    (Income.create as jest.Mock).mockReset();
    (Income.find as jest.Mock).mockReset();
    (Income.findOne as jest.Mock).mockReset();
    (Income.findOneAndUpdate as jest.Mock).mockReset();
    (Income.findOneAndDelete as jest.Mock).mockReset();

    (Source.findOne as jest.Mock).mockReset();
    (Source.findOne as jest.Mock).mockResolvedValue({
      _id: mockIncome.source,
      user: mockUserId,
      name: "Job",
    });

    // Mock cloudinary functions
    (cloudinaryUtils.getPublicIdFromUrl as jest.Mock).mockReturnValue(
      "avatar/income1.jpg"
    );
    (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  describe("createIncome", () => {
    it("should create a new income successfully", async () => {
      mockRequest.body = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: mockIncome.source,
        date: "2023-01-01",
      };
      (Income.create as jest.Mock).mockResolvedValue(mockIncome);

      await incomeController.createIncome(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOne).toHaveBeenCalledWith({
        _id: mockIncome.source,
        user: mockUserId,
      });
      expect(Income.create).toHaveBeenCalledWith({
        user: mockUserId,
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        date: expect.any(Date),
        source: mockIncome.source,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income created successfully",
        income: mockIncome,
      });
    });

    it("should return 400 for invalid request body", async () => {
      mockRequest.body = {};

      await incomeController.createIncome(
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
      expect(Income.create).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      mockRequest.body = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: mockIncome.source,
        date: "2023-01-01",
      };
      (Income.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await incomeController.createIncome(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });

    it("should return 404 if source not found", async () => {
      // simulate missing source
      (Source.findOne as jest.Mock).mockResolvedValueOnce(null);
      mockRequest.body = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: "nonexistentId",
        date: "2023-01-01",
      };
      await incomeController.createIncome(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Source.findOne).toHaveBeenCalledWith({
        _id: "nonexistentId",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source not found",
      });
      expect(Income.create).not.toHaveBeenCalled();
    });
  });

  describe("listIncomes", () => {
    it("should list incomes successfully", async () => {
      const incomesArray = [mockIncome];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(incomesArray);
      (Income.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(populateMock).toHaveBeenCalledWith("source");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Incomes listed successfully",
        page: 1,
        limit: 10,
        total: incomesArray.length,
        totalPages: 1,
        incomes: incomesArray,
      });
    });

    it("should filter by source name in query", async () => {
      mockRequest.query = { source: "Job" };
      const incomesArray = [mockIncome];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(incomesArray);
      (Income.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOne).toHaveBeenCalledWith({
        name: "Job",
        user: mockUserId,
      });
      expect(Income.find).toHaveBeenCalledWith({
        user: mockUserId,
        source: mockIncome.source,
      });
      expect(populateMock).toHaveBeenCalledWith("source");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Incomes listed successfully",
        page: Number(mockRequest.query.page) || 1,
        limit: Number(mockRequest.query.limit) || 10,
        total: incomesArray.length,
        totalPages: 1,
        incomes: incomesArray,
      });
    });

    it("should return empty list if source name not found", async () => {
      // simulate missing source for name filter
      mockRequest.query = { source: "NonExist" };
      (Source.findOne as jest.Mock).mockResolvedValueOnce(null);
      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Source.findOne).toHaveBeenCalledWith({
        name: "NonExist",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Incomes listed successfully",
        page: 1,
        limit: 10,
        total: 0,
        incomes: [],
      });
    });

    it("should handle server error", async () => {
      (Income.find as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });

    it("should filter incomes by date range", async () => {
      const fromDate = "2023-01-01";
      const toDate = "2023-12-31";
      mockRequest.query = { fromDate, toDate };

      const incomesArray = [mockIncome];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(incomesArray);

      (Income.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.find).toHaveBeenCalledWith({
        user: mockUserId,
        date: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      });

      // Verify the Date objects created match our input strings
      const findCall = (Income.find as jest.Mock).mock.calls[0][0];
      expect(findCall.date.$gte.toISOString().split("T")[0]).toBe(fromDate);
      expect(findCall.date.$lte.toISOString().split("T")[0]).toBe(toDate);

      expect(populateMock).toHaveBeenCalledWith("source");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Incomes listed successfully",
        page: 1,
        limit: 10,
        total: incomesArray.length,
        totalPages: 1,
        incomes: incomesArray,
      });
    });

    it("should filter incomes with only fromDate specified", async () => {
      const fromDate = "2023-01-01";
      mockRequest.query = { fromDate };

      const incomesArray = [mockIncome];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(incomesArray);

      (Income.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.find).toHaveBeenCalledWith({
        user: mockUserId,
        date: {
          $gte: expect.any(Date),
        },
      });

      // Verify the Date object created matches our input string
      const findCall = (Income.find as jest.Mock).mock.calls[0][0];
      expect(findCall.date.$gte.toISOString().split("T")[0]).toBe(fromDate);
      expect(findCall.date.$lte).toBeUndefined();

      expect(populateMock).toHaveBeenCalledWith("source");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should filter incomes with only toDate specified", async () => {
      const toDate = "2023-12-31";
      mockRequest.query = { toDate };

      const incomesArray = [mockIncome];
      const populateMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(incomesArray);

      (Income.find as jest.Mock).mockReturnValue({
        populate: populateMock,
        skip: skipMock,
        limit: limitMock,
      });

      await incomeController.listIncomes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.find).toHaveBeenCalledWith({
        user: mockUserId,
        date: {
          $lte: expect.any(Date),
        },
      });

      // Verify the Date object created matches our input string
      const findCall = (Income.find as jest.Mock).mock.calls[0][0];
      expect(findCall.date.$gte).toBeUndefined();
      expect(findCall.date.$lte.toISOString().split("T")[0]).toBe(toDate);

      expect(populateMock).toHaveBeenCalledWith("source");
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getIncomeById", () => {
    it("should return the income when found", async () => {
      const populateMock = jest.fn().mockResolvedValue(mockIncome);
      (Income.findOne as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      mockRequest.params = { id: mockIncome._id };

      await incomeController.getIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.findOne).toHaveBeenCalledWith({
        _id: mockIncome._id,
        user: mockUserId,
      });
      expect(populateMock).toHaveBeenCalledWith("source");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income found successfully",
        income: mockIncome,
      });
    });

    it("should return 404 if income not found", async () => {
      const populateMock = jest.fn().mockResolvedValue(null);
      (Income.findOne as jest.Mock).mockReturnValue({
        populate: populateMock,
      });

      mockRequest.params = { id: "notFound" };

      await incomeController.getIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income not found",
      });
    });

    it("should handle server error", async () => {
      (Income.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await incomeController.getIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("updateIncomeById", () => {
    it("should update the income successfully", async () => {
      const updateBody = {
        icon: mockIncome.icon,
        name: "Updated Salary",
        description: "Updated description",
        amount: 6000,
        source_id: mockIncome.source,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockIncome._id };
      (Income.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockIncome,
        ...updateBody,
      });

      await incomeController.updateIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOne).toHaveBeenCalledWith({
        _id: updateBody.source_id,
        user: mockUserId,
      });
      expect(Income.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockIncome._id, user: mockUserId },
        {
          icon: updateBody.icon,
          name: updateBody.name,
          description: updateBody.description,
          amount: updateBody.amount,
          source: mockIncome.source,
        },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income updated successfully",
        income: expect.objectContaining({
          name: "Updated Salary",
          amount: 6000,
        }),
      });
    });

    it("should return 404 if income not found", async () => {
      mockRequest.body = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: mockIncome.source,
      };
      mockRequest.params = { id: "notFound" };
      (Income.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await incomeController.updateIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income not found",
      });
    });

    it("should return 400 for validation error", async () => {
      const updateBody = {
        icon: 10,
        source_id: mockIncome.source,
      };

      mockRequest.body = updateBody;
      mockRequest.params = { id: mockIncome._id };
      (Income.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockIncome,
        ...updateBody,
      });

      await incomeController.updateIncomeById(
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
      expect(Income.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      const updateBody = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: mockIncome.source,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockIncome._id };
      (Income.findOneAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await incomeController.updateIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });

    it("should return 404 if source not found for update", async () => {
      // simulate missing source
      (Source.findOne as jest.Mock).mockResolvedValueOnce(null);
      const updateBody = {
        icon: mockIncome.icon,
        name: mockIncome.name,
        description: mockIncome.description,
        amount: mockIncome.amount,
        source_id: "nonexistentId",
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockIncome._id };
      await incomeController.updateIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );
      expect(Source.findOne).toHaveBeenCalledWith({
        _id: "nonexistentId",
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source not found",
      });
      expect(Income.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteIncomeById", () => {
    it("should delete the income and its images successfully", async () => {
      mockRequest.params = { id: mockIncome._id };

      // Mock finding the income first to get its images
      (Income.findOne as jest.Mock).mockResolvedValue(mockIncome);
      (Income.findOneAndDelete as jest.Mock).mockResolvedValue(mockIncome);

      await incomeController.deleteIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Check that we tried to get the public ID
      expect(cloudinaryUtils.getPublicIdFromUrl).toHaveBeenCalledWith(
        mockIncome.images[0]
      );

      // Check that we tried to delete the image
      expect(cloudinaryUtils.deleteImageFromCloudinary).toHaveBeenCalledWith(
        "avatar/income1.jpg"
      );

      expect(Income.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockIncome._id,
        user: mockUserId,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income deleted successfully",
      });
    });

    it("should handle image deletion failures gracefully", async () => {
      mockRequest.params = { id: mockIncome._id };

      // Mock finding the income with multiple images
      const incomeWithMultipleImages = {
        ...mockIncome,
        images: [
          "https://res.cloudinary.com/demo/image/upload/v1/avatar/income1.jpg",
          "https://res.cloudinary.com/demo/image/upload/v1/avatar/income2.jpg",
        ],
      };

      (Income.findOne as jest.Mock).mockResolvedValue(incomeWithMultipleImages);
      (Income.findOneAndDelete as jest.Mock).mockResolvedValue(mockIncome);

      // Mock one successful deletion and one failed deletion
      (cloudinaryUtils.getPublicIdFromUrl as jest.Mock)
        .mockReturnValueOnce("avatar/income1.jpg")
        .mockReturnValueOnce("avatar/income2.jpg");

      (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Failed to delete image"));

      await incomeController.deleteIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Should still succeed despite one image failing to delete
      expect(Income.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockIncome._id,
        user: mockUserId,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income deleted successfully",
      });
    });

    it("should return 404 if income not found", async () => {
      mockRequest.params = { id: "notFound" };
      (Income.findOne as jest.Mock).mockResolvedValue(null);

      await incomeController.deleteIncomeById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(Income.findOneAndDelete).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Income not found",
      });
    });

    it("should handle server error", async () => {
      mockRequest.params = { id: mockIncome._id };

      // Mock finding the income first to get its images
      (Income.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await incomeController.deleteIncomeById(
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
    it("should generate and download incomes Excel file", async () => {
      // Mock incomes data
      const incomesArray = [
        {
          _id: "income1",
          user: mockUserId,
          name: "Test Income",
          description: "Description",
          amount: 5000,
          date: new Date("2023-01-01"),
          source: {
            name: "Job",
            icon: "🏢",
          },
        },
      ];

      // Setup mock for Income.find().populate()
      const populateMock = jest.fn().mockResolvedValue(incomesArray);
      (Income.find as jest.Mock).mockReturnValue({
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

      // Mock ExcelJS by replacing the write method
      jest.mock(
        "exceljs",
        () => ({
          Workbook: jest.fn().mockImplementation(() => ({
            addWorksheet: jest.fn().mockReturnValue({
              addRow: jest.fn(),
            }),
            xlsx: {
              write: jest.fn().mockImplementation((res) => {
                res.end();
                return Promise.resolve();
              }),
            },
          })),
        }),
        { virtual: true }
      );

      await incomeController.downloadExcel(
        mockRequest as Request,
        mockWritableResponse as any
      );

      expect(Income.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(populateMock).toHaveBeenCalledWith("source");
      expect(mockWritableResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(mockWritableResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=incomes.xlsx"
      );
    });

    it("should handle date range filters", async () => {
      mockRequest.query = {
        fromDate: "2023-01-01",
        toDate: "2023-12-31",
      };

      const populateMock = jest.fn().mockResolvedValue([]);
      (Income.find as jest.Mock).mockReturnValue({
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

      await incomeController.downloadExcel(
        mockRequest as Request,
        mockWritableResponse as any
      );

      expect(Income.find).toHaveBeenCalledWith({
        user: mockUserId,
        date: {
          $gte: expect.any(Date),
          $lte: expect.any(Date),
        },
      });

      // Verify the Date objects created match our input strings
      const findCall = (Income.find as jest.Mock).mock.calls[0][0];
      expect(findCall.date.$gte.toISOString().split("T")[0]).toBe("2023-01-01");
      expect(findCall.date.$lte.toISOString().split("T")[0]).toBe("2023-12-31");

      expect(populateMock).toHaveBeenCalledWith("source");
    });

    it("should handle errors properly", async () => {
      (Income.find as jest.Mock).mockImplementation(() => {
        throw new Error("Database error");
      });

      // Create a response mock for error case
      const mockErrorResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await incomeController.downloadExcel(
        mockRequest as Request,
        mockErrorResponse as any
      );

      expect(mockErrorResponse.status).toHaveBeenCalledWith(400);
      expect(mockErrorResponse.json).toHaveBeenCalledWith({
        message: "Database error",
      });
    });
  });
});
