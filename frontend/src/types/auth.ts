export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "user";
}

export interface LoginFormData {
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  error?: string;
}
