import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import type { RegisterFormData } from "../types/auth";

const registerSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long"),
  email: yup.string().email("Please enter a valid email address").required("Email address is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match — please try again"),
});

const UserRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onTouched",
  });

  const hasValidationErrors = isSubmitted && Object.keys(errors).length > 0;

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setLoading(true);
    try {
      const user = await registerUser(data, "user");
      navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      setServerError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join us — it only takes a minute</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* Server error */}
          {serverError && (
            <Alert type="error" message={serverError} onClose={() => setServerError("")} />
          )}

          {/* Validation summary */}
          {hasValidationErrors && (
            <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800">Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} before continuing:</p>
                  <ul className="mt-1 space-y-0.5">
                    {errors.username && <li className="text-xs text-orange-700 flex items-center gap-1"><span className="w-1 h-1 bg-orange-500 rounded-full inline-block" />{errors.username.message}</li>}
                    {errors.email && <li className="text-xs text-orange-700 flex items-center gap-1"><span className="w-1 h-1 bg-orange-500 rounded-full inline-block" />{errors.email.message}</li>}
                    {errors.password && <li className="text-xs text-orange-700 flex items-center gap-1"><span className="w-1 h-1 bg-orange-500 rounded-full inline-block" />{errors.password.message}</li>}
                    {errors.confirmPassword && <li className="text-xs text-orange-700 flex items-center gap-1"><span className="w-1 h-1 bg-orange-500 rounded-full inline-block" />{errors.confirmPassword.message}</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              placeholder="you@example.com"
              {...registerField("email")}
              error={errors.email?.message}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Create a strong password (min. 6 characters)"
              {...registerField("password")}
              error={errors.password?.message}
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              {...registerField("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-center text-sm">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
            <p className="text-gray-400">
              Are you an admin?{" "}
              <Link to="/admin/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                Admin registration →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
