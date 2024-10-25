"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { authFetch } from "@/app/utils/authFetch";
import PostsList from "@/app/components/posts-list";
import { Loader2 } from "lucide-react";

type PostObj = {
  userId: string;
  content: string;
  topic: string;
  industry: string;
  tone: string;
  platform: "Facebook" | "Twitter" | "LinkedIn" | "Instagram";
  createdAt: string;
  scheduleDate?: string;
  isCanceled?: boolean;
};

export type Post = PostObj & {
  id: string;
};

export type ApiResponsePost = PostObj & {
  _id: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
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

  const handleUpdatePost = async (requestBody: any, editingPostId: string) => {
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
      const {
        userId,
        content,
        topic,
        industry,
        platform,
        tone,
        createdAt,
        scheduleDate,
        isCanceled,
      } = updatedPost;
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
                scheduleDate,
                isCanceled,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PostsList
      posts={posts}
      handleUpdatePost={handleUpdatePost}
      handleDeletePost={handleDeletePost}
    />
  );
}
