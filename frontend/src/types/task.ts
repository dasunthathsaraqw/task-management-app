import type { User } from "./auth";

export interface StatusHistory {
  status: "Open" | "In Progress" | "Testing" | "Done";
  updatedAt: string;
  updatedBy: {
    _id: string;
    username: string;
    email: string;
  } | string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Testing" | "Done";
  dueDate: string;
  assignedTo: {
    _id: string;
    username: string;
    email: string;
    role: string;
  } | null;
  createdBy: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    tasks: Task[];
    pagination: Pagination;
  };
}

export interface TaskResponse {
  success: boolean;
  status: number;
  message: string;
  data: Task;
}

export interface UserStats {
  created: number;
  assigned: number;
  completed: number;
  inProgress?: number;
  testing?: number;
  open?: number;
  completionRate?: number;
}

export interface UserWithStats extends User {
  stats?: {
    tasksCreated: number;
    tasksAssigned: number;
    tasksCompleted: number;
  };
}

export interface UserStatsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    userId: string;
    username: string;
    stats: UserStats;
  };
}

export interface ReportSummaryResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    totalTasks: number;
    totalUsers: number;
    statusBreakdown: {
      Open: number;
      "In Progress": number;
      Testing: number;
      Done: number;
    };
    priorityBreakdown: {
      Low: number;
      Medium: number;
      High: number;
    };
  };
}

export interface UserActivityResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    userId: string;
    username: string;
    email: string;
    role: string;
    assigned: number;
    completed: number;
    open: number;
    inProgress: number;
    completionRate: number;
  }[];
}

export interface CompletionRateResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    averageCompletionTimeHours: number;
  };
}
