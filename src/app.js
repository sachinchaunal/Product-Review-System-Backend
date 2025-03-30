import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { specs } from "./config/swagger.js";
import swaggerUi from "swagger-ui-express";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import productRoute from "./routes/product.route.js";
import fileRoute from "./routes/file.route.js";
import multer from "multer";

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use("/api/users", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/products", productRoute);
app.use("/api/files", fileRoute);

export default app;
