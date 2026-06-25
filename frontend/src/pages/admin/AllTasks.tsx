import React, { useState, useEffect, useCallback } from "react";
import { getAllTasks, deleteTask, bulkUpdateStatus, bulkDeleteTasks, exportTasksCSV } from "../../services/taskService";
import { getAllUsers } from "../../services/userService";
import { TaskFilters } from "../../components/tasks/TaskFilters";
import { TaskTable } from "../../components/tasks/TaskTable";
import { TaskCard } from "../../components/tasks/TaskCard";
import { CreateTaskModal } from "../../components/tasks/CreateTaskModal";
import { EditTaskModal } from "../../components/tasks/EditTaskModal";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { useToast } from "../../context/ToastContext";
import type { Task, TaskFilters as Filters, Pagination } from "../../types/task";
import type { User } from "../../types/auth";

export const AllTasks: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination & Filtering state
  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: undefined,
    priority: undefined,
    assignedTo: undefined,
    fromDate: undefined,
    toDate: undefined,
    sort: "createdAt",
    order: "desc",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Modal controls
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Bulk actions state
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Custom confirmation dialog state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getAllTasks(filters)
      .then((data) => {
        setTasks(data.tasks);
        setPagination(data.pagination);
      })
      .catch((err) => {
        showError(err.message || "Failed to load tasks");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, showError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    getAllUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch(() => {
        showWarning("Failed to load users for filter dropdown");
      });
  }, [showWarning]);

  // Bulk operations handlers
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds((prev) => [...prev, id]);
    } else {
      setSelectedTaskIds((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(tasks.map((t) => t._id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleBulkStatusChange = async (statusVal: string) => {
    if (!statusVal || selectedTaskIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const msg = await bulkUpdateStatus(selectedTaskIds, statusVal);
      showSuccess(msg);
      setSelectedTaskIds([]);
      setBulkStatus("");
      fetchTasks();
    } catch (err: any) {
      showError(err.message || "Bulk status update failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const msg = await bulkDeleteTasks(selectedTaskIds);
      showSuccess(msg);
      setSelectedTaskIds([]);
      setConfirmBulkDelete(false);
      fetchTasks();
    } catch (err: any) {
      showError(err.message || "Bulk deletion failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const blob = await exportTasksCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess("CSV report downloaded successfully");
    } catch (err: any) {
      showError("Failed to export tasks to CSV");
    }
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteTask(confirmDeleteId);
      showSuccess("Task deleted successfully");
      setConfirmDeleteId(null);
      setSelectedTaskIds((prev) => prev.filter((id) => id !== confirmDeleteId));
      fetchTasks();
    } catch (err: any) {
      showError(err.message || "Failed to delete task");
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Task Management</h1>
          <p className="text-slate-500 text-sm">View, filter, and orchestrate all tasks across your team.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>

          {/* Toggle View Mode */}
          <div className="bg-white border border-slate-200 rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-slate-100 text-slate-855 font-medium" : "text-slate-400 hover:text-slate-650"
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-slate-100 text-slate-855 font-medium" : "text-slate-400 hover:text-slate-650"
              }`}
              title="Card Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
          </div>

          {/* Create Task Button */}
          <Button onClick={() => setCreateOpen(true)} className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <TaskFilters filters={filters} onChange={setFilters} users={users} />

      {/* Bulk Operations Floating Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-in">
          <div className="flex items-center space-x-3">
            <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {selectedTaskIds.length} Selected
            </span>
            <p className="text-sm font-medium text-slate-300">Perform bulk actions on these tasks:</p>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            {/* Bulk Status Select */}
            <div className="w-44">
              <select
                value={bulkStatus}
                onChange={(e) => {
                  setBulkStatus(e.target.value);
                  handleBulkStatusChange(e.target.value);
                }}
                disabled={bulkActionLoading}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Change Status...</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setConfirmBulkDelete(true)}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm font-semibold rounded-lg text-white transition-colors cursor-pointer"
            >
              Delete Selected
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task view contents */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-medium">Querying task records...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No Tasks Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            There are no tasks matching your query or filter configurations. Try adjusting your filters or create a new task.
          </p>
          <Button onClick={() => setCreateOpen(true)}>Create First Task</Button>
        </div>
      ) : viewMode === "table" ? (
        <TaskTable
          tasks={tasks}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          selectedIds={selectedTaskIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && tasks.length > 0 && (
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Total / current page range */}
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{Math.min(tasks.length, pagination.limit)}</span> of{" "}
            <span className="font-semibold text-slate-800">{pagination.total}</span> tasks
          </div>

          {/* Right: Page numbers & Limit Selector */}
          <div className="flex items-center space-x-4">
            {/* Items Per Page */}
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span>Show:</span>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center space-x-1">
              {/* Prev */}
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Indicators */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters({ ...filters, page: p })}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    pagination.page === p
                      ? "bg-purple-600 text-white"
                      : "border border-slate-200 text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchTasks}
      />

      {/* Edit Modal */}
      <EditTaskModal
        task={taskToEdit}
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={fetchTasks}
      />

      {/* Custom Confirmation Modal: Delete Single */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Delete Task?</h3>
            <p className="text-slate-600 text-sm mb-5">
              Are you sure you want to delete this task? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmDelete}>Delete Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal: Bulk Delete */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmBulkDelete(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Delete Multiple Tasks?</h3>
            <p className="text-slate-600 text-sm mb-2">
              Are you sure you want to delete <span className="font-bold text-red-650">{selectedTaskIds.length} tasks</span> simultaneously?
            </p>
            <p className="text-xs text-red-555 font-medium mb-5">
              This action is permanent, and will erase all selected tasks from the database forever.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setConfirmBulkDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleBulkDelete}>Delete All</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
