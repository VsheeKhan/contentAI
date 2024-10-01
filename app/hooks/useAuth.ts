import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  name: string;
  email: string;
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        name: payload.name,
        email: payload.email,
        isAdmin: payload.isAdmin,
      });
    }
  }, []);

  const login = (token: string, name: string, email: string) => {
    localStorage.setItem("authToken", token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({ name, email, isAdmin: payload.isAdmin });
    if (payload.isAdmin) router.push("/admin/dashboard");
    else router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    router.push("/auth");
  };

  return { user, login, logout };
}
