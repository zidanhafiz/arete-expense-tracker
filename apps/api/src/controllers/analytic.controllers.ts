import { logger } from "../config/logger";
import Income from "../models/income.models";
import { Request, Response } from "express";
import { handleError } from "../utils/errorHandling";
import mongoose from "mongoose";
import Expense from "../models/expense.models";

const getTotalIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(`Fetching income with filter: ${JSON.stringify(filter)}`);

    // Use aggregation pipeline to get income grouped by source
    const aggregateResult = await Income.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "sources",
          localField: "source",
          foreignField: "_id",
          as: "sourceDetails",
        },
      },
      { $unwind: { path: "$sourceDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          sourceName: { $first: "$sourceDetails.name" },
          sourceIcon: { $first: "$sourceDetails.icon" },
        },
      },
      { $sort: { total: -1 } }, // Sort by total income in descending order
    ]);

    // Calculate the overall total income
    const totalIncome = aggregateResult.reduce(
      (acc: number, curr: any) => acc + curr.total,
      0
    );

    // Format the results
    const incomeBySource = aggregateResult.map((item) => ({
      sourceId: item._id,
      name: item.sourceName || "Unknown Source",
      icon: item.sourceIcon || "💰",
      total: item.total,
      count: item.count,
      percentage:
        totalIncome > 0
          ? ((item.total / totalIncome) * 100).toFixed(2) + "%"
          : "0%",
    }));

    res.status(200).json({
      message: "Total income fetched successfully",
      totalIncome,
      incomeBySource,
      dateRange: {
        from: filter.date.$gte,
        to: filter.date.$lte,
      },
    });
  } catch (error) {
    logger.error(`Error fetching total income: ${error}`);
    handleError(error, res);
  }
};

const getTotalExpense = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(`Fetching expense with filter: ${JSON.stringify(filter)}`);

    // Use aggregation pipeline to get expense grouped by category
    const aggregateResult = await Expense.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          categoryName: { $first: "$categoryDetails.name" },
          categoryIcon: { $first: "$categoryDetails.icon" },
        },
      },
      { $sort: { total: -1 } }, // Sort by total expense in descending order
    ]);

    // Calculate the overall total expense
    const totalExpense = aggregateResult.reduce(
      (acc: number, curr: any) => acc + curr.total,
      0
    );

    // Format the results
    const expenseByCategory = aggregateResult.map((item) => ({
      categoryId: item._id,
      name: item.categoryName || "Unknown Category",
      icon: item.categoryIcon || "💰",
      total: item.total,
      count: item.count,
      percentage:
        totalExpense > 0
          ? ((item.total / totalExpense) * 100).toFixed(2) + "%"
          : "0%",
    }));

    res.status(200).json({
      message: "Total expense fetched successfully",
      totalExpense,
      expenseByCategory,
      dateRange: {
        from: filter.date.$gte,
        to: filter.date.$lte,
      },
    });
  } catch (error) {
    logger.error(`Error fetching total expense: ${error}`);
    handleError(error, res);
  }
};

const getNetBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(`Fetching net balance with filter: ${JSON.stringify(filter)}`);

    // Calculate total income and expense
    const [totalIncome, totalExpense] = await Promise.all([
      Income.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);
    // Calculate net balance
    const netBalance =
      (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0);

    res.status(200).json({
      message: "Net balance fetched successfully",
      netBalance,
      dateRange: {
        from: filter.date.$gte,
        to: filter.date.$lte,
      },
    });
  } catch (error) {
    logger.error(`Error fetching net balance: ${error}`);
    handleError(error, res);
  }
};

