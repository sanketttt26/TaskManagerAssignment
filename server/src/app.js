import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { router as authRouter } from "./routes/auth.js";
import { router as taskRouter } from "./routes/tasks.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";

const app = express();

// Security and parsers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API v1 routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", taskRouter);

// Docs
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

