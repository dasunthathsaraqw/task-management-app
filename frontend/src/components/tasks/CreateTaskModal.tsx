import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "../Input";
import { Button } from "../Button";
import { Select } from "../Select";
import { Card } from "../Card";
import { getAllUsers } from "../../services/userService";
import { createTask as createAdminTask } from "../../services/taskService";
import { createUserTask } from "../../services/userTaskService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultStatus?: string;
}

const schema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: yup.string().required("Description is required").trim(),
  priority: yup.string().oneOf(["Low", "Medium", "High"]).default("Medium"),
  dueDate: yup
    .string()
    .required("Due date is required")
    .test("future-date", "Due date must be today or in the future", (value) => {
      if (!value) return false;
      const selected = new Date(value).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return selected >= today;
    }),
  assignedTo: yup.string().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSuccess, defaultStatus }) => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: "Medium",
      assignedTo: "",
    },
  });

  // Reset and inject defaultStatus when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({ priority: "Medium", assignedTo: "" });
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen && user?.role === "admin") {
      setLoadingUsers(true);
      getAllUsers()
        .then((data) => {
          setUsers(data);
        })
        .catch((err) => {
          showError("Failed to load users for assignment");
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [isOpen, showError, user]);

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const taskPayload = {
        title: data.title,
        description: data.description,
        priority: data.priority || "Medium",
        dueDate: data.dueDate,
        assignedTo: data.assignedTo === "" ? null : data.assignedTo,
        ...(defaultStatus ? { status: defaultStatus } : {}),
      };

      if (user?.role === "admin") {
        await createAdminTask(taskPayload);
      } else {
        await createUserTask(taskPayload);
      }

      showSuccess("Task created successfully");
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions = [
    { value: "", label: "Unassigned" },
    ...users.map((u) => ({ value: u.id || (u as any)._id, label: `${u.username} (${u.role})` })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Create New Task</h3>
            {defaultStatus && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Status: <span className="font-semibold text-purple-600 dark:text-purple-400">{defaultStatus}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4 flex-1 bg-white dark:bg-slate-800">
          <Input
            label="Task Title"
            placeholder="Enter descriptive title"
            {...register("title")}
            error={errors.title?.message}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors">Description</label>
            <textarea
              placeholder="Provide details about the task..."
              rows={4}
              {...register("description")}
              className={`w-full px-3.5 py-2.5 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none ${
                errors.description
                  ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 placeholder-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-purple-100 dark:focus:ring-purple-900/30"
              }`}
            />
            {errors.description && <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
              ]}
              {...register("priority")}
              error={errors.priority?.message}
            />

            <Input
              type="date"
              label="Due Date"
              {...register("dueDate")}
              error={errors.dueDate?.message}
            />
          </div>

          {user?.role === "admin" && (
            <Select
              label="Assign To User"
              options={userOptions}
              {...register("assignedTo")}
              error={errors.assignedTo?.message}
              disabled={loadingUsers}
            />
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900/30 -mx-6 -mb-6 p-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
