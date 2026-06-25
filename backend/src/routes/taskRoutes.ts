import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  bulkUpdateStatus,
  bulkDeleteTasks,
  exportTasksCSV,
} from "../controllers/taskController";
import yupValidator from "../middleware/yupValidator";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  assignTaskSchema,
} from "../validations/taskValidation";

const taskRouter = Router();

// Bulk & Export operations (placed before :id to prevent collision)
taskRouter.get("/export/csv", exportTasksCSV);
taskRouter.patch("/bulk/status", bulkUpdateStatus);
taskRouter.delete("/bulk", bulkDeleteTasks);

// Standard CRUD
taskRouter.get("/", getAllTasks);
taskRouter.get("/:id", getTaskById);
taskRouter.post("/", yupValidator(createTaskSchema), createTask);
taskRouter.put("/:id", yupValidator(updateTaskSchema), updateTask);
taskRouter.delete("/:id", deleteTask);

// Specific fields
taskRouter.patch("/:id/status", yupValidator(updateStatusSchema), updateTaskStatus);
taskRouter.patch("/:id/assign", yupValidator(assignTaskSchema), assignTask);

export default taskRouter;
