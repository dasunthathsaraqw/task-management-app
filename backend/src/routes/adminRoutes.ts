import { Router } from "express";
import taskRouter from "./taskRoutes";
import userRouter from "./userRoutes";
import reportRouter from "./reportRoutes";
import { authenticate, authorize } from "../middleware/auth";

const adminRouter = Router();

// Apply auth and admin authorization globally to all sub-routes
adminRouter.use(authenticate);
adminRouter.use(authorize("admin"));

adminRouter.use("/tasks", taskRouter);
adminRouter.use("/users", userRouter);
adminRouter.use("/reports", reportRouter);

export default adminRouter;
