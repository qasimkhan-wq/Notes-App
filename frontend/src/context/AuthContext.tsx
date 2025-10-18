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

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find(
        (u: any) => u.email === email && u.password === password,
      );

      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem("currentUser", JSON.stringify(existingUser));
        toast.success("Logged in successfully!");
        return true;
      } else {
        toast.error("Invalid email or password.");
        return false;
      }
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        toast.error("User already exists.");
        return false;
      }

      const newUser = {
        id: new Date().toISOString(),
        email,
        password,
      };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      setUser(newUser);
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      toast.success("Account created and logged in successfully!");
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("currentUser");
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