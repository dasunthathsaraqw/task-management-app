import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import type { LoginFormData } from "../types/auth";

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      await login(data, "admin");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-t-4 border-purple-600">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full mb-2">
            Admin Access
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to your admin account</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your admin email"
            {...registerField("email")}
            error={errors.email?.message}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            {...registerField("password")}
            error={errors.password?.message}
          />

          <Button type="submit" fullWidth loading={loading}>
            Sign In as Admin
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Need an admin account?</span>{" "}
          <Link
            to="/admin/register"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Create Admin Account
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">Are you a regular user?</p>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Go to User Login →
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
