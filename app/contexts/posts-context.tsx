"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { toast } from "@/hooks/use-toast";
import { authFetch } from "@/app/utils/authFetch";

export type Platform = "Facebook" | "Twitter" | "LinkedIn" | "Instagram";
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

type ApiResponsePost = PostObj & {
  _id: string;
};

type UpdatePostRequestBody = {
  topic?: string;
  industry?: string;
  tone?: string;
  platform?: string;
  content?: string;
  scheduleDate?: Date;
  isCanceled?: boolean;
};

type SavePostRequestBody = {
  topic: string;
  industry: string;
  tone: string;
  platform: Platform;
  scheduleDate?: Date;
  generatedPost: string;
};

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  fetchPosts: () => Promise<void>;
  updatePost: (
    requestBody: UpdatePostRequestBody,
    editingPostId: string
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  savePost: (requestBody: SavePostRequestBody) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
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
  }, []);

  const updatePost = useCallback(
    async (requestBody: UpdatePostRequestBody, editingPostId: string) => {
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
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost._id
              ? { ...post, ...updatedPost, id: updatedPost._id }
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
    },
    []
  );

  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await authFetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
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
  }, []);

  const savePost = useCallback(async (requestBody: SavePostRequestBody) => {
    try {
      const response = await authFetch("/api/posts", {
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
      setPosts((prevPosts) => [...prevPosts, { ...data, id: data._id }]);
      toast({
        title: "Post created",
        description: data.scheduleDate
          ? "Your post has been successfully scheduled."
          : "Your post has been successfully created and saved.",
      });
    } catch (err) {
      console.error("Error creating post", err);
      toast({
        title: "Error",
        description: `${err}. Failed to create post. Please try again.`,
        variant: "destructive",
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      posts,
      isLoading,
      fetchPosts,
      updatePost,
      deletePost,
      savePost,
    }),
    [posts, isLoading, fetchPosts, updatePost, deletePost, savePost]
  );

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};
