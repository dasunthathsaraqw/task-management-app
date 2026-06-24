import React, { useState, useEffect } from "react";
import { getCompletionRate, getUserActivity } from "../../services/userService";
import { Card } from "../../components/Card";
import { useToast } from "../../context/ToastContext";

export const Reports: React.FC = () => {
  const { showError } = useToast();
  const [completion, setCompletion] = useState<any>(null);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const compData = await getCompletionRate();
      setCompletion(compData);

      const workData = await getUserActivity();
      setWorkload(workData);
    } catch (err: any) {
      showError(err.message || "Failed to load reports and analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading || !completion) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 text-sm font-medium">Assembling team intelligence...</span>
      </div>
    );
  }

  // Calculate stats for vertical chart
  // Let's draw a vertical bar chart of top 5 active users and their assigned/completed tasks
  const topUsers = workload.slice(0, 5);
  const maxTasksVal = Math.max(...topUsers.map((u) => u.assigned), 1);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm">Analyze completion ratios, operational efficiency, and team bandwidth.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion Rate Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Overall Completion Rate</span>
            <span className="text-4xl font-extrabold text-emerald-600">{completion.completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completion.completionRate}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {completion.completedTasks} of {completion.totalTasks} total tasks marked as Done.
          </p>
        </div>

        {/* Avg Completion Duration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Resolution Time</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-slate-800">{completion.averageCompletionTimeHours}</span>
            <span className="text-sm font-semibold text-slate-500">hours</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Average span between task creation and status change to "Done", calculated over the last 10 completed tasks.
          </p>
        </div>

        {/* Task Velocity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Task Backlog Capacity</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-purple-600">
              {completion.totalTasks - completion.completedTasks}
            </span>
            <span className="text-sm font-semibold text-slate-500">active tasks</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Backlogged task count (Open, In Progress, and Testing states combined) that are awaiting completion.
          </p>
        </div>
      </div>

      {/* Middle Section: Workload Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Vertical SVG Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Top 5 Team Workloads</h3>
            <p className="text-xs text-slate-500">Assigned vs Completed tasks by team member.</p>
          </div>

          {topUsers.length === 0 ? (
            <p className="text-slate-400 text-sm italic py-8 text-center">No workloads to report yet.</p>
          ) : (
            <div className="pt-4">
              {/* Responsive SVG Container */}
              <svg viewBox="0 0 500 200" className="w-full h-auto text-xs">
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1" />

                {/* Draw vertical bars for each of the top users */}
                {topUsers.map((user, idx) => {
                  const barGroupWidth = 70;
                  const spacing = 15;
                  const startX = 60 + idx * (barGroupWidth + spacing);

                  // Calculate heights based on max tasks
                  const assignedHeight = (user.assigned / maxTasksVal) * 130;
                  const completedHeight = (user.completed / maxTasksVal) * 130;

                  const assignedY = 170 - assignedHeight;
                  const completedY = 170 - completedHeight;

                  return (
                    <g key={user.userId}>
                      {/* Assigned Bar (Purple) */}
                      <rect
                        x={startX}
                        y={assignedY}
                        width="24"
                        height={assignedHeight}
                        fill="#a855f7"
                        rx="2"
                        className="transition-all hover:opacity-90"
                      />
                      {/* Completed Bar (Green) */}
                      <rect
                        x={startX + 28}
                        y={completedY}
                        width="24"
                        height={completedHeight}
                        fill="#10b981"
                        rx="2"
                        className="transition-all hover:opacity-90"
                      />

                      {/* X Axis Labels */}
                      <text
                        x={startX + 26}
                        y="185"
                        textAnchor="middle"
                        fill="#64748b"
                        className="font-medium text-[10px]"
                      >
                        {user.username}
                      </text>
                    </g>
                  );
                })}

                {/* Y Axis markings */}
                <text x="32" y="24" textAnchor="end" fill="#94a3b8" className="text-[9px]">
                  {maxTasksVal}
                </text>
                <text x="32" y="95" textAnchor="end" fill="#94a3b8" className="text-[9px]">
                  {Math.round(maxTasksVal / 2)}
                </text>
                <text x="32" y="173" textAnchor="end" fill="#94a3b8" className="text-[9px]">
                  0
                </text>
              </svg>

              {/* Chart Legend */}
              <div className="flex justify-center space-x-6 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-purple-500 rounded"></span>
                  <span>Assigned Tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                  <span>Completed Tasks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workload stats description card (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Bandwidth Analysis</h4>
            <p className="text-xs text-slate-555 leading-relaxed">
              This chart highlights the task load and corresponding success metrics of your most heavily loaded team members.
            </p>
            <p className="text-xs text-slate-555 leading-relaxed">
              Use this distribution to re-assign tasks from individuals with high pending/in-progress queues (purple bars) to team members with higher availability, ensuring an optimal completion pipeline.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
            <span className="font-semibold text-slate-700 block">Pro Tip:</span>
            Unassigned tasks do not show up in workload analyses. Check the Task Board to assign open items.
          </div>
        </div>
      </div>

      {/* Bottom Section: Full User Workload Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Team Productivity Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider pb-2 bg-slate-50">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4 text-center">Tasks Assigned</th>
                <th className="py-3 px-4 text-center">In Progress</th>
                <th className="py-3 px-4 text-center">Testing</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">Done Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workload.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-50/40">
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-semibold text-slate-850">{user.username}</span>
                      <span className="text-xs text-slate-500 block">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-slate-800">{user.assigned}</td>
                  <td className="py-4 px-4 text-center font-semibold text-amber-650">{user.inProgress}</td>
                  <td className="py-4 px-4 text-center font-semibold text-purple-650">{user.testing}</td>
                  <td className="py-4 px-4 text-center font-semibold text-emerald-650">{user.completed}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.completionRate >= 80
                        ? "bg-emerald-100 text-emerald-805"
                        : user.completionRate >= 50
                        ? "bg-amber-100 text-amber-805"
                        : "bg-rose-100 text-rose-805"
                    }`}>
                      {user.completionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
