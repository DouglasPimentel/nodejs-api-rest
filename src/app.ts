import "reflect-metadata";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { initializeDatabase } from "#/database/data-source";
import { rootRoutes, authRoutes, userRoutes, toolRoutes } from "#/routes";
import { authMiddleware } from "#/middlewares/auth";

initializeDatabase();

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
    allowHeaders: ["Origin", "Content-Type", "Authorization"],
    allowMethods: ["OPTIONS", "GET", "POST", "PATCH", "PUT", "DELETE"],
    maxAge: 600,
    credentials: true,
  })
);
app.use("*", logger());
app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
app.use("/api/v1/*", authMiddleware);

// routes
app.route("/", rootRoutes);
app.route("/auth", authRoutes);
app.route("/api/v1/users", userRoutes);
app.route("/api/v1/tools", toolRoutes);
