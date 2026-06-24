import { Request, Response } from "express";
import Task from "../models/Task";
import User from "../models/User";
import { response } from "../utils/response";

/**
 * Get task summary stats (status breakdown, priority breakdown, total counts).
 */
export const getTaskSummary = async (req: Request, res: Response) => {
  try {
    const totalTasks = await Task.countDocuments();
    const openTasks = await Task.countDocuments({ status: "Open" });
    const inProgressTasks = await Task.countDocuments({ status: "In Progress" });
    const testingTasks = await Task.countDocuments({ status: "Testing" });
    const doneTasks = await Task.countDocuments({ status: "Done" });

    const lowPriority = await Task.countDocuments({ priority: "Low" });
    const mediumPriority = await Task.countDocuments({ priority: "Medium" });
    const highPriority = await Task.countDocuments({ priority: "High" });

    const totalUsers = await User.countDocuments();

    return response({
      res,
      status: 200,
      success: true,
      message: "Task summary retrieved successfully",
      data: {
        totalTasks,
        totalUsers,
        statusBreakdown: {
          Open: openTasks,
          "In Progress": inProgressTasks,
          Testing: testingTasks,
          Done: doneTasks,
        },
        priorityBreakdown: {
          Low: lowPriority,
          Medium: mediumPriority,
          High: highPriority,
        },
      },
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving task summary reports",
      error: error.message,
    });
  }
};

/**
 * Get top user activity (users with most completed/assigned tasks).
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("username email role");

    const userActivities = await Promise.all(
      users.map(async (user) => {
        const assigned = await Task.countDocuments({ assignedTo: user._id });
        const completed = await Task.countDocuments({ assignedTo: user._id, status: "Done" });
        const open = await Task.countDocuments({ assignedTo: user._id, status: "Open" });
        const inProgress = await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });

        return {
          userId: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          assigned,
          completed,
          open,
          inProgress,
          completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
        };
      })
    );

    // Sort by most assigned tasks
    userActivities.sort((a, b) => b.assigned - a.assigned);

    return response({
      res,
      status: 200,
      success: true,
      message: "User activity reports retrieved successfully",
      data: userActivities,
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving user activity reports",
      error: error.message,
    });
  }
};

/**
 * Get completion rate and metrics over time.
 */
export const getCompletionRate = async (req: Request, res: Response) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Done" });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Fetch last 10 completed tasks to calculate average completion time
    const completedList = await Task.find({ status: "Done" })
      .sort({ updatedAt: -1 })
      .limit(10);

    let totalDurationMs = 0;
    let countWithDuration = 0;

    completedList.forEach((task) => {
      // Find when the task was created
      const start = new Date(task.createdAt).getTime();
      const end = new Date(task.updatedAt).getTime();
      if (end >= start) {
        totalDurationMs += end - start;
        countWithDuration++;
      }
    });

    const averageCompletionTimeHours =
      countWithDuration > 0 ? Math.round((totalDurationMs / (1000 * 60 * 60 * countWithDuration)) * 10) / 10 : 0;

    return response({
      res,
      status: 200,
      success: true,
      message: "Completion rate retrieved successfully",
      data: {
        totalTasks,
        completedTasks,
        completionRate,
        averageCompletionTimeHours,
      },
    });
  } catch (error: any) {
    return response({
      res,
      status: 500,
      success: false,
      message: "Error retrieving completion rate reports",
      error: error.message,
    });
  }
};
