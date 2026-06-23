import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
} from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";
import yupValidator from "../middleware/yupValidator";
import { registerSchema, loginSchema } from "../validations/authValidation";

const authRouter = Router();

// Public routes
authRouter.post("/register", yupValidator(registerSchema), register);
authRouter.post("/login", yupValidator(loginSchema), login);
authRouter.post("/refresh-token", refreshToken);

// Protected routes
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, getCurrentUser);

// Admin only route example
authRouter.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  return res.json({
    success: true,
    message: "Admin access granted",
    user: req.user,
  });
});

// User or Admin route example
authRouter.get(
  "/user-access",
  authenticate,
  authorize(["user", "admin"]),
  (req, res) => {
    return res.json({
      success: true,
      message: "User or Admin access granted",
      user: req.user,
    });
  },
);

export default authRouter;
