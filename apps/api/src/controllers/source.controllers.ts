import { createSourceSchema, updateSourceSchema } from "../utils/sourceSchemas";
import Source from "../models/source.models";
import { Request, Response } from "express";
import { logger } from "../config/logger";
import { handleError } from "../utils/errorHandling";

const createSource = async (req: Request, res: Response) => {
  try {
    const { name, icon } = createSourceSchema.parse(req.body);
    const userId = req.userId;

    const source = await Source.create({ name, icon, user: userId });

    logger.info(`Source created: ${source.id} by user: ${userId}`);
    res.status(201).json({
      message: "Source created successfully",
      source,
    });
  } catch (error) {
    logger.error(`Error creating source: ${error}`);
    handleError(error, res);
  }
};

const listSources = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, search = "" } = req.query;

    const filter: any = { user: userId };

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const sources = await Source.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Source.countDocuments(filter);

    const totalPages = Math.ceil(total / Number(limit));

    logger.info(`Sources fetched: ${sources.length} by user: ${userId}`);
    res.status(200).json({
      message: "Sources fetched successfully",
      sources,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    });
  } catch (error) {
    logger.error(`Error fetching sources: ${error}`);
    handleError(error, res);
  }
};

const getSourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const source = await Source.findOne({ _id: id, user: userId });

    if (!source) {
      res.status(404).json({ message: "Source not found" });
      return;
    }

    logger.info(`Source fetched: ${source.id} by user: ${userId}`);
    res.status(200).json({
      message: "Source fetched successfully",
      source,
    });
  } catch (error) {
    logger.error(`Error fetching source: ${error}`);
    handleError(error, res);
  }
};

const updateSourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, icon } = updateSourceSchema.parse(req.body);

    const source = await Source.findOneAndUpdate(
      { _id: id, user: userId },
      { name, icon },
      { new: true }
    );

    if (!source) {
      res.status(404).json({ message: "Source not found" });
      return;
    }

    logger.info(`Source updated: ${source.id} by user: ${userId}`);
    res.status(200).json({
      message: "Source updated successfully",
      source,
    });
  } catch (error) {
    logger.error(`Error updating source: ${error}`);
    handleError(error, res);
  }
};

const deleteSourceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const source = await Source.findOneAndDelete({ _id: id, user: userId });

    if (!source) {
      res.status(404).json({ message: "Source not found" });
      return;
    }

    logger.info(`Source deleted: ${source.id} by user: ${userId}`);
    res.status(200).json({ message: "Source deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting source: ${error}`);
    handleError(error, res);
  }
};

const sourceController = {
  createSource,
  listSources,
  getSourceById,
  updateSourceById,
  deleteSourceById,
};

export default sourceController;
