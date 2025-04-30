import { Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const handleError = (error: any, res: Response) => {
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

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request body",
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
  });
};
