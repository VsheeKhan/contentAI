"use client";

import { useEffect } from "react";
import PostsList from "@/app/components/posts-list";
import { Loader2 } from "lucide-react";
import { usePosts } from "@/app/contexts/posts-context";

export default function PostsPage() {
  const { posts, fetchPosts, isLoading, updatePost, deletePost } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
      handleUpdatePost={updatePost}
      handleDeletePost={deletePost}
    />
  );
}
