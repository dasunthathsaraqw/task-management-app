import React, { useState } from "react";
import { updateUserTask } from "../../services/userTaskService";
import { useToast } from "../../context/ToastContext";
import type { Task } from "../../types/task";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type EditableField =
  | "title"
  | "description"
  | "priority"
  | "status"
  | "dueDate"
  | null;

const PRIORITIES = ["Low", "Medium", "High"] as const;
const STATUSES = ["Open", "In Progress", "Testing", "Done"] as const;

const priorityColors: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-800 border-emerald-300",
  Medium: "bg-amber-100 text-amber-800 border-amber-300",
  High: "bg-rose-100 text-rose-800 border-rose-300",
};

const statusColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800 border-blue-300",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-300",
  Testing: "bg-purple-100 text-purple-800 border-purple-300",
  Done: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});

  if (!isOpen || !task) return null;

  const currentTask = { ...task, ...editedTask };

  const handleFieldChange = (field: keyof Task, value: string) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = Object.keys(editedTask).length > 0;

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      await updateUserTask(task._id, {
        title: currentTask.title,
        description: currentTask.description,
        priority: currentTask.priority,
        status: currentTask.status,
        dueDate: currentTask.dueDate
          ? new Date(currentTask.dueDate).toISOString().split("T")[0]
          : task.dueDate,
      });
      showSuccess("Task updated successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEditedTask({});
    setEditingField(null);
    onClose();
  };

  const formattedDueDate = currentTask.dueDate
    ? new Date(currentTask.dueDate).toISOString().split("T")[0]
    : "";
  const dueDateDisplay = currentTask.dueDate
    ? new Date(currentTask.dueDate).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";
  const isOverdue =
    currentTask.dueDate && new Date(currentTask.dueDate) < new Date();

  return (
    <>
      {/* Backdrop — behind header (z-30), only blurs the board area below it */}
      <div
        className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm"
        style={{ top: "73px" }} // below the sticky header
        onClick={handleClose}
      />

      {/* Modal — above backdrop but still below header z=10 concern; we use z-40 */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
        style={{ top: "73px" }}
      >
        <div
          className="pointer-events-auto relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in flex flex-col max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${priorityColors[currentTask.priority] || priorityColors.Medium}`}
              >
                {currentTask.priority}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[currentTask.status] || statusColors.Open}`}
              >
                {currentTask.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  Save Changes
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Click-to-edit hint */}
            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Click any field to edit
            </p>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Title
              </label>
              {editingField === "title" ? (
                <input
                  autoFocus
                  value={currentTask.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  className="w-full text-xl font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/50 border border-purple-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                />
              ) : (
                <h2
                  onClick={() => setEditingField("title")}
                  className="text-xl font-bold text-slate-800 dark:text-white cursor-text hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-3 py-2 -mx-3 transition-colors"
                >
                  {currentTask.title}
                </h2>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Description
              </label>
              {editingField === "description" ? (
                <textarea
                  autoFocus
                  value={currentTask.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  onBlur={() => setEditingField(null)}
                  rows={4}
                  className="w-full text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 border border-purple-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors"
                />
              ) : (
                <p
                  onClick={() => setEditingField("description")}
                  className="text-sm text-slate-700 dark:text-slate-300 cursor-text hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-3 py-2 -mx-3 leading-relaxed whitespace-pre-wrap min-h-[60px] transition-colors"
                >
                  {currentTask.description || (
                    <span className="italic text-slate-400">
                      No description provided
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Row: Priority + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                {editingField === "priority" ? (
                  <select
                    autoFocus
                    value={currentTask.priority}
                    onChange={(e) => {
                      handleFieldChange("priority", e.target.value);
                      setEditingField(null);
                    }}
                    onBlur={() => setEditingField(null)}
                    className="w-full text-sm border border-purple-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    onClick={() => setEditingField("priority")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${priorityColors[currentTask.priority]}`}
                  >
                    {currentTask.priority}
                    <svg
                      className="w-3 h-3 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                {editingField === "status" ? (
                  <select
                    autoFocus
                    value={currentTask.status}
                    onChange={(e) => {
                      handleFieldChange("status", e.target.value);
                      setEditingField(null);
                    }}
                    onBlur={() => setEditingField(null)}
                    className="w-full text-sm border border-purple-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    onClick={() => setEditingField("status")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${statusColors[currentTask.status]}`}
                  >
                    {currentTask.status}
                    <svg
                      className="w-3 h-3 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              {editingField === "dueDate" ? (
                <input
                  type="date"
                  autoFocus
                  value={formattedDueDate}
                  onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                  onBlur={() => setEditingField(null)}
                  className="text-sm border border-purple-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                />
              ) : (
                <div
                  onClick={() => setEditingField("dueDate")}
                  className={`inline-flex items-center gap-2 text-sm font-medium cursor-pointer px-3 py-1.5 rounded-lg border transition-colors ${
                    isOverdue
                      ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                      : "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dueDateDisplay}
                  {isOverdue && (
                    <span className="text-xs font-bold text-red-500">
                      OVERDUE
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Created By
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                    {task.createdBy?.username?.substring(0, 2) || "??"}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {task.createdBy?.username || "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Assigned To
                </label>
                <div className="flex items-center gap-2">
                  {task.assignedTo ? (
                    <>
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                        {task.assignedTo.username?.substring(0, 2)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {task.assignedTo.username}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Created
                </label>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(task.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Last Updated
                </label>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(task.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Status History */}
            {task.statusHistory && task.statusHistory.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Status History
                </label>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-4">
                    {task.statusHistory
                      .slice()
                      .reverse()
                      .map((h, i) => {
                        // Resolve updatedBy ID to a known username
                        const updatedById =
                          typeof h.updatedBy === "object"
                            ? (h.updatedBy as any)._id || (h.updatedBy as any).id
                            : h.updatedBy;

                        let actorName = "Unknown";
                        let actorInitials = "?";
                        let actorColor = "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300";

                        if (task.createdBy && updatedById === task.createdBy._id) {
                          actorName = task.createdBy.username;
                          actorInitials = actorName.substring(0, 2).toUpperCase();
                          actorColor = "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300";
                        } else if (task.assignedTo && updatedById === task.assignedTo._id) {
                          actorName = task.assignedTo.username;
                          actorInitials = actorName.substring(0, 2).toUpperCase();
                          actorColor = "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300";
                        } else if (typeof h.updatedBy === "object" && (h.updatedBy as any).username) {
                          actorName = (h.updatedBy as any).username;
                          actorInitials = actorName.substring(0, 2).toUpperCase();
                          actorColor = "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200";
                        }

                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(h.updatedAt).getTime();
                          const mins = Math.floor(diff / 60000);
                          const hrs = Math.floor(diff / 3600000);
                          const days = Math.floor(diff / 86400000);
                          if (mins < 1) return "just now";
                          if (mins < 60) return `${mins}m ago`;
                          if (hrs < 24) return `${hrs}h ago`;
                          return `${days}d ago`;
                        })();

                        return (
                          <div key={i} className="flex items-start gap-3 relative pl-8">
                            {/* Timeline dot */}
                            <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-sm ${actorColor}`}>
                              {actorInitials}
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {actorName}
                                </span>
                                <span className="text-xs text-slate-400">moved to</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[h.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                  {h.status}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap" title={new Date(h.updatedAt).toLocaleString()}>
                                  {timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || submitting}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
