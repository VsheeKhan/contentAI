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
  hasExpired?: boolean;
}

interface AuthContextType {
  user: AuthUser | null | undefined;
  login: (
    token: string,
    isPersonaAvailable: boolean,
    profileImage: string,
    hasExpired?: boolean
  ) => Promise<boolean>;
  logout: () => void;
  updateUserPersonaStatus: () => void;
  updateUserProfileImage: (newProfileImage: string) => void;
  updateUserToken: (newToken: string) => void;
  updateUserName: (newName: string) => void;
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
        hasExpired: false,
      });
    } else {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    (
      token: string,
      isPersonaAvailable: boolean,
      profileImage: string,
      hasExpired = false
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        localStorage.setItem("authToken", token);
        localStorage.setItem(
          "isPersonaAvailable",
          JSON.stringify(isPersonaAvailable)
        );
        localStorage.setItem("profileImage", profileImage);

        const { userId, name, email, isAdmin, hasExpired } = JSON.parse(
          atob(token.split(".")[1])
        );
        setUser({
          userId,
          name,
          email,
          isAdmin,
          isPersonaAvailable,
          profileImage,
          hasExpired,
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

  const updateUserPersonaStatus = () => {
    localStorage.setItem("isPersonaAvailable", JSON.stringify(true));
    if (user) setUser({ ...user, isPersonaAvailable: true });
  };

  const updateUserProfileImage = (newPofileImage: string) => {
    localStorage.setItem("profileImage", newPofileImage);
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, profileImage: newPofileImage };
      }
      return prevUser;
    });
  };

  const updateUserToken = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    const payload = JSON.parse(atob(newToken.split(".")[1]));
    if (user)
      setUser({
        ...user,
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
      });
  };

  const updateUserName = (newName: string) => {
    if (user) {
      setUser({ ...user, name: newName });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserPersonaStatus,
        updateUserProfileImage,
        updateUserToken,
        updateUserName,
      }}
    >
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
