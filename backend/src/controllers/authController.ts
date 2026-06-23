import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/authService";
import { response } from "../utils/response";

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return response({
      res,
      status: 400,
      message: "Username, email, and password are required",
    });
  }

  const result = await registerUser({ username, email, password, role });

  // If registration successful, set refresh token as cookie
  if (result.success && result.data?.refreshToken) {
    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  return response({ res, ...result });
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password) {
    return response({
      res,
      status: 400,
      message: "Email and password are required",
    });
  }

  const result = await loginUser({ email, password, role });

  // If login successful, set refresh token as cookie
  if (result.success && result.data?.refreshToken) {
    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  return response({ res, ...result });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const result = await refreshAccessToken(refreshToken);

  if (result.success && result.data?.refreshToken) {
    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  return response({ res, ...result });
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return response({
    res,
    status: 200,
    success: true,
    message: "Logged out successfully",
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  // User is already attached to request by auth middleware
  const user = (req as any).user;

  if (!user) {
    return response({
      res,
      status: 401,
      message: "User not authenticated",
    });
  }

  return response({
    res,
    status: 200,
    success: true,
    message: "User info retrieved successfully",
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
};
