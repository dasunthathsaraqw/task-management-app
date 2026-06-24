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
import type { RegisterFormData } from "../types/auth";

const registerSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);

    try {
      await registerUser(data, "admin");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
          <h1 className="text-2xl font-bold text-gray-900">
            Create Admin Account
          </h1>
          <p className="text-gray-600 mt-2">Register as an admin</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            label="Username"
            placeholder="Choose an admin username"
            {...registerField("username")}
            error={errors.username?.message}
          />

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
            placeholder="Create a strong password"
            {...registerField("password")}
            error={errors.password?.message}
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            {...registerField("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create Admin Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already have an admin account?</span>{" "}
          <Link
            to="/admin/login"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Sign In as Admin
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">Need a user account?</p>
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Create User Account →
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegister;
