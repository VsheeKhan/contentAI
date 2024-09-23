"use client";

import { useAuth } from "@/app/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
