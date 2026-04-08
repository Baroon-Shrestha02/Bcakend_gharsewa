import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GharSewa Backend API",
      version: "1.0.0",
      description: "API documentation for GharSewa - Home services platform",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://bcakend-gharsewa.onrender.com",
        description: "Production server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Use Authorization header: Bearer <token>",
        },
      },
    },

    security: [],

    tags: [
      { name: "Auth", description: "Authentication and session management" },
      { name: "Admin", description: "Admin-only management operations" },
      { name: "User", description: "User profile and account actions" },
      { name: "Jobs", description: "Job creation and listing" },
      { name: "Workers", description: "Worker directory and management" },
      { name: "Staff", description: "Staff management operations" },
      { name: "Booking", description: "Job booking and reservations" },
      { name: "Categories", description: "Categories and Sub Categories" },
    ],
  },

  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
