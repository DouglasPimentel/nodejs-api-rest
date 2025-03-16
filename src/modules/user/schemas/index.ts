import "zod-openapi/extend";
import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

export const userExampleSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().openapi({ example: "John" }),
  lastName: z.string().openapi({ example: "Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  password: z
    .string()
    .describe(
      "Hashed password using Argon2. Example: $argon2id$v=19$m=65536,t=3,p=4$..."
    )
    .openapi({
      description:
        "Hashed password using Argon2. Example: $argon2id$v=19$m=65536,t=3,p=4$...",
      example: "$argon2id$v=19$m=65536,t=3,p=4$uPpL0H9...",
    }),
  active: z.boolean().openapi({ example: true }),
  role: z.enum(["owner", "manager", "viewer"]).openapi({ example: "viewer" }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const getAllUserSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Get list all users" }),
  users: z.array(userExampleSchema),
  counter: z.number().openapi({ example: 0 }),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const createUserSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "New User Created" }),
  user: userExampleSchema,
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const getByIdSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Get user by ID" }),
  user: userExampleSchema,
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const userNotFoundResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "User not found" }),
  error: z.string().openapi({ example: "Unregistered user" }),
  statusCode: z.number().openapi({ description: "Status code", example: 404 }),
});

export const userResourceConflitResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "There is already a registered user with that email",
  }),
  error: z.string().openapi({ example: "Email already registered" }),
  statusCode: z.number().openapi({ description: "Status code", example: 409 }),
});

export const userUpdateSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "User Updated" }),
  user: z.nullable(userExampleSchema),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const userDeleteSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example:
      "User with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 deleted with success",
  }),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});
