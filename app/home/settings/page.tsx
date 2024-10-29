"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { authFetch } from "@/app/utils/authFetch";
import ProfileSettings from "@/app/components/profile-settings";
import { useAuth } from "@/app/contexts/auth-context";

export default function SettingsPage() {
  const [persona, setPersona] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { updateUserToken } = useAuth();

  useEffect(() => {
    fetchPersona();
  }, []);

  const fetchPersona = async () => {
    try {
      const response = await authFetch("/api/digital-persona");
      if (!response.ok) {
        throw new Error("Error fetching persona details");
      }
      const personaDetails = await response.json();
      setPersona(personaDetails.personaData);
    } catch (err) {
      console.error("Error fetching persona details", err);
      toast({
        title: "Error",
        description: "Failed to fetch persona details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const response = await authFetch("/api/update-user-profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      updateUserToken(data.token);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      return { status: "success", data };
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: `${err}. Failed to update profile. Please try again.`,
        variant: "destructive",
      });
      return { status: "failure", data: err };
    }
  };

  const handleUpdatePersona = async (newPersona: string) => {
    try {
      const response = await authFetch("/api/update-digital-persona", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personaData: newPersona }),
      });

      if (!response.ok) {
        throw new Error("Failed to update persona");
      }

      setPersona(newPersona);
      toast({
        title: "Persona updated",
        description: "Your digital persona has been successfully updated.",
      });
    } catch (err) {
      console.error("Error updating persona:", err);
      toast({
        title: "Error",
        description: "Failed to update persona. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileSettings
      persona={persona}
      handleSaveProfile={handleSaveProfile}
      handleUpdatePersona={handleUpdatePersona}
    />
  );
}
