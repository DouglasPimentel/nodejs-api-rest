import "zod-openapi/extend";
import { z } from "zod";

export const tokenNotProvidedResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Token not provided" }),
  statusCode: z.number().openapi({ description: "Status code", example: 401 }),
});

export const tokenInvalidResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Invalid token" }),
  statusCode: z.number().openapi({ description: "Status code", example: 401 }),
});

export const tokenInvalidOrExpiredResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Invalid or expired token" }),
  error: z.string(),
  statusCode: z.number().openapi({ description: "Status code", example: 403 }),
});
