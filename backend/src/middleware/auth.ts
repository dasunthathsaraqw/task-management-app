import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/jwt";
import { response } from "../utils/response";
import { findUserById } from "../repositories/userRepository";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return response({
        res,
        status: 401,
        message: "No token provided. Please login.",
      });
    }

    const decoded = verifyJWT(token);

    if (!decoded) {
      return response({
        res,
        status: 401,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // Verify user still exists
    const user = await findUserById(decoded.id);
    if (!user) {
      return response({
        res,
        status: 401,
        message: "User not found. Please login again.",
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return response({
      res,
      status: 500,
      message: "Authentication error",
    });
  }
};

export const authorize = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return response({
        res,
        status: 401,
        message: "User not authenticated",
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return response({
        res,
        status: 403,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
