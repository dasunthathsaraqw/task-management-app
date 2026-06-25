import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "../Input";
import { Button } from "../Button";
import { Select } from "../Select";
import { getAllUsers } from "../../services/userService";
import { updateTask as updateAdminTask } from "../../services/taskService";
import { updateUserTask } from "../../services/userTaskService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/auth";
import type { Task } from "../../types/task";

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: yup.string().required("Description is required").trim(),
  priority: yup.string().oneOf(["Low", "Medium", "High"]).required(),
  status: yup.string().oneOf(["Open", "In Progress", "Testing", "Done"]).required(),
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

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isOpen && task) {
      if (user?.role === "admin") {
        setLoadingUsers(true);
        getAllUsers()
          .then((data) => {
            setUsers(data);
          })
          .catch(() => {
            showError("Failed to load users for assignment");
          })
          .finally(() => {
            setLoadingUsers(false);
          });
      }

      // Format date to YYYY-MM-DD for date input
      const formattedDate = task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";

      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: formattedDate,
        assignedTo: task.assignedTo ? (task.assignedTo._id || (task.assignedTo as any).id) : "",
      });
    }
  }, [isOpen, task, reset, showError, user]);

  if (!isOpen || !task) return null;

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const taskPayload = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo === "" ? null : data.assignedTo,
      };

      if (user?.role === "admin") {
        await updateAdminTask(task._id, taskPayload);
      } else {
        await updateUserTask(task._id, taskPayload);
      }

      showSuccess("Task updated successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "Failed to update task");
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
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-150 animate-slide-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Edit Task</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4 flex-1">
          <Input
            label="Task Title"
            placeholder="Enter title"
            {...register("title")}
            error={errors.title?.message}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              placeholder="Provide details..."
              rows={4}
              {...register("description")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
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

            <Select
              label="Status"
              options={[
                { value: "Open", label: "Open" },
                { value: "In Progress", label: "In Progress" },
                { value: "Testing", label: "Testing" },
                { value: "Done", label: "Done" },
              ]}
              {...register("status")}
              error={errors.status?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Due Date"
              {...register("dueDate")}
              error={errors.dueDate?.message}
            />

            {user?.role === "admin" && (
              <Select
                label="Assignee"
                options={userOptions}
                {...register("assignedTo")}
                error={errors.assignedTo?.message}
                disabled={loadingUsers}
              />
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50 -mx-6 -mb-6 p-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
