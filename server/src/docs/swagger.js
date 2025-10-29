import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Assignment API",
      version: "1.0.0",
      description: "Auth (JWT), RBAC, and Tasks CRUD"
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            createdAt: { type: "string" },
            updatedAt: { type: "string" }
          }
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            completed: { type: "boolean" },
            owner: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" }
          }
        }
      }
    }
  },
  apis: [
    "./src/routes/*.js"
  ]
};

export const swaggerSpec = swaggerJSDoc(options);

