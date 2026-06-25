import { Request, Response } from "express";
import Task from "../models/Task";
import { response } from "../utils/response";

/**
 * Get tasks for the logged-in normal user.
 * Returns tasks created by the user or assigned to the user.
 */
export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const query = {
      $or: [{ createdBy: userId }, { assignedTo: userId }],
    };

    const tasks = await Task.find(query)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role")
      .sort({ createdAt: -1 });

    return response({
      res,
      status: 200,
      success: true,
      message: "User tasks retrieved successfully",
      data: {
        tasks,
      },
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving tasks",
      error: error.message,
    });
  }
};

/**
 * Create a new task as a normal user.
 */
export const createUserTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const validStatuses = ["Open", "In Progress", "Testing", "Done"];
    const taskStatus = status && validStatuses.includes(status) ? status : "Open";

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo: null, // Normal users cannot assign to others
      createdBy: userId,
      status: taskStatus,
      statusHistory: [
        {
          status: taskStatus,
          updatedAt: new Date(),
          updatedBy: userId,
        },
      ],
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role");

    return response({
      res,
      status: 201,
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

/**
 * Update an existing task as a normal user.
 */
export const updateUserTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return response({
        res,
        status: 404,
        success: false,
        message: "Task not found",
      });
    }

    // Verify authorization
    if (task.createdBy?.toString() !== userId && task.assignedTo?.toString() !== userId) {
      return response({
        res,
        status: 403,
        success: false,
        message: "Access denied",
      });
    }

    // Track status history if status changed
    if (status && status !== task.status) {
      task.statusHistory.push({
        status,
        updatedAt: new Date(),
        updatedBy: userId as any,
      });
      task.status = status;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role")
      .populate("statusHistory.updatedBy", "username email role");

    return response({
      res,
      status: 200,
      success: true,
      message: "Task updated successfully",
      data: populatedTask,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

/**
 * Update task status as a normal user.
 */
export const updateUserTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return response({
        res,
        status: 404,
        success: false,
        message: "Task not found",
      });
    }

    if (task.createdBy?.toString() !== userId && task.assignedTo?.toString() !== userId) {
      return response({
        res,
        status: 403,
        success: false,
        message: "Access denied",
      });
    }

    if (task.status === status) {
      return response({
        res,
        status: 200,
        success: true,
        message: "Status is already set to this value",
        data: task,
      });
    }

    task.status = status;
    task.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: userId as any,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role")
      .populate("statusHistory.updatedBy", "username email role");

    return response({
      res,
      status: 200,
      success: true,
      message: "Task status updated successfully",
      data: populatedTask,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error updating task status",
      error: error.message,
    });
  }
};

/**
 * Delete a task as a normal user.
 * Only the creator of the task can delete it.
 */
export const deleteUserTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return response({
        res,
        status: 404,
        success: false,
        message: "Task not found",
      });
    }

    // Only allow creator to delete
    if (task.createdBy?.toString() !== userId) {
      return response({
        res,
        status: 403,
        success: false,
        message: "Access denied: Only the creator can delete this task",
      });
    }

    await Task.findByIdAndDelete(id);

    return response({
      res,
      status: 200,
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};
