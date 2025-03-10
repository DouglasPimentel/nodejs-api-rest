import { createServer } from "node:http";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { app } from "#/app";
import logger from "#/logger";

dotenv.config({ path: ".env.local" });

const HOST: string = process.env.HOST || "localhost";
const PORT: number = Number(process.env.PORT) || 8080;

logger.info(`Server is running on http://${HOST}:${PORT}`);

serve({
  fetch: app.fetch,
  createServer,
  hostname: HOST,
  port: PORT,
});
