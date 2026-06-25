import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { KanbanBoard } from "../components/board/KanbanBoard";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { EditTaskModal } from "../components/tasks/EditTaskModal";
import { getUserTasks } from "../services/userTaskService";
import type { Task } from "../types/task";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showError } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // We pass no filters initially to get all tasks associated with this user
      // A large limit is passed to ensure all tasks are visible on the board
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

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchTasks();
  };

  const handleEditSuccess = () => {
    setSelectedTask(null);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm p-1 border border-slate-100">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Task Board
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600 hidden md:block">
              Welcome back,{" "}
              <span className="font-semibold text-slate-800">
                {user?.username}
              </span>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Task
              </span>
            </Button>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
      <main className="flex-1 max-w-full mx-auto w-full p-6 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="h-[calc(100vh-120px)] pb-4 overflow-hidden">
            <KanbanBoard tasks={tasks} onTaskClick={handleTaskClick} />
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditTaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Dashboard;
