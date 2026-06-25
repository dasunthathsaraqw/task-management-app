import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import Dashboard from "./pages/Dashboard";

// Admin Imports
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminBoard } from "./pages/admin/AdminBoard";
import { AllTasks } from "./pages/admin/AllTasks";
import { TaskDetails } from "./pages/admin/TaskDetails";
import { UserManagement } from "./pages/admin/UserManagement";
import { Reports } from "./pages/admin/Reports";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
        <Router>
          <Routes>
            {/* User Routes */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Protected User Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin", "user"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Suite */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="board" element={<AdminBoard />} />
              <Route path="tasks" element={<AllTasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
