import * as yup from "yup";

// Helper to validate MongoDB ObjectId
const objectIdSchema = yup
  .string()
  .matches(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createTaskSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),

  description: yup
    .string()
    .required("Description is required")
    .trim(),

  priority: yup
    .string()
    .oneOf(["Low", "Medium", "High"], "Priority must be one of Low, Medium, High")
    .default("Medium"),

  status: yup
    .string()
    .oneOf(["Open", "In Progress", "Testing", "Done"], "Invalid status")
    .optional(),

  dueDate: yup
    .date()
    .required("Due date is required")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Due date must be in the future"),

  assignedTo: objectIdSchema
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

export const updateTaskSchema = yup.object({
  title: yup
    .string()
    .max(100, "Title cannot exceed 100 characters")
    .trim()
    .optional(),

  description: yup
    .string()
    .trim()
    .optional(),

  priority: yup
    .string()
    .oneOf(["Low", "Medium", "High"], "Priority must be one of Low, Medium, High")
    .optional(),

  status: yup
    .string()
    .oneOf(["Open", "In Progress", "Testing", "Done"], "Invalid status")
    .optional(),

  dueDate: yup
    .date()
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Due date must be in the future")
    .optional(),

  assignedTo: objectIdSchema
    .nullable()
    .optional()
    .transform((value) => (value === "" ? null : value)),
});

export const updateStatusSchema = yup.object({
  status: yup
    .string()
    .required("Status is required")
    .oneOf(["Open", "In Progress", "Testing", "Done"], "Status must be one of Open, In Progress, Testing, Done"),
});

export const assignTaskSchema = yup.object({
  assignedTo: objectIdSchema
    .required("Assigned user ID is required")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});
