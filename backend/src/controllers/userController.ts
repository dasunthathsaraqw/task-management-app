import { Request, Response } from "express";
import User from "../models/User";
import Task from "../models/Task";
import { response } from "../utils/response";

/**
 * Get all users in the system (excluding passwords).
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");

    // Enhance users with quick stats
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const tasksCreated = await Task.countDocuments({ createdBy: user._id });
        const tasksAssigned = await Task.countDocuments({ assignedTo: user._id });
        const tasksCompleted = await Task.countDocuments({ assignedTo: user._id, status: "Done" });

        return {
          ...user.toObject(),
          stats: {
            tasksCreated,
            tasksAssigned,
            tasksCompleted,
          },
        };
      })
    );

    return response({
      res,
      status: 200,
      success: true,
      message: "Users retrieved successfully",
      data: enhancedUsers,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

/**
 * Get user by ID with detailed stats.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return response({
        res,
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    const tasksCreated = await Task.countDocuments({ createdBy: user._id });
    const tasksAssigned = await Task.countDocuments({ assignedTo: user._id });
    const tasksCompleted = await Task.countDocuments({ assignedTo: user._id, status: "Done" });

    return response({
      res,
      status: 200,
      success: true,
      message: "User retrieved successfully",
      data: {
        ...user.toObject(),
        stats: {
          tasksCreated,
          tasksAssigned,
          tasksCompleted,
        },
      },
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving user details",
      error: error.message,
    });
  }
};

/**
 * Update user role.
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Cannot demote yourself
    if (id === adminId) {
      return response({
        res,
        status: 400,
        success: false,
        message: "You cannot demote or change your own role",
      });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return response({
        res,
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    // 2. Enforce "at least one admin" if demoting an admin
    if (userToUpdate.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return response({
          res,
          status: 400,
          success: false,
          message: "Action blocked: The system must have at least one administrator",
        });
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    const updatedUser = await User.findById(id).select("-password");

    return response({
      res,
      status: 200,
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error updating user role",
      error: error.message,
    });
  }
};

/**
 * Delete a user account.
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    // 1. Cannot delete own account
    if (id === adminId) {
      return response({
        res,
        status: 400,
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return response({
        res,
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    // 2. Enforce "at least one admin" if deleting an admin
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return response({
          res,
          status: 400,
          success: false,
          message: "Action blocked: The system must have at least one administrator",
        });
      }
    }

    // Unassign tasks assigned to this user, or delete? Typically we unassign
    await Task.updateMany({ assignedTo: id }, { assignedTo: null });

    await User.findByIdAndDelete(id);

    return response({
      res,
      status: 200,
      success: true,
      message: "User deleted successfully and their tasks were unassigned",
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

/**
 * Get user stats (tasks created, assigned, completed).
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return response({
        res,
        status: 404,
        success: false,
        message: "User not found",
      });
    }

    const tasksCreated = await Task.countDocuments({ createdBy: id });
    const tasksAssigned = await Task.countDocuments({ assignedTo: id });
    const tasksCompleted = await Task.countDocuments({ assignedTo: id, status: "Done" });
    const tasksInProgress = await Task.countDocuments({ assignedTo: id, status: "In Progress" });
    const tasksTesting = await Task.countDocuments({ assignedTo: id, status: "Testing" });
    const tasksOpen = await Task.countDocuments({ assignedTo: id, status: "Open" });

    return response({
      res,
      status: 200,
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        userId: id,
        username: user.username,
        stats: {
          created: tasksCreated,
          assigned: tasksAssigned,
          completed: tasksCompleted,
          inProgress: tasksInProgress,
          testing: tasksTesting,
          open: tasksOpen,
          completionRate: tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0,
        },
      },
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving user statistics",
      error: error.message,
    });
  }
};
