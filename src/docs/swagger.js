import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task API",
      version: "1.0.0",
      description: "Multi-tenant Task Management API (JWT auth + RBAC)",
    },
    servers: [{ url: process.env.PUBLIC_API_URL || "http://localhost:5000" }],
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
