import Expense from "../models/expense.models";
import { Request, Response } from "express";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../utils/expenseSchemas";
import { logger } from "../config/logger";
import { ZodError } from "zod";
import Category from "../models/category.models";
import mongoose from "mongoose";

const createExpense = async (req: Request, res: Response) => {
  try {
    const { icon, name, description, amount, category_id } =
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
    });

    logger.info(`Expense created: ${expense.id} by user: ${userId}`);
    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(`Error creating expense: ${error.message}`);
      res
        .status(400)
        .json({ message: "Invalid request body", errors: error.errors });
      return;
    }

    logger.error(`Error creating expense: ${error}`);
    res.status(500).json({ message: "Error creating expense" });
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

    logger.info(`Expenses listed: ${expenses.length} by user: ${userId}`);
    res.status(200).json({
      message: "Expenses listed successfully",
      page: Number(page),
      limit: Number(limit),
      total: expenses.length,
      expenses,
    });
  } catch (error) {
    logger.error(`Error listing expenses: ${error}`);
    res.status(500).json({ message: "Error listing expenses" });
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
    res.status(500).json({ message: "Error getting expense" });
  }
};

const updateExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { icon, name, description, amount, category_id } =
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
      { icon, name, description, amount, category: category._id },
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
    if (error instanceof ZodError) {
      logger.error(`Error updating expense: ${error.message}`);
      res
        .status(400)
        .json({ message: "Invalid request body", errors: error.errors });
      return;
    }
    logger.error(`Error updating expense: ${error}`);
    res.status(500).json({ message: "Error updating expense" });
  }
};

const deleteExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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
    res.status(500).json({ message: "Error deleting expense" });
  }
};

export default {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
};
