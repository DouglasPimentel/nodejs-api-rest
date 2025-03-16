import "zod-openapi/extend";
import { z } from "zod";

export const createToolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  website: z.string().url({ message: "Website must be a url" }),
});

export const updateToolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  website: z.string().url({ message: "Website must be a url" }),
});

export const toolExampleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().openapi({ example: "OpenAI" }),
  description: z.string().openapi({
    example:
      "A OpenAI é uma empresa e laboratório de pesquisa de inteligência artificial estadunidense.",
  }),
  website: z.string().url().openapi({ example: "http://openai.com/" }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const getAllToolSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Get list all tools" }),
  tool: z.array(toolExampleSchema),
  counter: z.number().openapi({ example: 0 }),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const createToolSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "New Tool Created" }),
  tool: toolExampleSchema,
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const getByIdSuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Get tool by ID" }),
  tool: toolExampleSchema,
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const toolNotFoundResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Tool not found" }),
  error: z.string().openapi({ example: "Unregistered tool" }),
  statusCode: z.number().openapi({ description: "Status code", example: 404 }),
});

export const toolResourceConflitResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "There is already a registered tool with that name",
  }),
  error: z.string().openapi({ example: "Tool already registered" }),
  statusCode: z.number().openapi({ description: "Status code", example: 409 }),
});

export const toolUpdateSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Tool Updated" }),
  tool: z.nullable(toolExampleSchema),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});

export const toolDeleteSuccessReponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example:
      "Tool with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 deleted with success",
  }),
  statusCode: z.number().openapi({ description: "Status code", example: 200 }),
});
