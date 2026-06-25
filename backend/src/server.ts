import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/database";
import authRouter from "./routes/authRoutes";
import adminRouter from "./routes/adminRoutes";
import userTaskRouter from "./routes/userTaskRoutes";
import { authenticate } from "./middleware/auth";

// Load environment variables
dotenv.config();

// Initialize express
const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

// Normal User Routes (must be registered BEFORE adminRouter to avoid the
// catch-all authorize("admin") middleware blocking normal users)
app.use("/api/user/tasks", authenticate, userTaskRouter);

// Admin Routes (Task, User, Reports)
app.use("/api", adminRouter);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Task Management API is running!" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on PORT : ${port}`);
});

export default app;
