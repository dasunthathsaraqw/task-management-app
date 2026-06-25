import React from "react";
import { Link } from "react-router-dom";
import type { Task } from "../../types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Testing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Done":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800";
      case "Medium":
        return "bg-amber-100 text-amber-800";
      case "Low":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-850";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex justify-between items-start">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-slate-850 text-base line-clamp-1 hover:text-purple-600 transition-colors">
          <Link to={`/admin/tasks/${task._id}`}>{task.title}</Link>
        </h4>

        {/* Description */}
        <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
          {task.description}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100">
        {/* Dates and Assignee */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              Due: {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>

          <div>
            {task.assignedTo ? (
              <div className="flex items-center space-x-1" title={`Assigned to ${task.assignedTo.username}`}>
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                  {task.assignedTo.username.substring(0, 2)}
                </div>
                <span className="max-w-[70px] truncate font-medium">{task.assignedTo.username}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">Unassigned</span>
            )}
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex justify-end items-center space-x-3 pt-1">
          <Link
            to={`/admin/tasks/${task._id}`}
            className="text-xs font-semibold text-purple-650 hover:text-purple-750 transition-colors"
          >
            View Details →
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              title="Edit Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Delete Task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
