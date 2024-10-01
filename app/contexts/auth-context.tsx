"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthUser {
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  login: (token: string, name: string, email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [loginResolver, setLoginResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  useEffect(() => {
    if (user && loginResolver) {
      loginResolver(user.isAdmin);
      setLoginResolver(null);
    }
  }, [user, loginResolver]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
      });
    } else {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    (token: string, name: string, email: string): Promise<boolean> => {
      return new Promise((resolve) => {
        localStorage.setItem("authToken", token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ name, email, isAdmin: payload.isAdmin });
        setLoginResolver(() => resolve);
      });
    },
    []
  );

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
