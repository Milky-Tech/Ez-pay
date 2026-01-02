"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BASE_API = "https://ez-pay.realestway.com/api";

type User = {
  id: number;
  full_name: string;
  fullName: string;
  email: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  message: string;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
};

type RegisterData = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  referrer_id?: string;
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${BASE_API}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Normalize possible response shapes: { data: { token, user } } OR { token, user }
      const tokenValue = data?.data?.token ?? data?.token ?? null;
      const userValue = data?.data?.user ?? data?.user ?? null;

      if (response.ok && tokenValue) {
        // Store token and user data
        localStorage.setItem("token", tokenValue);
        if (userValue) localStorage.setItem("user", JSON.stringify(userValue));
        setToken(tokenValue);
        if (userValue) setUser(userValue);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("Login failed:", data?.message || "Invalid credentials");
        setMessage(data?.message || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch(`${BASE_API}/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      const tokenValue = result?.data?.token ?? result?.token ?? null;
      const userValue = result?.data?.user ?? result?.user ?? null;

      if (response.ok && tokenValue) {
        localStorage.setItem("token", tokenValue);
        if (userValue) localStorage.setItem("user", JSON.stringify(userValue));

        if (userValue) setUser(userValue);
        setToken(tokenValue);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error(
          "Registration failed:",
          result?.message || "Registration error"
        );
        setMessage(result?.message || "Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        message,
        isAuthenticated,
        loading,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export isAuthenticated check function
export const checkIsAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("token") !== null &&
    localStorage.getItem("user") !== null
  );
};

// Export get current user function
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Export get token function
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};
