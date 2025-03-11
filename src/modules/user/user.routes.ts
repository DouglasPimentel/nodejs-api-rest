import { Hono } from "hono";
import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { User } from "#/modules/user/user.entity";
import {
  getAllUsers,
  checkUserExistsByEmail,
  createUser,
  userById,
  updateUser,
  deleteUser,
} from "#/modules/user/user.service";
import { adminMiddleware } from "#/middlewares/auth";

export const userRoutes = new Hono();

userRoutes.get(
  "/",
  describeRoute({
    description: "Returns list of users (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                users: z.array(z.instanceof(User)),
                counter: z.number(),
                statusCode: z.number(),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
    const users: User[] = await getAllUsers();

    return c.json<{
      success: boolean;
      message: string;
      users: User[];
      counter: number;
      statusCode: 200;
    }>(
      {
        success: true,
        message: "Get list all users",
        users,
        counter: users.length,
        statusCode: 200,
      },
      200,
      {
        "Content-Type": "application/json",
      }
    );
  }
);

const createUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

userRoutes.post(
  "/",
  adminMiddleware,
  describeRoute({
    description: "Create new user (requires authentication and admin role)",
    responses: {
      201: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                user: z.instanceof(User),
                statusCode: z.number(),
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
                message: z.string(),
                error: z.string(),
                statusCode: z.number(),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", createUserSchema),
  async (c) => {
    const { firstName, lastName, email, password } = c.req.valid("json");

    const user: User | null = await checkUserExistsByEmail(email);

    if (user) {
      return c.json<{
        success: boolean;
        message: string;
        error: string;
        statusCode: number;
      }>(
        {
          success: false,
          message: "There is already a registered user with that email",
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
      {
        "Content-Type": "application/json",
      }
    );
  }
);

userRoutes.get(
  "/:id",
  describeRoute({
    description: "Get user by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                user: z.nullable(z.instanceof(User)),
                statusCode: z.number(),
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
                success: z.boolean(),
                message: z.string(),
                error: z.string(),
                statusCode: z.number(),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
    const id: string = c.req.param("id");

    const user: User | null = await userById(id);

    if (!user) {
      return c.json<{
        success: boolean;
        message: string;
        error: string;
        statusCode: number;
      }>(
        {
          success: false,
          message: "User not found",
          error: "Unregistered user",
          statusCode: 404,
        },
        404,
        {
          "Content-Type": "application/json",
        }
      );
    }

    return c.json<{
      success: boolean;
      message: string;
      user: User | null;
      statusCode: number;
    }>(
      {
        success: true,
        message: "Get user by ID",
        user,
        statusCode: 200,
      },
      200,
      {
        "Content-Type": "application/json",
      }
    );
  }
);

const updateUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

userRoutes.put(
  "/:id",
  describeRoute({
    description: "Update user by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                user: z.nullable(z.instanceof(User)),
                statusCode: z.number(),
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
                success: z.boolean(),
                message: z.string(),
                error: z.string(),
                statusCode: z.number(),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", updateUserSchema),
  async (c) => {
    const id: string = c.req.param("id");

    const { firstName, lastName, email, password } = c.req.valid("json");

    const user: User | null = await userById(id);

    if (!user) {
      return c.json<{
        success: boolean;
        message: string;
        error: string;
        statusCode: number;
      }>(
        {
          success: false,
          message: "User not found",
          error: "Unregistered user",
          statusCode: 404,
        },
        404,
        {
          "Content-Type": "application/json",
        }
      );
    }

    await updateUser(id, firstName, lastName, email, password);

    const newUser: User | null = await userById(id);

    return c.json<{
      success: boolean;
      message: string;
      user: User | null;
      statusCode: number;
    }>(
      {
        success: true,
        message: "User Updated",
        user: newUser,
        statusCode: 200,
      },
      200,
      {
        "Content-Type": "application/json",
      }
    );
  }
);

userRoutes.delete(
  "/:id",
  describeRoute({
    description: "Delete user by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                message: z.string(),
                statusCode: z.number(),
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
                success: z.boolean(),
                message: z.string(),
                error: z.string(),
                statusCode: z.number(),
              })
            ),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
    const id: string = c.req.param("id");

    const user: User | null = await userById(id);

    if (!user) {
      return c.json<{
        success: boolean;
        message: string;
        error: string;
        statusCode: number;
      }>(
        {
          success: false,
          message: "User not found",
          error: "Not Found",
          statusCode: 404,
        },
        404,
        {
          "Content-Type": "application/json",
        }
      );
    }

    await deleteUser(id);

    return c.json<{ success: boolean; message: string; statusCode: number }>(
      {
        success: true,
        message: `User with ID ${id} deleted with success`,
        statusCode: 200,
      },
      200,
      { "Content-Type": "application/json" }
    );
  }
);
