import swaggerJSDoc from "swagger-jsdoc";

const serverUrl =
  process.env.PUBLIC_API_URL ||
  (process.env.FLY_APP_NAME ? `https://${process.env.FLY_APP_NAME}.fly.dev` : "http://localhost:5000");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task API",
      version: "1.0.0",
      description: "Multi-tenant Task Management API (JWT auth + RBAC)",
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
