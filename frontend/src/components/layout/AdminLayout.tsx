import React, { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
          {/* Left: Section Title / Greeting */}
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-medium text-slate-800 hidden sm:block">
              Welcome back,{" "}
              <span className="font-semibold text-slate-900">
                {user?.username}
              </span>
            </h2>
          </div>

          {/* Right: Profile details & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-800">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-200/55 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Main Scrolling Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className={location.pathname === "/admin/board" ? "w-full h-full space-y-6" : "max-w-7xl mx-auto space-y-6"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
