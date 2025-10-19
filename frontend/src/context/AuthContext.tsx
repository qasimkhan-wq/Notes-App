"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          },
        );

        if (response.ok) {
          const { access_token } = await response.json();
          localStorage.setItem("token", access_token);
          await fetchCurrentUser();
          toast.success("Logged in successfully!");
          return true;
        } else {
          const errorData = await response.json();
          toast.error(errorData.detail || "Invalid email or password.");
          return false;
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return false;
      }
    },
    [fetchCurrentUser],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          },
        );

        if (response.ok) {
          const { access_token } = await response.json();
          localStorage.setItem("token", access_token);
          await fetchCurrentUser();
          toast.success("Account created and logged in successfully!");
          return true;
        } else {
          const errorData = await response.json();
          toast.error(errorData.detail || "Failed to create account.");
          return false;
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return false;
      }
    },
    [fetchCurrentUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    toast.info("Logged out.");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};