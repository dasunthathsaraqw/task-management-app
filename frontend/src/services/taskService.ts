import api from "./userApi";
import type { Task, TaskFilters, TaskListResponse } from "../types/task";

export const getAllTasks = async (filters?: TaskFilters): Promise<TaskListResponse["data"]> => {
  const response = await api.get("/tasks", { params: filters });
  return response.data.data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (data: {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assignedTo?: string | null;
}): Promise<Task> => {
  const response = await api.post("/tasks", data);
  return response.data.data;
};

export const updateTask = async (id: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string | null;
  status?: string;
}): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/status`, { status });
  return response.data.data;
};

export const assignTask = async (id: string, assignedTo: string | null): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/assign`, { assignedTo });
  return response.data.data;
};

export const bulkUpdateStatus = async (taskIds: string[], status: string): Promise<string> => {
  const response = await api.patch("/tasks/bulk/status", { taskIds, status });
  return response.data.message;
};

export const bulkDeleteTasks = async (taskIds: string[]): Promise<string> => {
  const response = await api.delete("/tasks/bulk", { data: { taskIds } });
  return response.data.message;
};

export const exportTasksCSV = async (): Promise<Blob> => {
  const response = await api.get("/tasks/export/csv", { responseType: "blob" });
  return new Blob([response.data], { type: "text/csv" });
};
