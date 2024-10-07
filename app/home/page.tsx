"use client";

import { useAuth } from "../contexts/auth-context";
import PersonaSurvey from "../components/persona-survey";
import Playground from "../components/playground";
import LogoutButton from "../components/logout-button";

export default function UserHome() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.isPersonaAvailable ? (
    <>
      <div className="h-screen w-full">
        <Playground />
      </div>
    </>
  ) : (
    <>
      <LogoutButton className="fixed top-4 right-4 z-50" />
      <PersonaSurvey />
    </>
  );
}
