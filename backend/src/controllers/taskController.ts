import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import { response } from "../utils/response";

/**
 * Get all tasks with advanced filtering, search, sorting, and pagination.
 */
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      priority,
      assignedTo,
      createdBy,
      fromDate,
      toDate,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query: any = {};

    // Text search on title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Exact match filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo === "null") {
      query.assignedTo = null;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (createdBy) query.createdBy = createdBy;

    // Date range filter for due date
    if (fromDate || toDate) {
      query.dueDate = {};
      if (fromDate) query.dueDate.$gte = new Date(fromDate as string);
      if (toDate) query.dueDate.$lte = new Date(toDate as string);
    }

    // Pagination math
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortQuery: any = {};
    sortQuery[sort as string] = sortOrder;

    // Fetch data and counts
    const tasks = await Task.find(query)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role")
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum);

    const total = await Task.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    return response({
      res,
      status: 200,
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
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
 * Get a single task by ID.
 */
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role")
      .populate("statusHistory.updatedBy", "username email role");

    if (!task) {
      return response({
        res,
        status: 404,
        success: false,
        message: "Task not found",
      });
    }

    return response({
      res,
      status: 200,
      success: true,
      message: "Task details retrieved successfully",
      data: task,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving task details",
      error: error.message,
    });
  }
};

/**
 * Create a new task.
 */
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify assigned user exists if provided
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return response({
          res,
          status: 400,
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      createdBy: adminId,
      status: "Open",
      statusHistory: [
        {
          status: "Open",
          updatedAt: new Date(),
          updatedBy: adminId,
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
 * Update an existing task.
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, assignedTo, status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
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

    // Verify assigned user if updated
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return response({
          res,
          status: 400,
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    // Track status history if status changed
    if (status && status !== task.status) {
      task.statusHistory.push({
        status,
        updatedAt: new Date(),
        updatedBy: adminId as any,
      });
      task.status = status;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

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
 * Delete a task.
 */
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return response({
        res,
        status: 404,
        success: false,
        message: "Task not found",
      });
    }

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

/**
 * Update task status and record history.
 */
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
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
      updatedBy: adminId as any,
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
 * Assign a task to a user.
 */
export const assignTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
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

    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return response({
          res,
          status: 400,
          success: false,
          message: "Assigned user not found",
        });
      }
    }

    task.assignedTo = assignedTo || null;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "username email role")
      .populate("createdBy", "username email role");

    return response({
      res,
      status: 200,
      success: true,
      message: "Task assigned successfully",
      data: populatedTask,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error assigning task",
      error: error.message,
    });
  }
};

/**
 * Bulk update task status.
 */
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { taskIds, status } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return response({
        res,
        status: 401,
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return response({
        res,
        status: 400,
        success: false,
        message: "Task IDs must be a non-empty array",
      });
    }

    const validStatuses = ["Open", "In Progress", "Testing", "Done"];
    if (!validStatuses.includes(status)) {
      return response({
        res,
        status: 400,
        success: false,
        message: "Invalid status value",
      });
    }

    // Update each task individually to record in statusHistory
    const tasks = await Task.find({ _id: { $in: taskIds } });
    for (const task of tasks) {
      if (task.status !== status) {
        task.status = status;
        task.statusHistory.push({
          status,
          updatedAt: new Date(),
          updatedBy: adminId as any,
        });
        await task.save();
      }
    }

    return response({
      res,
      status: 200,
      success: true,
      message: `Successfully updated ${tasks.length} tasks to ${status}`,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error performing bulk status update",
      error: error.message,
    });
  }
};

/**
 * Bulk delete tasks.
 */
export const bulkDeleteTasks = async (req: Request, res: Response) => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return response({
        res,
        status: 400,
        success: false,
        message: "Task IDs must be a non-empty array",
      });
    }

    const result = await Task.deleteMany({ _id: { $in: taskIds } });

    return response({
      res,
      status: 200,
      success: true,
      message: `Successfully deleted ${result.deletedCount} tasks`,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error performing bulk delete",
      error: error.message,
    });
  }
};

/**
 * Export tasks as CSV.
 */
export const exportTasksCSV = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    let csv = "ID,Title,Description,Priority,Status,Due Date,Assigned To,Created By,Created At\n";

    tasks.forEach((task) => {
      const id = task._id.toString();
      const title = `"${task.title.replace(/"/g, '""')}"`;
      const description = `"${task.description.replace(/"/g, '""').replace(/\n/g, " ")}"`;
      const priority = task.priority;
      const status = task.status;
      const dueDate = task.dueDate ? task.dueDate.toISOString().split("T")[0] : "";
      const assigned = task.assignedTo ? (task.assignedTo as any).email : "Unassigned";
      const creator = task.createdBy ? (task.createdBy as any).email : "System";
      const createdAt = task.createdAt ? task.createdAt.toISOString() : "";

      csv += `${id},${title},${description},${priority},${status},${dueDate},${assigned},${creator},${createdAt}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tasks-export.csv");
    return res.status(200).send(csv);
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error exporting tasks",
      error: error.message,
    });
  }
};
