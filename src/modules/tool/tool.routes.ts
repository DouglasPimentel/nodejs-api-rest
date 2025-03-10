import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Tool } from "#/modules/tool/tool.entity";
import {
  getAllTools,
  checkToolExistsByName,
  createTool,
  toolById,
  updateTool,
  deleteTool,
} from "#/modules/tool/tool.service";

export const toolRoutes = new Hono();

toolRoutes.get("/", async (c) => {
  const tools: Tool[] = await getAllTools();

  return c.json<{
    success: boolean;
    message: string;
    tools: Tool[];
    counter: number;
    statusCode: 200;
  }>(
    {
      success: true,
      message: "Get list all tools",
      tools,
      counter: tools.length,
      statusCode: 200,
    },
    200,
    {
      "Content-Type": "application/json",
    }
  );
});

const createToolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  website: z.string().url({ message: "Website must be a url" }),
});

toolRoutes.post("/", zValidator("json", createToolSchema), async (c) => {
  const { name, description, website } = c.req.valid("json");

  const tool: Tool | null = await checkToolExistsByName(name);

  if (tool) {
    return c.json<{
      success: boolean;
      message: string;
      error: string;
      statusCode: number;
    }>(
      {
        success: false,
        message: "There is already a registered tool with that name",
        error: "Tool already registered",
        statusCode: 409,
      },
      409,
      {
        "Content-Type": "application/json",
      }
    );
  }

  const newTool: Tool = await createTool(name, description, website);

  return c.json<{
    success: boolean;
    message: string;
    tool: Tool;
    statusCode: number;
  }>(
    {
      success: true,
      message: "New Tool Created",
      tool: newTool,
      statusCode: 201,
    },
    201,
    {
      "Content-Type": "application/json",
    }
  );
});

toolRoutes.get("/:id", async (c) => {
  const id: string = c.req.param("id");

  const tool: Tool | null = await toolById(id);

  if (!tool) {
    return c.json<{
      success: boolean;
      message: string;
      error: string;
      statusCode: number;
    }>(
      {
        success: false,
        message: "Tool not found",
        error: "Unregistered tool",
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
    tool: Tool | null;
    statusCode: number;
  }>(
    {
      success: true,
      message: "Get tool by ID",
      tool,
      statusCode: 200,
    },
    200,
    {
      "Content-Type": "application/json",
    }
  );
});

const updateToolSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters long"),
  website: z.string().url({ message: "Website must be a url" }),
});

toolRoutes.put("/:id", zValidator("json", updateToolSchema), async (c) => {
  const id: string = c.req.param("id");

  const { name, description, website } = c.req.valid("json");

  const tool: Tool | null = await toolById(id);

  if (!tool) {
    return c.json<{
      success: boolean;
      message: string;
      error: string;
      statusCode: number;
    }>(
      {
        success: false,
        message: "Tool not found",
        error: "Unregistered tool",
        statusCode: 404,
      },
      404,
      {
        "Content-Type": "application/json",
      }
    );
  }

  await updateTool(id, name, description, website);

  const newTool: Tool | null = await toolById(id);

  return c.json<{
    success: boolean;
    message: string;
    tool: Tool | null;
    statusCode: number;
  }>(
    {
      success: true,
      message: "Tool Updated",
      tool: newTool,
      statusCode: 200,
    },
    200,
    {
      "Content-Type": "application/json",
    }
  );
});

toolRoutes.delete("/:id", async (c) => {
  const id: string = c.req.param("id");

  const tool: Tool | null = await toolById(id);

  if (!tool) {
    return c.json<{
      success: boolean;
      message: string;
      error: string;
      statusCode: number;
    }>(
      {
        success: false,
        message: "Tool not found",
        error: "Not Found",
        statusCode: 404,
      },
      404,
      {
        "Content-Type": "application/json",
      }
    );
  }

  await deleteTool(id);

  return c.json<{ success: boolean; message: string; statusCode: number }>(
    {
      success: true,
      message: `Tool with ID ${id} deleted with success`,
      statusCode: 200,
    },
    200,
    { "Content-Type": "application/json" }
  );
});
