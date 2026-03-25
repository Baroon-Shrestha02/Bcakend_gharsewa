import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/errorHandler.js";
import swaggerSpec from "./config/swagger.js";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import docRoutes from "./routes/kycRoutes.js";

import jobRoutes from "./routes/jobRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },

//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/rating", reviewRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/documents", docRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(globalErrorHandler);

export default app;
