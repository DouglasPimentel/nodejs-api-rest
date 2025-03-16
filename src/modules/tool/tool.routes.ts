import { Hono } from "hono";
import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { Tool } from "#/modules/tool/tool.entity";
import {
  getAllTools,
  checkToolExistsByName,
  createTool,
  toolById,
  updateTool,
  deleteTool,
} from "#/modules/tool/tool.service";
import {
  createToolSchema,
  updateToolSchema,
  getAllToolSuccessReponseSchema,
  createToolSuccessResponseSchema,
  getByIdSuccessResponseSchema,
  toolUpdateSuccessReponseSchema,
  toolDeleteSuccessReponseSchema,
  toolResourceConflitResponseSchema,
  toolNotFoundResponseSchema,
} from "#/modules/tool/schemas";
import {
  tokenNotProvidedResponseSchema,
  tokenInvalidOrExpiredResponseSchema,
} from "#/schemas";

export const toolRoutes = new Hono();

toolRoutes.get(
  "/",
  describeRoute({
    description: "Returns list of tools (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(getAllToolSuccessReponseSchema),
          },
        },
      },
      401: {
        description: "Token not provided",
        content: {
          "application/json": {
            schema: resolver(tokenNotProvidedResponseSchema),
          },
        },
      },
      403: {
        description: "Token invalid or expired",
        content: {
          "application/json": {
            schema: resolver(tokenInvalidOrExpiredResponseSchema),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
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
  }
);

toolRoutes.post(
  "/",
  describeRoute({
    description: "Create new tool (requires authentication)",
    responses: {
      201: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createToolSuccessResponseSchema),
          },
        },
      },
      401: {
        description: "Token not provided",
        content: {
          "application/json": {
            schema: resolver(tokenNotProvidedResponseSchema),
          },
        },
      },
      403: {
        description: "Token invalid or expired",
        content: {
          "application/json": {
            schema: resolver(tokenInvalidOrExpiredResponseSchema),
          },
        },
      },
      409: {
        description: "Resource conflict response",
        content: {
          "application/json": {
            schema: resolver(toolResourceConflitResponseSchema),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", createToolSchema),
  async (c) => {
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
  }
);

toolRoutes.get(
  "/:id",
  describeRoute({
    description: "Get tool by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(getByIdSuccessResponseSchema),
          },
        },
      },
      401: {
        description: "Token not provided",
        content: {
          "application/json": {
            schema: resolver(tokenNotProvidedResponseSchema),
          },
        },
      },
      403: {
        description: "Token invalid or expired",
        content: {
          "application/json": {
            schema: resolver(tokenInvalidOrExpiredResponseSchema),
          },
        },
      },
      404: {
        description: "Tool not found response",
        content: {
          "application/json": {
            schema: resolver(toolNotFoundResponseSchema),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
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
  }
);

toolRoutes.put(
  "/:id",
  describeRoute({
    description: "Update tool by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(toolUpdateSuccessReponseSchema),
          },
        },
      },
      401: {
        description: "Token not provided",
        content: {
          "application/json": {
            schema: resolver(tokenNotProvidedResponseSchema),
          },
        },
      },
      403: {
        description: "Token invalid or expired",
        content: {
          "application/json": {
            schema: resolver(tokenInvalidOrExpiredResponseSchema),
          },
        },
      },
      404: {
        description: "Tool not found response",
        content: {
          "application/json": {
            schema: resolver(toolNotFoundResponseSchema),
          },
        },
      },
    },
    validateResponse: true,
  }),
  zValidator("json", updateToolSchema),
  async (c) => {
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
  }
);

toolRoutes.delete(
  "/:id",
  describeRoute({
    description: "Delete tool by id (requires authentication)",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(createToolSuccessResponseSchema),
          },
        },
      },
      401: {
        description: "Token not provided",
        content: {
          "application/json": {
            schema: resolver(tokenNotProvidedResponseSchema),
          },
        },
      },
      403: {
        description: "Token invalid or expired",
        content: {
          "application/json": {
            schema: resolver(tokenInvalidOrExpiredResponseSchema),
          },
        },
      },
      404: {
        description: "Tool not found response",
        content: {
          "application/json": {
            schema: resolver(toolNotFoundResponseSchema),
          },
        },
      },
    },
    validateResponse: true,
  }),
  async (c) => {
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
  }
);
