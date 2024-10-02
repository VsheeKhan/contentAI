"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AuthUser {
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isPersonaAvailable: boolean;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  login: (token: string, isPersonaAvailable: boolean) => Promise<boolean>;
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
    const isPersonaAvailableString = localStorage.getItem("isPersonaAvailable");
    if (token && isPersonaAvailableString) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
        isPersonaAvailable: JSON.parse(isPersonaAvailableString),
      });
    } else {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    (token: string, isPersonaAvailable: boolean): Promise<boolean> => {
      return new Promise((resolve) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem(
          "isPersonaAvailable",
          JSON.stringify(isPersonaAvailable)
        );
        const { userId, name, email, isAdmin } = JSON.parse(
          atob(token.split(".")[1])
        );
        setUser({ userId, name, email, isAdmin, isPersonaAvailable });
        setLoginResolver(() => resolve);
      });
    },
    []
  );

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isPersonaAvailable");
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
