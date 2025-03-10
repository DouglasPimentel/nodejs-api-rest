import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
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

userRoutes.get("/", async (c) => {
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
});

const createUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

userRoutes.post(
  "/",
  adminMiddleware,
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

userRoutes.get("/:id", async (c) => {
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
});

const updateUserSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters long"),
  lastName: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.string().email("Invalid email"),
  password: z.string(),
});

userRoutes.put("/:id", zValidator("json", updateUserSchema), async (c) => {
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
});

userRoutes.delete("/:id", async (c) => {
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
});
