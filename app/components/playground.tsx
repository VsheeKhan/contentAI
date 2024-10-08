"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  FileText,
  LogOut,
  Loader2,
  Settings,
  Trash2,
  Copy,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { authFetch } from "../utils/authFetch";
import Image from "next/image";
import ProfileSettings from "./profile-settings";
import GeneratePost from "./generate-post";
import PostsList from "./posts-list";
import { toast } from "@/hooks/use-toast";

type TabTypes = "generate" | "posts" | "settings";

export type Post = {
  id: string;
  userId: string;
  content: string;
  topic: string;
  industry: string;
  tone: string;
  platform: string;
  createdAt: string;
};

export default function Playground() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [activeTab, setActiveTab] = useState<TabTypes>("generate");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchTopics();
    fetchPersona();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await authFetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(
        data.map(
          ({
            _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
          }) => ({
            id: _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
          })
        )
      );
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await authFetch("/api/get-custom-topics");
      if (!response.ok) {
        throw new Error("Failed to fetch custom topics");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      setError(
        "An error occurred while fetching questions. Please try again later."
      );
      console.error("Error fetching posts", err);
    }
  };

  const fetchPersona = async () => {
    try {
      const response = await authFetch("/api/digital-persona");
      if (!response.ok) {
        throw new Error("Error fetching persona details");
      }
      const personaDetails = await response.json();
      setPersona(personaDetails.personaData);
      // setPersonaString(personaDetails.personaData);
    } catch (err) {
      console.error("Error fetching persona details", err);
      toast({
        title: "Error",
        description: "Failed to fetch persona details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTopics = async () => {
    try {
      const response = await authFetch("/api/generate-post-topics");
      if (!response.ok) {
        throw new Error("Failed to generate topic ideas");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      console.error("Error fetching topic ideas", err);
      toast({
        title: "Error",
        description: "Failed to generate topic ideas. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePost = async (requestBody: any) => {
    try {
      const response = await authFetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("Failed to generate post");
      }
      const data = await response.json();
      return data.post;
    } catch (err) {
      console.error("Error generating post: ", err);
      toast({
        title: "Error",
        description: "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async (requestBody: any) => {
    try {
      const response = await authFetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      const {
        content,
        createdAt,
        industry,
        platform,
        topic,
        tone,
        _id,
        userId,
      } = await response.json();
      setPosts((prevPosts) => [
        ...prevPosts,
        {
          id: _id,
          content,
          createdAt,
          industry,
          platform,
          tone,
          topic,
          userId,
        },
      ]);
      toast({
        title: "Post created",
        description: "Your post has been successfully created and saved.",
      });
    } catch (err) {
      console.error("Error creating post", err);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePost = async (requestBody: any) => {
    try {
      const response = await authFetch(`/api/posts/${editingPostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("Failed to update post");
      }
      const updatedPost = await response.json();
      const { userId, content, topic, industry, platform, tone, createdAt } =
        updatedPost;
      setPosts(
        posts.map((post) =>
          post.id === updatedPost._id
            ? {
                id: updatedPost._id,
                userId,
                content,
                tone,
                topic,
                industry,
                platform,
                createdAt,
              }
            : post
        )
      );
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
      });
    } catch (err) {
      console.error("Error updating post", err);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await authFetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts(posts.filter((post) => post.id !== postId));
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting post", err);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSavePersona = async (personaString: string) => {
    try {
      const response = await authFetch("/api/digital-persona", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ personaData: personaString }),
      });

      if (!response.ok) {
        throw new Error("Failed to save persona");
      }
      const updatedPersona = await response.json();
      setPersona(updatedPersona.personaData);
      toast({
        title: "Persona updated",
        description: "Your persona has been successfully updated.",
      });
    } catch (err) {
      console.error("Error updating persona", err);
      toast({
        title: "Error",
        description: "Failed to update persona. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    try {
      const response = await authFetch("/api/update-user-profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      if (data.profileImage && data.profileImage.length > 0)
        localStorage.setItem("profileImage", data.profileImage);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Dismiss</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="w-8 h-8 bg-pink-500 rounded-md mr-2 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="Profile"
                  width={500}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </span>
            {user?.name}
          </h2>
        </div>
        <nav className="p-4">
          <Button
            variant={activeTab === "generate" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => {
              setActiveTab("generate");
              setEditingPostId(null);
            }}
          >
            <PenLine className="mr-2 h-4 w-4" /> Generate Post
          </Button>
          <Button
            variant={activeTab === "posts" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveTab("posts")}
          >
            <FileText className="mr-2 h-4 w-4" /> Posts
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            className="w-full justify-start mb-2"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {activeTab === "generate"
              ? "Generate Post"
              : activeTab === "posts"
              ? "Posts"
              : "Settings"}
          </h1>
          <div className="flex items-center space-x-4"></div>
        </header>
        <main className="p-6 space-y-8">
          {activeTab === "generate" && (
            <GeneratePost
              handleSavePost={handleSavePost}
              activeTab={activeTab}
              handleGenerateTopics={handleGenerateTopics}
              handleGeneratePost={handleGeneratePost}
              topics={topics}
            />
          )}

          {activeTab === "posts" && (
            <PostsList
              posts={posts}
              handleUpdatePost={handleUpdatePost}
              handleDeletePost={handleDeletePost}
              updateEditingPostId={setEditingPostId}
              editingPostId={editingPostId}
            />
          )}

          {activeTab === "settings" && (
            <ProfileSettings
              persona={persona}
              handleSavePersona={handleSavePersona}
              handleSaveProfile={handleSaveProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}
