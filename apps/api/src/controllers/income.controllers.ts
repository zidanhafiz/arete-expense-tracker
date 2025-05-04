import { logger } from "../config/logger";
import Income from "../models/income.models";
import { Request, Response } from "express";
import { handleError } from "../utils/errorHandling";
import { createIncomeSchema, updateIncomeSchema } from "../utils/incomeSchemas";
import Source from "../models/source.models";
import mongoose from "mongoose";
import { SourceDoc } from "../models/source.models";
import ExcelJS from "exceljs";
import {
  deleteImageFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/cloudinaryUtils";

const createIncome = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const { icon, name, amount, date, description, source_id, images } =
      createIncomeSchema.parse(req.body);

    const source = await Source.findOne({
      _id: source_id,
      user: userId,
    });

    if (!source) {
      logger.error(`Source not found: ${source_id} by user: ${userId}`);
      res.status(404).json({ message: "Source not found" });
      return;
    }

    const dateObj = new Date(date);

    const income = await Income.create({
      user: userId,
      icon,
      name,
      amount,
      date: dateObj,
      description,
      source: source._id,
      images,
    });

    logger.info(`Income created: ${income.id} by user: ${userId}`);
    res.status(201).json({ message: "Income created successfully", income });
  } catch (error) {
    logger.error("Error creating income", error);
    handleError(error, res);
  }
};

const listIncomes = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, search = "", source = "" } = req.query;

    const filter: any = { user: userId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (source) {
      let sourceId: string | undefined;
      if (mongoose.isValidObjectId(source as string)) {
        sourceId = source as string;
      } else {
        const sourceDoc = await Source.findOne({ name: source, user: userId });
        if (!sourceDoc) {
          res.status(200).json({
            message: "Incomes listed successfully",
            page: 1,
            limit: 10,
            total: 0,
            incomes: [],
          });
          return;
        }
        sourceId = sourceDoc._id.toString();
      }
      filter.source = sourceId;
    }

    const incomes = await Income.find(filter)
      .populate("source")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalPages = Math.ceil(incomes.length / Number(limit));

    logger.info(`Incomes listed: ${incomes.length} by user: ${userId}`);
    res.status(200).json({
      message: "Incomes listed successfully",
      page: Number(page),
      limit: Number(limit),
      total: incomes.length,
      totalPages,
      incomes,
    });
  } catch (error) {
    logger.error(`Error listing incomes: ${error}`);
    handleError(error, res);
  }
};

const getIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const income = await Income.findOne({ _id: id, user: userId }).populate(
      "source"
    );

    if (!income) {
      logger.error(`Income not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Income not found" });
      return;
    }

    logger.info(`Income found: ${income.id} by user: ${userId}`);
    res.status(200).json({
      message: "Income found successfully",
      income,
    });
  } catch (error) {
    logger.error(`Error getting income: ${error}`);
    handleError(error, res);
  }
};

const updateIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { icon, name, description, amount, source_id, images } =
      updateIncomeSchema.parse(req.body);

    const source = await Source.findOne({
      _id: source_id,
      user: userId,
    });

    if (!source) {
      logger.error(`Source not found: ${source_id} by user: ${userId}`);
      res.status(404).json({ message: "Source not found" });
      return;
    }

    const income = await Income.findOneAndUpdate(
      { _id: id, user: userId },
      { icon, name, description, amount, source: source._id, images },
      { new: true }
    );

    if (!income) {
      logger.error(`Income not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Income not found" });
      return;
    }

    logger.info(`Income updated: ${income.id} by user: ${userId}`);
    res.status(200).json({
      message: "Income updated successfully",
      income,
    });
  } catch (error) {
    logger.error(`Error updating income: ${error}`);
    handleError(error, res);
  }
};

const deleteIncomeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const income = await Income.findOne({ _id: id, user: userId });

    if (!income) {
      logger.error(`Income not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Income not found" });
      return;
    }

    if (income.images) {
      const results = await Promise.allSettled(
        income.images.map(async (image) => {
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

    const deletedIncome = await Income.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedIncome) {
      logger.error(`Income not found: ${id} by user: ${userId}`);
      res.status(404).json({ message: "Income not found" });
      return;
    }

    logger.info(`Income deleted: ${id} by user: ${userId}`);
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting income: ${error}`);
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
      if (fromDate) filter.date.$gte = new Date(fromDate as string);
      if (toDate) filter.date.$lte = new Date(toDate as string);
    }

    const incomes = await Income.find(filter).populate("source");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Incomes");

    worksheet.addRow([
      "Date",
      "Name",
      "Amount",
      "Source",
      "Description",
      "Images",
    ]);
    incomes.forEach((income) => {
      worksheet.addRow([
        income.date,
        income.name,
        income.amount,
        (income.source as unknown as SourceDoc)?.name || "Uncategorized",
        income.description,
        income.images?.join(", "),
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=incomes.xlsx");

    await workbook.xlsx.write(res);
  } catch (error) {
    logger.error(`Error downloading excel: ${error}`);
    handleError(error, res);
  }
};

const incomeController = {
  createIncome,
  listIncomes,
  getIncomeById,
  updateIncomeById,
  deleteIncomeById,
  downloadExcel,
};

export default incomeController;
