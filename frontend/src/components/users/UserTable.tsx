import React from "react";
import type { User } from "../../types/auth";

interface UserTableProps {
  users: (User & { stats?: { tasksCreated: number; tasksAssigned: number; tasksCompleted: number } })[];
  onEditRole: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEditRole, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">User details</th>
              <th className="py-4 px-4 font-semibold">Role</th>
              <th className="py-4 px-4 font-semibold text-center">Tasks Created</th>
              <th className="py-4 px-4 text-center font-semibold">Tasks Assigned</th>
              <th className="py-4 px-4 text-center font-semibold">Completed</th>
              <th className="py-4 px-6 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const createdCount = user.stats?.tasksCreated ?? 0;
                const assignedCount = user.stats?.tasksAssigned ?? 0;
                const completedCount = user.stats?.tasksCompleted ?? 0;

                return (
                  <tr key={user.id || (user as any)._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500/10 to-blue-500/10 border border-slate-250/20 flex items-center justify-center font-bold text-slate-750 uppercase">
                          {user.username.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-800">{createdCount}</td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-800">{assignedCount}</td>
                    <td className="py-4 px-4 text-center font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        completedCount > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {completedCount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => onEditRole(user)}
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-100/50 text-xs font-semibold transition-colors cursor-pointer"
                        title="Edit Role"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg border border-red-100/50 text-xs font-semibold transition-colors cursor-pointer"
                        title="Delete User"
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
