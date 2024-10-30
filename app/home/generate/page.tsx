"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { authFetch } from "@/app/utils/authFetch";
import GeneratePost from "@/app/components/generate-post";
import { Loader2 } from "lucide-react";
import { usePosts } from "@/app/contexts/posts-context";

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [topics, setTopics] = useState<string[]>([]);
  const { savePost } = usePosts();

  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authFetch("/api/get-custom-topics");
      if (!response.ok) {
        throw new Error("Failed to fetch custom topics");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      console.error("Error fetching topics", err);
      toast({
        title: "Error",
        description: "Failed to fetch topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleGenerateTopics = async () => {
    try {
      const response = await authFetch("/api/generate-post-topics");
      if (!response.ok) {
        throw new Error("Failed to generate topic ideas");
      }
      const data = await response.json();
      setTopics(data.topics);
    } catch (err) {
      console.error("Error generating topic ideas", err);
      toast({
        title: "Error",
        description: "Failed to generate topic ideas. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePost = async (requestBody: {
    topic: string;
    industry: string;
    tone: string;
    platform: string;
    style: string;
    noOfPosts: number;
  }) => {
    try {
      const response = await authFetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      const data = await response.json();
      return data.posts;
    } catch (err) {
      console.error("Error generating post: ", err);
      toast({
        title: "Error",
        description: `${err}. Failed to generate post. Please try again.`,
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

  return (
    <GeneratePost
      handleSavePost={savePost}
      handleGenerateTopics={handleGenerateTopics}
      handleGeneratePost={handleGeneratePost}
      topics={topics}
    />
  );
}
