import { z } from "zod";

export const createExpenseSchema = z.object({
  icon: z.string().min(1, { message: "Icon is required" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .default(""),
  amount: z
    .number()
    .min(1, { message: "Amount is required" })
    .max(100000000, { message: "Amount must be less than 100000000" }),
  category_id: z
    .string()
    .min(1, { message: "Category is required" })
    .max(100, { message: "Category must be less than 100 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  images: z.array(z.string()).optional(),
});

export const updateExpenseSchema = z.object({
  icon: z.string().min(1, { message: "Icon is required" }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .default(""),
  amount: z
    .number()
    .min(1, { message: "Amount is required" })
    .max(100000000, { message: "Amount must be less than 100000000" }),
  category_id: z
    .string()
    .min(1, { message: "Category is required" })
    .max(100, { message: "Category must be less than 100 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  images: z.array(z.string()).optional(),
});
