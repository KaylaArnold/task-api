import express from "express";
import cors from "cors";
import morgan from "morgan";

import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";

import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

console.log("SERVER.JS: before listen", { PORT });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Tell us *why* it exits (if it exits)
process.on("exit", (code) => console.log("SERVER.JS: process exit ❌", code));
process.on("SIGTERM", () => console.log("SERVER>JS: SIGTERM ⚠️"));
process.on("SIGINT", () => console.log("SERVER.JS: SIGINT ⚠️"));
process.on("uncaughtException", (e) => console.error("uncaughException", e));
process.on("unhandledRejection", (e) => console.error("unhandledRejection", e));

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
