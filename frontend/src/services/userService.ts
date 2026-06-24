import api from "./userApi";
import type { User } from "../types/auth";
import type {
  UserStatsResponse,
  ReportSummaryResponse,
  UserActivityResponse,
  CompletionRateResponse,
} from "../types/task";

export const getAllUsers = async (): Promise<(User & { stats?: { tasksCreated: number; tasksAssigned: number; tasksCompleted: number } })[]> => {
  const response = await api.get("/users");
  return response.data.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const updateUserRole = async (id: string, role: "admin" | "user"): Promise<User> => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getUserStats = async (id: string): Promise<UserStatsResponse["data"]["stats"]> => {
  const response = await api.get(`/users/${id}/stats`);
  return response.data.data.stats;
};

// Reports and Analytics endpoints
export const getTaskSummary = async (): Promise<ReportSummaryResponse["data"]> => {
  const response = await api.get("/reports/tasks-summary");
  return response.data.data;
};

export const getUserActivity = async (): Promise<UserActivityResponse["data"]> => {
  const response = await api.get("/reports/user-activity");
  return response.data.data;
};

export const getCompletionRate = async (): Promise<CompletionRateResponse["data"]> => {
  const response = await api.get("/reports/completion-rate");
  return response.data.data;
};
