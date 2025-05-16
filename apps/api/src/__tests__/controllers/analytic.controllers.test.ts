import { Request, Response } from "express";
import mongoose from "mongoose";
import analyticController from "../../controllers/analytic.controllers";
import Expense from "../../models/expense.models";
import Income from "../../models/income.models";

// Mock the models
jest.mock("../../models/expense.models");
jest.mock("../../models/income.models");
jest.mock("../../config/logger");

describe("Analytic Controllers", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    mockRequest = {
      userId: mockUserId,
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getExpenseSummary", () => {
    const mockExpenseData = [
      {
        _id: new mongoose.Types.ObjectId(),
        total: 1000,
        count: 2,
        categoryName: "Food",
        categoryIcon: "🍔",
        highestExpense: {
          amount: 600,
          name: "Dinner",
          date: new Date("2024-03-15"),
          description: "Restaurant dinner",
        },
        averageExpense: 500,
        recentExpenses: [
          {
            amount: 600,
            name: "Dinner",
            date: new Date("2024-03-15"),
            description: "Restaurant dinner",
          },
          {
            amount: 400,
            name: "Lunch",
            date: new Date("2024-03-14"),
            description: "Office lunch",
          },
        ],
      },
    ];

    it("should return expense summary for current month when no dates provided", async () => {
      (Expense.aggregate as jest.Mock).mockResolvedValue(mockExpenseData);

      await analyticController.getExpenseSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Expense summary fetched successfully",
          totalExpense: 1000,
          expenseSummary: expect.arrayContaining([
            expect.objectContaining({
              name: "Food",
              icon: "🍔",
              total: 1000,
              count: 2,
              averageExpense: 500,
              percentage: 100,
              highestExpense: expect.objectContaining({
                amount: 600,
                name: "Dinner",
              }),
            }),
          ]),
        })
      );
    });

    it("should return expense summary for specified date range", async () => {
      mockRequest.query = {
        fromDate: "2024-03-01",
        toDate: "2024-03-31",
      };

      (Expense.aggregate as jest.Mock).mockResolvedValue(mockExpenseData);

      await analyticController.getExpenseSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Expense.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              date: expect.objectContaining({
                $gte: expect.any(Date),
                $lte: expect.any(Date),
              }),
            }),
          }),
        ])
      );
    });

    it("should handle empty expense data", async () => {
      (Expense.aggregate as jest.Mock).mockResolvedValue([]);

      await analyticController.getExpenseSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalExpense: 0,
          expenseSummary: [],
        })
      );
    });
  });

  describe("getIncomeSummary", () => {
    const mockIncomeData = [
      {
        _id: new mongoose.Types.ObjectId(),
        total: 5000,
        count: 2,
        sourceName: "Salary",
        sourceIcon: "💰",
        highestIncome: {
          amount: 3000,
          name: "Monthly Salary",
          date: new Date("2024-03-15"),
          description: "March salary",
        },
        averageIncome: 2500,
        recentIncomes: [
          {
            amount: 3000,
            name: "Monthly Salary",
            date: new Date("2024-03-15"),
            description: "March salary",
          },
          {
            amount: 2000,
            name: "Bonus",
            date: new Date("2024-03-14"),
            description: "Performance bonus",
          },
        ],
      },
    ];

    it("should return income summary for current month when no dates provided", async () => {
      (Income.aggregate as jest.Mock).mockResolvedValue(mockIncomeData);

      await analyticController.getIncomeSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Income summary fetched successfully",
          totalIncome: 5000,
          incomeSummary: expect.arrayContaining([
            expect.objectContaining({
              name: "Salary",
              icon: "💰",
              total: 5000,
              count: 2,
              averageIncome: 2500,
              percentage: 100,
              highestIncome: expect.objectContaining({
                amount: 3000,
                name: "Monthly Salary",
              }),
            }),
          ]),
        })
      );
    });

    it("should return income summary for specified date range", async () => {
      mockRequest.query = {
        fromDate: "2024-03-01",
        toDate: "2024-03-31",
      };

      (Income.aggregate as jest.Mock).mockResolvedValue(mockIncomeData);

      await analyticController.getIncomeSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Income.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              date: expect.objectContaining({
                $gte: expect.any(Date),
                $lte: expect.any(Date),
              }),
            }),
          }),
        ])
      );
    });

    it("should handle empty income data", async () => {
      (Income.aggregate as jest.Mock).mockResolvedValue([]);

      await analyticController.getIncomeSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalIncome: 0,
          incomeSummary: [],
        })
      );
    });
  });
});
