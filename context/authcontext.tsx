"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BASE_API =  process.env.NEXT_PUBLIC_API_URL
// const BASE_API = 'http://127.0.0.1:8000/api'

type User = {
  id: number;
  full_name: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "landlord" | "tenant";
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  message: string;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
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
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.debug("Session restored for:", parsedUser.email);
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          localStorage.removeItem("user");
        }
      }
    } else {
      // If unauthenticated, clear users related cache only
      localStorage.removeItem("user");
      // Also clear landlord specific cache if any
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('landlord_')) {
          localStorage.removeItem(key);
        }
      });
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setMessage("");
      console.log(`Attempting login at: ${BASE_API}/login`);

      const response = await fetch(`${BASE_API}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("Expected JSON but received:", text.substring(0, 100));
        data = { message: "Server returned non-JSON response" };
      }

      // Normalize possible response shapes: { data: { token, user } } OR { token, user } OR { access_token, user }
      const tokenValue =
        data?.data?.token ??
        data?.token ??
        data?.access_token ??
        data?.data?.access_token ??
        null;
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
        const errorMsg =
          data?.message ||
          data?.error ||
          (response.status === 401 ? "Invalid credentials" : "Login failed");
        console.error("Login failed:", errorMsg);
        setMessage(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("Network Error during login:", error);
      setMessage("Network error. Please check your internet connection.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google Login function
  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      setLoading(true);
      setMessage("");
      console.log(`Attempting Google login at: ${BASE_API}/login/google`);

      const response = await fetch(`${BASE_API}/login/google`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: credential }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.warn("Expected JSON but received from Google login:", text.substring(0, 100));
        data = { message: "Server returned non-JSON response" };
      }

      const tokenValue =
        data?.data?.token ??
        data?.token ??
        data?.access_token ??
        data?.data?.access_token ??
        null;
      const userValue = data?.data?.user ?? data?.user ?? null;

      if (response.ok && tokenValue) {
        localStorage.setItem("token", tokenValue);
        if (userValue) localStorage.setItem("user", JSON.stringify(userValue));

        setToken(tokenValue);
        if (userValue) setUser(userValue);
        setIsAuthenticated(true);
        return true;
      } else {
        const errorMsg =
          data?.message ||
          data?.error ||
          "Google login failed";
        console.error("Google login failed:", errorMsg);
        setMessage(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("Network Error during Google login:", error);
      setMessage("Network error during Google login. Please try again.");
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
      console.log(`Attempting register at: ${BASE_API}/register`);

      const response = await fetch(`${BASE_API}/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.warn("Expected JSON but received:", text.substring(0, 100));
        result = { message: "Server returned non-JSON response" };
      }

      const tokenValue =
        result?.data?.token ??
        result?.token ??
        result?.access_token ??
        result?.data?.access_token ??
        null;
      const userValue = result?.data?.user ?? result?.user ?? null;

      if (response.ok && tokenValue) {
        localStorage.setItem("token", tokenValue);
        if (userValue) localStorage.setItem("user", JSON.stringify(userValue));

        if (userValue) setUser(userValue);
        setToken(tokenValue);
        setIsAuthenticated(true);
        return true;
      } else {
        const errorMsg =
          result?.message || result?.error || "Registration failed";
        console.error("Registration failed:", errorMsg);
        setMessage(errorMsg);
        return false;
      }
    } catch (error) {
      console.error("Network Error during registration:", error);
      setMessage("Network error. Please check your internet connection.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Clear users related cache only (e.g. landlord data)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('landlord_')) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setToken(null);
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
        googleLogin,
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
