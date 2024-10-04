"use client";

import { useAuth } from "../contexts/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="ghost"
      size="sm"
      className="absolute top-4 right-4 flex items-center space-x-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
