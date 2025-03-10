import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import logger from "#/logger";
import { User } from "#/modules/user/user.entity";
import {
  checkUserExistsByEmail,
  createUser,
} from "#/modules/user/user.service";
import { hashPassword } from "#/utils/hashPassword";
import { verifyPassword } from "#/utils/verifyPassword";
import { generateToken } from "#/modules/auth/auth.module";

export const authRoutes = new Hono();

const signupSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

authRoutes.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { firstName, lastName, email, password } = c.req.valid("json");

  try {
    const user: User | null = await checkUserExistsByEmail(email);

    if (user) {
      logger.warn(
        { email },
        "Attempt to register with an existing email address"
      );
      return c.json<{ success: boolean; error: string; statusCode: number }>(
        { success: false, error: "Email already registered", statusCode: 400 },
        400,
        {
          "Content-Type": "application/json",
        }
      );
    }

    const hashPass: string = await hashPassword(password);

    const newUser: User = await createUser(
      firstName,
      lastName,
      email,
      hashPass
    );

    return c.json<{ success: boolean; message: string; user: User }>(
      {
        success: true,
        message: "New User Created",
        user: newUser,
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
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const user: User | null = await checkUserExistsByEmail(email);

    if (!user) {
      logger.warn({ email }, "User not found with that email");
      return c.json<{ success: boolean; error: string; statusCode: number }>(
        { success: false, error: "Email not registered", statusCode: 400 },
        400,
        {
          "Content-Type": "application/json",
        }
      );
    }

    const checkPassword: boolean | null = await verifyPassword(
      user.password,
      password
    );

    if (!checkPassword && checkPassword === null) {
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
});
