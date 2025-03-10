import { type Context, type Next, type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { JWTPayload } from "jose";
import { verifyToken } from "#/modules/auth/auth.module";
import { User, UserRole } from "#/modules/user/user.entity";
import { userById } from "#/modules/user/user.service";
import logger from "#/logger";

export const authMiddleware: MiddlewareHandler<any, any, {}> = createMiddleware(
  async (c: Context, next: Next) => {
    const authHeader: string | undefined = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json<{ success: boolean; message: string; statusCode: number }>(
        {
          success: false,
          message: "Token not provided",
          statusCode: 401,
        },
        401,
        {
          "Content-Type": "application/json",
        }
      );
    }

    const token: string | undefined = authHeader.split(" ")[1];

    try {
      if (!token) {
        return c.json<{
          success: boolean;
          message: string;
          statusCode: number;
        }>(
          {
            success: false,
            message: "Token not provided",
            statusCode: 401,
          },
          401,
          {
            "Content-Type": "application/json",
          }
        );
      }

      const payload: JWTPayload | null = await verifyToken(token);

      if (!payload) {
        return c.json<{ success: boolean; error: string; statusCode: number }>(
          { success: false, error: "Invalid token", statusCode: 401 },
          401,
          {
            "Content-Type": "application/json",
          }
        );
      }

      c.set("userId", payload.userId);

      return await next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(error.message);

        return c.json<{
          success: boolean;
          message: string;
          error: string;
          statusCode: number;
        }>(
          {
            success: false,
            message: "Invalid or expired token",
            error: error.message,
            statusCode: 403,
          },
          403,
          {
            "Content-Type": "application/json",
          }
        );
      }
    }
  }
);

type Variables = {
  userId: string;
};

export const adminMiddleware: MiddlewareHandler<
  {
    Variables: Variables;
  },
  string,
  {}
> = createMiddleware<{
  Variables: Variables;
}>(async (c: Context, next: Next) => {
  const userId: string = c.get("userId");

  const user: User | null = await userById(userId);

  if (!user) {
    return c.json<{ success: boolean; message: string; statusCode: number }>(
      {
        success: false,
        message: "User not found",
        statusCode: 404,
      },
      404,
      { "Content-Type": "application/json" }
    );
  }

  if (user.role !== UserRole.OWNER) {
    return c.json<{ success: boolean; message: string; statusCode: number }>(
      {
        success: false,
        message: "Access denied, administrators only",
        statusCode: 403,
      },
      403,
      { "Content-Type": "application/json" }
    );
  }

  return await next();
});
