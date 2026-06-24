import React from "react";
import { Link } from "react-router-dom";
import type { Task } from "../../types/task";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  selectedIds: string[];
  onSelectRow: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  selectedIds,
  onSelectRow,
  onSelectAll,
}) => {
  const getStatusStyle = (status: Task["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Testing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Done":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-rose-100 text-rose-800";
      case "Medium":
        return "bg-amber-100 text-amber-800";
      case "Low":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const isAllSelected = tasks.length > 0 && selectedIds.length === tasks.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="py-4 px-4 font-semibold">Title</th>
              <th className="py-4 px-4 font-semibold">Status</th>
              <th className="py-4 px-4 font-semibold">Priority</th>
              <th className="py-4 px-4 font-semibold">Due Date</th>
              <th className="py-4 px-4 font-semibold">Assigned To</th>
              <th className="py-4 px-6 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                  No tasks found matching the criteria.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isSelected = selectedIds.includes(task._id);
                return (
                  <tr
                    key={task._id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? "bg-purple-50/30" : ""
                    }`}
                  >
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow(task._id, e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900 max-w-xs truncate" title={task.title}>
                        <Link to={`/admin/tasks/${task._id}`} className="hover:text-purple-600 transition-colors">
                          {task.title}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">
                        {task.description}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4">
                      {task.assignedTo ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 uppercase">
                            {task.assignedTo.username.substring(0, 2)}
                          </div>
                          <span className="font-medium text-slate-850 truncate max-w-[120px]">
                            {task.assignedTo.username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2.5">
                      <Link
                        to={`/admin/tasks/${task._id}`}
                        className="inline-flex items-center text-slate-500 hover:text-purple-650 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>

                      <button
                        onClick={() => onEdit(task)}
                        className="inline-flex items-center text-blue-500 hover:text-blue-755 transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => onDelete(task._id)}
                        className="inline-flex items-center text-red-550 hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
