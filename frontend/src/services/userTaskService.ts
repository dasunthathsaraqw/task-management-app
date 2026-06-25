import api from "./userApi";
import type { Task, TaskListResponse } from "../types/task";

export const getUserTasks = async (): Promise<TaskListResponse["data"]> => {
  const response = await api.get("/user/tasks");
  return response.data.data;
};

export const createUserTask = async (data: {
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  status?: string;
}): Promise<Task> => {
  const response = await api.post("/user/tasks", data);
  return response.data.data;
};

export const updateUserTask = async (id: string, data: {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  status?: string;
}): Promise<Task> => {
  const response = await api.put(`/user/tasks/${id}`, data);
  return response.data.data;
};

export const updateUserTaskStatus = async (id: string, status: string): Promise<Task> => {
  const response = await api.patch(`/user/tasks/${id}/status`, { status });
  return response.data.data;
};