const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate, page = 1, limit = 10 } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(`Fetching transactions with filter: ${JSON.stringify(filter)}`);

    // Fetch transactions with pagination
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    // Calculate skip value based on page number and limit
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch both incomes and expenses
    const [incomes, expenses] = await Promise.all([
      Income.find(filter).populate("source", "name").lean().exec(),
      Expense.find(filter).populate("category", "name").lean().exec(),
    ]);

    // Combine and format transactions
    const transactions = [...incomes, ...expenses]
      .map((transaction) => ({
        ...transaction,
        type: "source" in transaction ? "income" : "expense",
        category:
          "source" in transaction ? transaction.source : transaction.category,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(skip, skip + limitNumber);

    // Get total count for pagination
    const totalTransactions = incomes.length + expenses.length;
    const totalPages = Math.ceil(totalTransactions / limitNumber);

    res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalTransactions,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    logger.error(`Error fetching transactions: ${error}`);
    handleError(error, res);
  }
};

const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(
      `Fetching expense summary with filter: ${JSON.stringify(filter)}`
    );

    // Use aggregation pipeline to get expense summary with category details and highest expense
    const aggregateResult = await Expense.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          categoryName: { $first: "$categoryDetails.name" },
          categoryIcon: { $first: "$categoryDetails.icon" },
          // Track the highest expense in this category
          highestExpense: {
            $max: {
              amount: "$amount",
              name: "$name",
              date: "$date",
              description: "$description",
            },
          },
          // Get all expenses in this category
          expenses: {
            $push: {
              amount: "$amount",
              name: "$name",
              date: "$date",
              description: "$description",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          categoryName: 1,
          categoryIcon: 1,
          highestExpense: 1,
          // Calculate average expense
          averageExpense: { $divide: ["$total", "$count"] },
          // Get the most recent expense
          recentExpenses: {
            $slice: [
              {
                $sortArray: {
                  input: "$expenses",
                  sortBy: { date: -1 },
                },
              },
              3,
            ],
          },
        },
      },
      { $sort: { total: -1 } }, // Sort by total expense in descending order
    ]);

    // Calculate the overall total expense
    const totalExpense = aggregateResult.reduce(
      (acc: number, curr: any) => acc + curr.total,
      0
    );

    // Format the results
    const expenseSummary = aggregateResult.map((category) => ({
      categoryId: category._id,
      name: category.categoryName,
      icon: category.categoryIcon,
      total: category.total,
      count: category.count,
      averageExpense: Number(category.averageExpense.toFixed(2)),
      percentage:
        totalExpense > 0
          ? Number(((category.total / totalExpense) * 100).toFixed(2))
          : 0,
      highestExpense: {
        ...category.highestExpense,
        date: category.highestExpense.date.toISOString(),
      },
      recentExpenses: category.recentExpenses.map((expense: any) => ({
        ...expense,
        date: expense.date.toISOString(),
      })),
    }));

    res.status(200).json({
      message: "Expense summary fetched successfully",
      totalExpense,
      expenseSummary,
      dateRange: {
        from: filter.date.$gte,
        to: filter.date.$lte,
      },
    });
  } catch (error) {
    logger.error(`Error fetching expense summary: ${error}`);
    handleError(error, res);
  }
};

const getIncomeSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { fromDate, toDate } = req.query;

    // Create filter with user ID as mongoose ObjectId
    const filter: any = { user: new mongoose.Types.ObjectId(userId as string) };

    // If dates are not provided, default to current month
    if (!fromDate && !toDate) {
      // Get first day of current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get last day of current month
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth,
      };
    } else {
      // Initialize date filter object if either date is provided
      filter.date = {};

      if (fromDate) {
        const startDate = new Date(fromDate as string);
        startDate.setHours(0, 0, 0, 0);
        filter.date.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate as string);
        endDate.setHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

    logger.info(
      `Fetching income summary with filter: ${JSON.stringify(filter)}`
    );

    // Use aggregation pipeline to get income summary with source details and highest income
    const aggregateResult = await Income.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "sources",
          localField: "source",
          foreignField: "_id",
          as: "sourceDetails",
        },
      },
      { $unwind: "$sourceDetails" },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          sourceName: { $first: "$sourceDetails.name" },
          sourceIcon: { $first: "$sourceDetails.icon" },
          // Track the highest income in this source
          highestIncome: {
            $max: {
              amount: "$amount",
              name: "$name",
              date: "$date",
              description: "$description",
            },
          },
          // Get all incomes in this source
          incomes: {
            $push: {
              amount: "$amount",
              name: "$name",
              date: "$date",
              description: "$description",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          sourceName: 1,
          sourceIcon: 1,
          highestIncome: 1,
          // Calculate average income
          averageIncome: { $divide: ["$total", "$count"] },
          // Get the most recent income
          recentIncomes: {
            $slice: [
              {
                $sortArray: {
                  input: "$incomes",
                  sortBy: { date: -1 },
                },
              },
              3,
            ],
          },
        },
      },
      { $sort: { total: -1 } }, // Sort by total income in descending order
    ]);

    // Calculate the overall total income
    const totalIncome = aggregateResult.reduce(
      (acc: number, curr: any) => acc + curr.total,
      0
    );

    // Format the results
    const incomeSummary = aggregateResult.map((source) => ({
      sourceId: source._id,
      name: source.sourceName,
      icon: source.sourceIcon,
      total: source.total,
      count: source.count,
      averageIncome: Number(source.averageIncome.toFixed(2)),
      percentage:
        totalIncome > 0
          ? Number(((source.total / totalIncome) * 100).toFixed(2))
          : 0,
      highestIncome: {
        ...source.highestIncome,
        date: source.highestIncome.date.toISOString(),
      },
      recentIncomes: source.recentIncomes.map((income: any) => ({
        ...income,
        date: income.date.toISOString(),
      })),
    }));

    res.status(200).json({
      message: "Income summary fetched successfully",
      totalIncome,
      incomeSummary,
      dateRange: {
        from: filter.date.$gte,
        to: filter.date.$lte,
      },
    });
  } catch (error) {
    logger.error(`Error fetching income summary: ${error}`);
    handleError(error, res);
  }
};

export default {
  getTotalIncome,
  getTotalExpense,
  getNetBalance,
  getTransactions,
  getExpenseSummary,
  getIncomeSummary,
};
