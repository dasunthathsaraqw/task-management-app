import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/Button";
import { KanbanBoard } from "../components/board/KanbanBoard";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { TaskDetailModal } from "../components/tasks/TaskDetailModal";
import { getUserTasks } from "../services/userTaskService";
import type { Task } from "../types/task";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showError } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<
    string | undefined
  >(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Search and Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getUserTasks();
      setTasks(data.tasks);
    } catch (error: any) {
      showError(error.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAddTask = (status: string) => {
    setCreateDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateDefaultStatus(undefined);
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setCreateDefaultStatus(undefined);
    fetchTasks();
  };

  const handleEditSuccess = () => {
    setSelectedTask(null);
    fetchTasks();
  };

  const anyModalOpen = isCreateModalOpen || !!selectedTask;

  // Derived state for filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "All" || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-[#0079BF] dark:bg-slate-900 transition-colors flex flex-col">
      {/* Header — always on top, never blurred */}
      <header
        className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 px-6 py-4 shadow-sm transition-colors"
        style={{ zIndex: 50 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 ">
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white object-contain"
                />
              </div>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
              Task Board
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-slate-600 dark:text-slate-300 hidden md:block transition-colors">
              Welcome back,{" "}
              <span className="font-semibold text-slate-800 dark:text-white">
                {user?.username}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "light" ? (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
              title="Logout"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col overflow-hidden relative">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mb-4">
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-purple-500/50 backdrop-blur-sm transition-all placeholder-slate-400 shadow-sm"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-purple-500/50 backdrop-blur-sm outline-none cursor-pointer shadow-sm"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white dark:border-purple-400"></div>
          </div>
        ) : (
          <div className="flex-1 pb-4 overflow-hidden">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateDefaultStatus(undefined);
        }}
        onSuccess={handleCreateSuccess}
        defaultStatus={createDefaultStatus}
      />

      {/* Task Detail Modal (replaces EditModal) */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Dashboard;
