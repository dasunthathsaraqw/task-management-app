import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTaskById, deleteTask, updateTaskStatus, assignTask } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { EditTaskModal } from "../../components/tasks/EditTaskModal";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Select } from "../../components/Select";
import { useToast } from "../../context/ToastContext";
import type { Task } from "../../types/task";
import type { User } from "../../types/auth";

export const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  // Quick action states
  const [assigneeId, setAssigneeId] = useState("");
  const [updatingAssignee, setUpdatingAssignee] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Custom delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchTaskDetails = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getTaskById(id)
      .then((data) => {
        setTask(data);
        setAssigneeId(data.assignedTo ? (data.assignedTo._id || (data.assignedTo as any).id) : "");
      })
      .catch((err) => {
        showError(err.message || "Failed to load task details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, showError]);

  useEffect(() => {
    fetchTaskDetails();

    getAllUsers()
      .then((data) => setUsers(data))
      .catch(() => {});
  }, [fetchTaskDetails]);

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task._id);
      showSuccess("Task deleted successfully");
      navigate("/admin/tasks");
    } catch (err: any) {
      showError(err.message || "Failed to delete task");
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!task || !e.target.value) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateTaskStatus(task._id, e.target.value);
      setTask(updated);
      showSuccess(`Status updated to ${e.target.value}`);
    } catch (err: any) {
      showError(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!task) return;
    const targetUserId = e.target.value || null;
    setAssigneeId(e.target.value);
    setUpdatingAssignee(true);
    try {
      const updated = await assignTask(task._id, targetUserId);
      setTask(updated);
      showSuccess(targetUserId ? "Task assigned successfully" : "Task unassigned");
    } catch (err: any) {
      showError(err.message || "Failed to assign task");
    } finally {
      setUpdatingAssignee(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 text-sm font-medium">Loading details...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <Card className="text-center p-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Task Not Found</h3>
        <p className="text-slate-500 text-sm mb-4">The task you are looking for does not exist or has been deleted.</p>
        <Link to="/admin/tasks">
          <Button>Back to Task List</Button>
        </Link>
      </Card>
    );
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-850 border-blue-200";
      case "In Progress":
        return "bg-amber-100 text-amber-850 border-amber-200";
      case "Testing":
        return "bg-purple-100 text-purple-850 border-purple-200";
      case "Done":
        return "bg-emerald-100 text-emerald-850 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-850 border-slate-200";
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
        return "bg-slate-100 text-slate-800";
    }
  };

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id || (u as any)._id, label: u.username })),
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
        <Link to="/admin/tasks" className="hover:text-purple-650 transition-colors">
          Tasks
        </Link>
        <span>/</span>
        <span className="text-slate-700 truncate max-w-xs">{task.title}</span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Details (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Primary Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="space-y-2">
                {/* Badges */}
                <div className="flex space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                  {task.title}
                </h1>
              </div>

              {/* Edit / Delete Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={() => setEditOpen(true)} className="flex items-center space-x-1.5 py-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </Button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-750 text-sm font-semibold rounded-lg border border-red-200/40 transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                {task.description}
              </p>
            </div>

            {/* Dates & Creator info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <p>
                  Created By: <span className="font-semibold text-slate-750">{(task.createdBy as any).username || "Admin"}</span> (
                  {(task.createdBy as any).email} )
                </p>
                <p className="mt-1">
                  Created At: {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="md:text-right">
                <p>
                  Last Updated: {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Status Transition Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Status History & Timeline</h3>

            {task.statusHistory.length === 0 ? (
              <p className="text-slate-400 text-sm italic">No status changes recorded.</p>
            ) : (
              <div className="relative border-l-2 border-purple-100 pl-6 ml-3 space-y-6 py-1">
                {task.statusHistory.map((history, idx) => {
                  // Timeline dot color
                  let dotColor = "bg-slate-400";
                  if (history.status === "Open") dotColor = "bg-blue-500";
                  if (history.status === "In Progress") dotColor = "bg-amber-500";
                  if (history.status === "Testing") dotColor = "bg-purple-500";
                  if (history.status === "Done") dotColor = "bg-emerald-500";

                  const changerName =
                    history.updatedBy && typeof history.updatedBy === "object"
                      ? (history.updatedBy as any).username
                      : "Admin";

                  return (
                    <div key={idx} className="relative group">
                      {/* Circle Dot */}
                      <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-4 ring-purple-50/75 ${dotColor}`}></span>

                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">
                            Transitioned to <span className="text-purple-600">{history.status}</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(history.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Action performed by <span className="font-medium text-slate-700">{changerName}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar (Quick Settings) */}
        <div className="space-y-6">
          {/* Card: Quick Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Quick Controls</h4>

            {/* Quick Status */}
            <Select
              label="Status Field"
              options={[
                { value: "Open", label: "Open" },
                { value: "In Progress", label: "In Progress" },
                { value: "Testing", label: "Testing" },
                { value: "Done", label: "Done" },
              ]}
              value={task.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
            />

            {/* Quick Assign */}
            <Select
              label="Assigned Operator"
              options={userOptions}
              value={assigneeId}
              onChange={handleAssigneeChange}
              disabled={updatingAssignee}
            />

            {/* Due Date Display Widget */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Due Date</span>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        task={task}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchTaskDetails}
      />

      {/* Custom Confirmation Modal: Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Delete this task?</h3>
            <p className="text-slate-600 text-sm mb-5">
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete Task</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
