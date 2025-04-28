import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
});
