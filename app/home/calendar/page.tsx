"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { authFetch } from "@/app/utils/authFetch";
import ContentCalendar from "@/app/components/content-calendar";
import { Loader2 } from "lucide-react";
import { ApiResponsePost, Post } from "../posts/page";

export default function CalendarPage() {
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const response = await authFetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setScheduledPosts(
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
            scheduleDate,
            isCanceled,
          }: ApiResponsePost) => ({
            id: _id,
            userId,
            content,
            topic,
            industry,
            tone,
            platform,
            createdAt,
            scheduleDate,
            isCanceled,
          })
        )
      );
    } catch (err) {
      console.error("Error fetching posts", err);
      toast({
        title: "Error",
        description:
          "An error occurred while fetching posts. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedulePost = async (
    requestBody: any,
    postId: string,
    reschedule: boolean
  ) => {
    try {
      const response = await authFetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error("Failed to reschedule post");
      }
      const updatedPost = await response.json();
      setScheduledPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedPost } : post
        )
      );
      toast({
        title: "Post rescheduled",
        description: "Your post has been successfully rescheduled.",
      });
    } catch (err) {
      console.error("Error rescheduling post", err);
      toast({
        title: "Error",
        description: "Failed to reschedule post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelScheduledPost = async (postId: string) => {
    try {
      const response = await authFetch(`/api/cancel-post-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });
      if (!response.ok) {
        throw new Error("Failed to cancel scheduled post");
      }
      const updatedPost = await response.json();
      setScheduledPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedPost.post } : post
        )
      );
      toast({
        title: "Post canceled",
        description: "Your scheduled post has been successfully canceled.",
      });
    } catch (err) {
      console.error("Error canceling scheduled post", err);
      toast({
        title: "Error",
        description: "Failed to cancel scheduled post. Please try again.",
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
    <ContentCalendar
      scheduledPosts={scheduledPosts}
      handleReschedulePost={handleReschedulePost}
      handleCancelScheduledPost={handleCancelScheduledPost}
    />
  );
}
