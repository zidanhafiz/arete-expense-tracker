import { z } from "zod";

export const createSourceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  icon: z.string().min(1, { message: "Icon is required" }),
});

export const updateSourceSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  icon: z.string().min(1, { message: "Icon is required" }),
});
