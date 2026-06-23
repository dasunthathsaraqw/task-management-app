import { IUser } from "../models/User";
import {
  findUserByEmail,
  createUser,
  findUserByFilter,
} from "../repositories/userRepository";
import { createAuthTokens, verifyRefreshToken } from "../utils/jwt";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface LoginData {
  email: string;
  password: string;
  role?: string;
}

export const registerUser = async (userData: RegisterData) => {
  // Check if user already exists
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    return {
      success: false,
      status: 400,
      message: "User already exists with this email",
    };
  }

  // Create user
  const user = await createUser({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role || "user",
  });

  // Generate tokens
  const tokens = createAuthTokens(user);

  return {
    success: true,
    status: 201,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    },
  };
};

export const loginUser = async (loginData: LoginData) => {
  // Validate role
  if (loginData.role && !["admin", "user"].includes(loginData.role)) {
    return {
      success: false,
      status: 400,
      message: "Invalid role specified",
    };
  }

  // Find user by email with password
  const user = await findUserByEmail(loginData.email);
  if (!user) {
    return {
      success: false,
      status: 401,
      message: "Invalid credentials",
    };
  }

  // Check role if specified
  if (loginData.role && user.role !== loginData.role) {
    return {
      success: false,
      status: 403,
      message: `Invalid credentials for role: ${loginData.role}`,
    };
  }

  // Check password
  const isPasswordValid = await user.comparePassword(loginData.password);
  if (!isPasswordValid) {
    return {
      success: false,
      status: 401,
      message: "Invalid credentials",
    };
  }

  // Generate tokens
  const tokens = createAuthTokens(user);

  return {
    success: true,
    status: 200,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    return {
      success: false,
      status: 400,
      message: "Refresh token required",
    };
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return {
      success: false,
      status: 401,
      message: "Invalid refresh token",
    };
  }

  // Find user to ensure they still exist
  const user = await findUserByFilter({ _id: decoded.id });
  if (!user) {
    return {
      success: false,
      status: 401,
      message: "User not found",
    };
  }

  // Generate new tokens
  const tokens = createAuthTokens(user);

  return {
    success: true,
    status: 200,
    message: "Token refreshed successfully",
    data: tokens,
  };
};
