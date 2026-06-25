import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
} from "../controllers/userController";

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id/role", updateUserRole);
userRouter.delete("/:id", deleteUser);
userRouter.get("/:id/stats", getUserStats);

export default userRouter;
