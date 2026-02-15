import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task API",
      version: "1.0.0",
      description: "Multi-tenant Task Management API (JWT auth + RBAC)",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  // Tell swagger-jsdoc where to look for JSDoc comments
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
