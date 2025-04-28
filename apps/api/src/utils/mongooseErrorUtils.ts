import { Response } from "express";
import mongoose from "mongoose";

export const handleMongooseError = (
  error: any,
  res: Response,
) => {
  if (error instanceof mongoose.Error.DocumentNotFoundError) {
    res.status(404).json({
      message: "Not Found",
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      message: "Validation Error",
      errors: error.errors,
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(404).json({
      message: "Not Found",
    });
    return;
  }
};
