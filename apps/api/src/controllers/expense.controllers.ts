import Expense from "../models/expense.models";
import { Request, Response } from "express";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../utils/expenseSchemas";
import { logger } from "../config/logger";
import Category, { CategoryDoc } from "../models/category.models";
import mongoose from "mongoose";
import { handleError } from "../utils/errorHandling";
import ExcelJS from "exceljs";
import {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/cloudinaryUtils";

const createExpense = async (req: Request, res: Response) => {
  try {
    const { icon, name, description, amount, category_id, date, images } =
      createExpenseSchema.parse(req.body);

    const userId = req.userId;

    const category = await Category.findOne({
      _id: category_id,
      user: userId,
    });

    if (!category) {
      logger.error(`Category not found: ${category_id} by user: ${userId}`);
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const expense = await Expense.create({
      user: userId,
      icon,
      name,
      description,
      amount,
      category: category._id,
      date,
      images,
    });

    logger.info(`Expense created: ${expense.id} by user: ${userId}`);
    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    logger.error(`Error creating expense: ${error}`);
    handleError(error, res);
  }
};

const listExpenses = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, search = "", category = "" } = req.query;

    const filter: any = { user: userId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      let catId: string | undefined;
      if (mongoose.isValidObjectId(category as string)) {
        catId = category as string;
      } else {
        const catDoc = await Category.findOne({ name: category, user: userId });
        if (!catDoc) {
          res.status(200).json({
            message: "Expenses listed successfully",
            page: 1,
            limit: 10,
            total: 0,
            expenses: [],
          });
          return;
        }
        catId = catDoc._id.toString();
      }
      filter.category = catId;
    }

    const expenses = await Expense.find(filter)
      .populate("category", "icon name")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalPages = Math.ceil(expenses.length / Number(limit));

    logger.info(`Expenses listed: ${expenses.length} by user: ${userId}`);
    res.status(200).json({
      message: "Expenses listed successfully",
      page: Number(page),
      limit: Number(limit),
      total: expenses.length,
      totalPages,
      expenses,
    });
  } catch (error) {
    logger.error(`Error listing expenses: ${error}`);
    handleError(error, res);
  }
};

const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOne({ _id: id, user: userId }).populate(
      "category",
      "icon name"
    );

    if (!expense) {
      logger.error(`Expense not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    logger.info(`Expense found: ${expense.id} by user: ${userId}`);
    res.status(200).json({
      message: "Expense found successfully",
      expense,
    });
  } catch (error) {
    logger.error(`Error getting expense: ${error}`);
    handleError(error, res);
  }
};

const updateExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { icon, name, description, amount, category_id, date, images } =
      updateExpenseSchema.parse(req.body);

    const category = await Category.findOne({
      _id: category_id,
      user: userId,
    });

    if (!category) {
      logger.error(`Category not found: ${category_id} by user: ${userId}`);
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: userId },
      { icon, name, description, amount, category: category._id, date, images },
      { new: true }
    );

    if (!expense) {
      logger.error(`Expense not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    logger.info(`Expense updated: ${expense.id} by user: ${userId}`);
    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    logger.error(`Error updating expense: ${error}`);
    handleError(error, res);
  }
};

const deleteExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOne({ _id: id, user: userId });

    if (!expense) {
      logger.error(`Expense not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    if (expense.images) {
      const results = await Promise.allSettled(
        expense.images.map(async (image) => {
          const publicId = getPublicIdFromUrl(image);
          if (publicId) {
            return deleteImageFromCloudinary(publicId);
          }
        })
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          logger.error(
            `Failed to delete image at index ${index}: ${result.reason}`
          );
        }
      });
    }

    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedExpense) {
      logger.error(`Expense not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    logger.info(`Expense deleted: ${id} by user: ${userId}`);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting expense: ${error}`);
    handleError(error, res);
  }
};

const downloadExcel = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const { fromDate, toDate } = req.query;

    const filter: any = { user: userId };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = fromDate;
      if (toDate) filter.date.$lte = toDate;
    }

    const expenses = await Expense.find(filter).populate(
      "category",
      "name icon"
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    worksheet.addRow([
      "Date",
      "Name",
      "Amount",
      "Category",
      "Description",
      "Images",
    ]);
    expenses.forEach((expense) => {
      worksheet.addRow([
        expense.date,
        expense.name,
        expense.amount,
        (expense.category as unknown as CategoryDoc)?.name || "Uncategorized",
        expense.description,
        expense.images?.join(", "),
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=expenses.xlsx");

    await workbook.xlsx.write(res);
  } catch (error) {
    logger.error(`Error downloading excel: ${error}`);
    handleError(error, res);
  }
};

const expenseController = {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
  downloadExcel,
};

export default expenseController;
