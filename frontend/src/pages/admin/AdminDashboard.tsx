import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTaskSummary, getUserActivity } from "../../services/userService";
import { getAllTasks } from "../../services/taskService";
import { CreateTaskModal } from "../../components/tasks/CreateTaskModal";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useToast } from "../../context/ToastContext";
import type { Task } from "../../types/task";

export const AdminDashboard: React.FC = () => {
  const { showError } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get task summary stats
      const sumData = await getTaskSummary();
      setSummary(sumData);

      // 2. Get recent tasks (limit 5)
      const tasksData = await getAllTasks({
        limit: 5,
        sort: "createdAt",
        order: "desc",
      });
      setRecentTasks(tasksData.tasks);

      // 3. Get all tasks to extract real activity logs from status history
      const allTasksData = await getAllTasks({ limit: 50 });
      const logs: any[] = [];
      allTasksData.tasks.forEach((t) => {
        t.statusHistory.forEach((hist) => {
          logs.push({
            taskTitle: t.title,
            taskId: t._id,
            status: hist.status,
            updatedAt: new Date(hist.updatedAt),
            operator:
              typeof hist.updatedBy === "object"
                ? (hist.updatedBy as any).username
                : "Admin",
          });
        });
      });

      // Sort logs by date desc and take top 6
      logs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setActivityLogs(logs.slice(0, 6));
    } catch (err: any) {
      showError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 text-sm font-medium">
          Analyzing system analytics...
        </span>
      </div>
    );
  }

  // Calculate percentages for SVG charts
  const statusValues = Object.values(summary.statusBreakdown) as number[];
  const maxStatusVal = Math.max(...statusValues, 1);

  const priorityValues = Object.values(summary.priorityBreakdown) as number[];
  const maxPriorityVal = Math.max(...priorityValues, 1);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Real-time summaries, metrics, and operations overview.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="flex items-center space-x-1.5 shadow-sm"
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
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Grid of Cards: Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Tasks */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center space-x-4">
          <div className="p-3 bg-purple-100/60 rounded-xl text-purple-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">
              Total Tasks
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {summary.totalTasks}
            </p>
          </div>
        </div>

        {/* Open */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center space-x-4">
          <div className="p-3 bg-blue-100/60 rounded-xl text-blue-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">
              Open
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {summary.statusBreakdown.Open}
            </p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center space-x-4">
          <div className="p-3 bg-amber-100/60 rounded-xl text-amber-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l-.707-.707"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">
              In Progress
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {summary.statusBreakdown["In Progress"]}
            </p>
          </div>
        </div>

        {/* Done */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center space-x-4">
          <div className="p-3 bg-emerald-100/60 rounded-xl text-emerald-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {summary.statusBreakdown.Done}
            </p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center space-x-4">
          <div className="p-3 bg-indigo-100/60 rounded-xl text-indigo-600">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-450 text-xs font-semibold uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">
              {summary.totalUsers}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution SVG Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Status Distribution
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(summary.statusBreakdown).map(([status, count]) => {
              const pct = Math.round(((count as number) / maxStatusVal) * 100);
              let barColor = "bg-slate-300";
              if (status === "Open") barColor = "bg-blue-500";
              if (status === "In Progress") barColor = "bg-amber-500";
              if (status === "Testing") barColor = "bg-purple-500";
              if (status === "Done") barColor = "bg-emerald-500";

              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-655">
                    <span>{status}</span>
                    <span className="font-bold text-slate-800">
                      {count as number}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority breakdown SVG Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Priority Density
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(summary.priorityBreakdown).map(
              ([priority, count]) => {
                const pct = Math.round(
                  ((count as number) / maxPriorityVal) * 100,
                );
                let barColor = "bg-slate-350";
                if (priority === "High") barColor = "bg-rose-500";
                if (priority === "Medium") barColor = "bg-amber-500";
                if (priority === "Low") barColor = "bg-emerald-500";

                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-655">
                      <span>{priority} Priority</span>
                      <span className="font-bold text-slate-800">
                        {count as number}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Tasks & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                Recent Tasks
              </h3>
              <Link
                to="/admin/tasks"
                className="text-xs font-semibold text-purple-650 hover:text-purple-750 transition-colors"
              >
                View All Tasks →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider pb-2">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Priority</th>
                    <th className="pb-2">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {recentTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/40">
                      <td className="py-3 font-medium text-slate-800">
                        <Link
                          to={`/admin/tasks/${task._id}`}
                          className="hover:text-purple-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase border border-slate-200">
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-500">
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time Activity Logs (1 col) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            System Activity Feed
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[260px] pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-slate-450 text-xs italic">
                No system activities recorded yet.
              </p>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs">
                  {/* Small avatar or icon */}
                  <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-[10px] text-purple-600 uppercase flex-shrink-0 mt-0.5">
                    {log.operator.substring(0, 2)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-slate-700 leading-normal">
                      <span className="font-semibold text-slate-800">
                        {log.operator}
                      </span>{" "}
                      updated status of{" "}
                      <Link
                        to={`/admin/tasks/${log.taskId}`}
                        className="font-medium text-purple-650 hover:underline"
                      >
                        {log.taskTitle}
                      </Link>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-800">
                        {log.status}
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
