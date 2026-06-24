import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/userApi";
import type { User, LoginFormData, RegisterFormData } from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginFormData, role: "admin" | "user") => Promise<void>;
  register: (data: RegisterFormData, role: "admin" | "user") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginFormData, role: "admin" | "user") => {
    try {
      const response = await api.post("/auth/login", {
        ...data,
        role,
      });

      if (response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (data: RegisterFormData, role: "admin" | "user") => {
    try {
      const response = await api.post("/auth/register", {
        ...data,
        role,
      });

      if (response.data.success) {
        const { user, accessToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    api.post("/auth/logout");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
