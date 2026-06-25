import { Router } from "express";
import {
  getUserTasks,
  createUserTask,
  updateUserTask,
  updateUserTaskStatus,
  deleteUserTask,
} from "../controllers/userTaskController";
import yupValidator from "../middleware/yupValidator";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from "../validations/taskValidation";

const userTaskRouter = Router();

// Standard user operations
userTaskRouter.get("/", getUserTasks);
userTaskRouter.post("/", yupValidator(createTaskSchema), createUserTask);
userTaskRouter.put("/:id", yupValidator(updateTaskSchema), updateUserTask);
userTaskRouter.patch("/:id/status", yupValidator(updateStatusSchema), updateUserTaskStatus);
userTaskRouter.delete("/:id", deleteUserTask);

export default userTaskRouter;
