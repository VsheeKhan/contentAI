"use client";

import { useAuth } from "@/app/contexts/auth-context";
import PersonaSurvey from "@/app/components/persona-survey";
import LogoutButton from "@/app/components/logout-button";
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

  if (!user.isPersonaAvailable) {
    return (
      <div className="relative h-screen w-full bg-gray-100">
        <LogoutButton className="fixed top-4 right-4 z-50" />
        <PersonaSurvey editPersona={false} />
      </div>
    );
  }
  return null;
}
