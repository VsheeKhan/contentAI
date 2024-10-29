"use client";

import { useAuth } from "@/app/contexts/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserHome() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.isPersonaAvailable) {
      router.push("/home/generate");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return null;
}
