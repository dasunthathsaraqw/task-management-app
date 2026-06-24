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

const UserRegister: React.FC = () => {
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
      await registerUser(data, "user");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create User Account
          </h1>
          <p className="text-gray-600 mt-2">Register as a new user</p>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            label="Username"
            placeholder="Choose a username"
            {...registerField("username")}
            error={errors.username?.message}
          />

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
            placeholder="Create a password"
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
            Create User Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already have an account?</span>{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">Need an admin account?</p>
          <Link
            to="/admin/register"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Create Admin Account →
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UserRegister;
