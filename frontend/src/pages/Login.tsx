import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import type { LoginFormData } from "../types/auth";

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: yup
    .string()
    .oneOf(["admin", "user"], "Invalid role")
    .required("Role is required"),
});

const Login: React.FC = () => {
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
    defaultValues: {
      role: "user",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      await login(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Task Management System
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
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

          <Select
            label="Role"
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
            {...registerField("role")}
            error={errors.role?.message}
          />

          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Don't have an account?</span>{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create Account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
