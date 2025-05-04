import { z } from "zod";

export const createIncomeSchema = z.object({
  icon: z.string().min(1, "Icon is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  source_id: z
    .string()
    .min(1, "Source is required")
    .max(100, "Source must be less than 100 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .max(300, "Date must be less than 300 characters"),
});

export const updateIncomeSchema = createIncomeSchema.partial();
