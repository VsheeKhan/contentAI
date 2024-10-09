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
  profileImage: string;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  login: (
    token: string,
    isPersonaAvailable: boolean,
    profileImage: string
  ) => Promise<boolean>;
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
    const profileImage = localStorage.getItem("profileImage");
    if (token && isPersonaAvailableString) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
        isPersonaAvailable: JSON.parse(isPersonaAvailableString),
        profileImage: profileImage || "",
      });
    } else {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    (
      token: string,
      isPersonaAvailable: boolean,
      profileImage: string
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem(
          "isPersonaAvailable",
          JSON.stringify(isPersonaAvailable)
        );
        localStorage.setItem("profileImage", profileImage);

        const { userId, name, email, isAdmin } = JSON.parse(
          atob(token.split(".")[1])
        );
        setUser({
          userId,
          name,
          email,
          isAdmin,
          isPersonaAvailable,
          profileImage,
        });
        setLoginResolver(() => resolve);
      });
    },
    []
  );

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isPersonaAvailable");
    localStorage.removeItem("profileImage");
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
