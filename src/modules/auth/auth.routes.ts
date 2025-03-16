import "zod-openapi/extend";
import { Hono } from "hono";
import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import logger from "#/logger";
import { User } from "#/modules/user/user.entity";
import {
  checkUserExistsByEmail,
  createUser,
} from "#/modules/user/user.service";
import { verifyPassword } from "#/utils/verifyPassword";
import { generateToken } from "#/modules/auth/auth.module";

export const authRoutes = new Hono();

const signupSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

authRoutes.post(
  "/signup",
  describeRoute({
    description: "Register a new user",
    responses: {
      201: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean().openapi({ example: true }),
                message: z.string().openapi({ example: "New User Created" }),
                user: z.object({
                  id: z.string().uuid(),
                  firstName: z.string().openapi({ example: "John" }),
                  lastName: z.string().openapi({ example: "Doe" }),
                  email: z
                    .string()
                    .email()
                    .openapi({ example: "john@example.com" }),
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
                  role: z
                    .enum(["owner", "manager", "viewer"])
                    .openapi({ example: "viewer" }),
                  createdAt: z.string().datetime(),
                  updatedAt: z.string().datetime(),
                }),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 201 }),
              })
            ),
          },
        },
      },
      409: {
        description: "Resource conflict response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                error: z.string(),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 409 }),
              })
            ),
          },
        },
      },
      500: {
        description: "Server error response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                error: z.string(),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 500 }),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", signupSchema),
  async (c) => {
    const { firstName, lastName, email, password } = c.req.valid("json");

    try {
      const user: User | null = await checkUserExistsByEmail(email);

      if (user) {
        logger.warn(
          { email },
          "Attempt to register with an existing email address"
        );
        return c.json<{ success: boolean; error: string; statusCode: number }>(
          {
            success: false,
            error: "Email already registered",
            statusCode: 409,
          },
          409,
          {
            "Content-Type": "application/json",
          }
        );
      }

      const newUser: User = await createUser(
        firstName,
        lastName,
        email,
        password
      );

      return c.json<{
        success: boolean;
        message: string;
        user: User;
        statusCode: number;
      }>(
        {
          success: true,
          message: "New User Created",
          user: newUser,
          statusCode: 201,
        },
        201,
        { "Content-Type": "application/json" }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error.message);
      }

      return c.json<{ success: boolean; error: string; statusCode: number }>(
        {
          success: false,
          error: "Failed to register user",
          statusCode: 500,
        },
        500,
        {
          "Content-Type": "application/json",
        }
      );
    }
  }
);

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

authRoutes.post(
  "/login",
  describeRoute({
    description: "Authenticates a user and returns a JWT token",
    responses: {
      200: {
        description: "Success response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean().openapi({ example: true }),
                message: z.string().openapi({ example: "Login Success" }),
                accessToken: z.string(),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 200 }),
              })
            ),
          },
        },
      },
      400: {
        description: "Invalid password response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean().openapi({ example: false }),
                error: z.string().openapi({ example: "Invalid password" }),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 400 }),
              })
            ),
          },
        },
      },
      404: {
        description: "User not found response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean().openapi({ example: false }),
                error: z.string().openapi({ example: "Email not registered" }),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 404 }),
              })
            ),
          },
        },
      },
      500: {
        description: "Server error response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean().openapi({ example: false }),
                error: z
                  .string()
                  .openapi({ example: "User login attempt failed" }),
                statusCode: z
                  .number()
                  .openapi({ description: "Status code", example: 500 }),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", loginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");

    try {
      const user: User | null = await checkUserExistsByEmail(email);

      if (!user) {
        logger.warn({ email }, "User not found with that email");
        return c.json<{ success: boolean; error: string; statusCode: number }>(
          { success: false, error: "Email not registered", statusCode: 404 },
          404,
          {
            "Content-Type": "application/json",
          }
        );
      }

      const checkPassword: boolean | null = await verifyPassword(
        user.password,
        password
      );

      if (!checkPassword) {
        logger.warn({ password }, "Invalid password");
        return c.json<{ success: boolean; error: string; statusCode: number }>(
          { success: false, error: "Invalid password", statusCode: 400 },
          400,
          {
            "Content-Type": "application/json",
          }
        );
      }

      const accessToken: string = await generateToken(user.id);

      return c.json<{
        success: boolean;
        message: string;
        accessToken: string;
        statusCode: number;
      }>(
        {
          success: true,
          message: "Login Success",
          accessToken,
          statusCode: 200,
        },
        200,
        { "Content-Type": "application/json" }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error.message);
      }

      return c.json<{ success: boolean; error: string; statusCode: number }>(
        {
          success: false,
          error: "User login attempt failed",
          statusCode: 500,
        },
        500,
        {
          "Content-Type": "application/json",
        }
      );
    }
  }
);
