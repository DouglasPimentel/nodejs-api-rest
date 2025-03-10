import { Hono } from "hono";

export const rootRoutes = new Hono();

rootRoutes.get("/", (c) => {
  return c.json<{ success: boolean; message: string; statusCode: number }>(
    { success: true, message: "Node.js API REST", statusCode: 200 },
    200,
    {
      "Content-Type": "application/json",
    }
  );
});
