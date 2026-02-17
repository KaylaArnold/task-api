import express from "express";
import cors from "cors";
import morgan from "morgan";

import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";

const app = express();

/*
  ========================
  MIDDLEWARE
  ========================
*/
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(morgan("dev"));

/*
  ========================
  CORE ROUTES (Public)
  ========================
*/
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "task-api",
    version: "root-route-v3",
    health: "/health",
    docs: "/docs/",
    docsJson: "/docs.json",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/*
  ========================
  API DOCS
  ========================
*/
app.get("/docs.json", (req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
  ========================
  APP ROUTES
  ========================
*/
app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);
app.use("/", tasksRoutes);

/*
  ========================
  DB TEST ROUTE (Dev Only)
  ========================
*/
app.get("/test-db", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/*
  ========================
  404 HANDLER
  ========================
*/
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Not Found",
    path: req.originalUrl,
  });
});

/*
  ========================
  ERROR HANDLER
  ========================
*/
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    ok: false,
    error: err.message || "Internal Server Error",
  });
});

export default app;
