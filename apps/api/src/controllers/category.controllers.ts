import {
  createCategorySchema,
  updateCategorySchema,
} from "../utils/categerySchemas";
import Category from "../models/category.models";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { handleMongooseError } from "../utils/mongooseErrorUtils";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon } = createCategorySchema.parse(req.body);
    const userId = req.userId;

    const category = await Category.create({ name, icon, user: userId });

    logger.info(`Category created: ${category.id} by user: ${userId}`);
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(`Error creating category: ${error.message}`);
      res.status(400).json({
        message: "Invalid request body",
        errors: error.errors,
      });
      return;
    }
    logger.error(`Error creating category: ${error}`);
    handleMongooseError(error, res);
    res.status(500).json({ message: "Internal server error" });
  }
};

const listCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, search = "" } = req.query;

    const filter: any = { user: userId };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const categories = await Category.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Category.countDocuments(filter);

    const totalPages = Math.ceil(total / Number(limit));

    logger.info(`Categories fetched: ${categories.length} by user: ${userId}`);
    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    logger.error(`Error fetching categories: ${error}`);
    handleMongooseError(error, res);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const category = await Category.findOne({ _id: id, user: userId });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    logger.info(`Category fetched: ${category.id} by user: ${userId}`);
    res.status(200).json({
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    logger.error(`Error fetching category: ${error}`);
    handleMongooseError(error, res);
    res.status(500).json({ message: "Error fetching category" });
  }
};

const updateCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, icon } = updateCategorySchema.parse(req.body);

    const category = await Category.findOneAndUpdate(
      { _id: id, user: userId },
      { name, icon },
      { new: true }
    );

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    logger.info(`Category updated: ${category.id} by user: ${userId}`);
    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error(`Error updating category: ${error.message}`);
      res.status(400).json({
        message: "Invalid request body",
        errors: error.errors,
      });
      return;
    }
    logger.error(`Error updating category: ${error}`);
    handleMongooseError(error, res);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const category = await Category.findOneAndDelete({ _id: id, user: userId });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    logger.info(`Category deleted: ${category.id} by user: ${userId}`);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting category: ${error}`);
    handleMongooseError(error, res);
    res.status(500).json({ message: "Error deleting category" });
  }
};

const categoryController = {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};

export default categoryController;
