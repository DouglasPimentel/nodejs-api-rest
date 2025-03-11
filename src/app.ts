import "reflect-metadata";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { initializeDatabase } from "#/database/data-source";
import { rootRoutes, authRoutes, userRoutes, toolRoutes } from "#/routes";
import { authMiddleware } from "#/middlewares/auth";
import { openAPISpecs } from "hono-openapi";
import { swaggerUI } from "@hono/swagger-ui";

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

app.get(
  "/doc",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "API REST Node.js with Hono",
        version: "1.0.0",
        description: "API REST Node.js",
        contact: {
          name: "API Support",
          url: "https://github.com/DouglasPimentel/nodejs-api-rest/issues",
          email: "dev.pimentel@gmail.com",
        },
        license: {
          name: "MIT",
          url: "https://github.com/DouglasPimentel/nodejs-api-rest?tab=MIT-1-ov-file#readme",
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [
        {
          url: "http://localhost:8080",
          description: "Local server",
        },
      ],
    },
  })
);

app.get("/ui", swaggerUI({ url: "/doc" }));
