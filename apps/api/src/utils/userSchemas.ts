import z from "zod";

export const registerUserSchema = z
  .object({
    first_name: z
      .string()
      .min(3, { message: "First name must be at least 3 characters long" })
      .max(100, {
        message: "First name must be less than 100 characters long",
      }),
    last_name: z
      .string()
      .min(3, { message: "Last name must be at least 3 characters long" })
      .max(100, { message: "Last name must be less than 100 characters long" }),
    nickname: z
      .string()
      .min(3, { message: "Nickname must be at least 3 characters long" })
      .max(100, { message: "Nickname must be less than 100 characters long" }),
    email: z
      .string()
      .email({ message: "Invalid email address" })
      .min(3, { message: "Email must be at least 3 characters long" })
      .max(100, { message: "Email must be less than 100 characters long" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password must be less than 100 characters long" }),
    confirm_password: z
      .string()
      .min(8, {
        message: "Confirm password must be at least 8 characters long",
      })
      .max(100, {
        message: "Confirm password must be less than 100 characters long",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export type LoginUserSchema = z.infer<typeof loginUserSchema>;

export const updateUserSchema = z.object({
  first_name: z
    .string()
    .min(3, { message: "First name must be at least 3 characters long" })
    .max(100, {
      message: "First name must be less than 100 characters long",
    })
    .optional(),
  last_name: z
    .string()
    .min(3, { message: "Last name must be at least 3 characters long" })
    .max(100, {
      message: "Last name must be less than 100 characters long",
    })
    .optional(),
  nickname: z
    .string()
    .min(3, { message: "Nickname must be at least 3 characters long" })
    .max(100, {
      message: "Nickname must be less than 100 characters long",
    })
    .optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, {
      message: "Password must be less than 100 characters long",
    })
    .optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
