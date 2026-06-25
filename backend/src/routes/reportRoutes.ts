import { Router } from "express";
import {
  getTaskSummary,
  getUserActivity,
  getCompletionRate,
} from "../controllers/reportController";

const reportRouter = Router();

reportRouter.get("/tasks-summary", getTaskSummary);
reportRouter.get("/user-activity", getUserActivity);
reportRouter.get("/completion-rate", getCompletionRate);

export default reportRouter;
