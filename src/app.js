import express from "express";
import cors from "cors";
import morgan from "morgan";
import prisma from "./lib/prisma.js"; // make sure this path matches your project
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

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/projects", projectsRoutes);
app.use("/", tasksRoutes);

// Swagger docs
app.get("/docs.json", (req, res) => res.json(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/*
  ========================
  ROUTES
  ========================
*/

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/auth", authRoutes);

// DB test route
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
  ERROR HANDLER
  ========================
*/

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    error: "Internal Server Error",
  });
});

export default app;
