"use client";

import { useState } from "react";
import { PostCard } from "./PostCard";
import type { Post } from "@/types/post";

export function SavedFramesFeed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);

  if (posts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/[0.075] bg-[#101014]/88 px-6 py-14 text-center shadow-[0_24px_70px_-48px_rgba(0,0,0,0.98)]">
        <p className="text-base font-semibold text-white">Your saved library is clear</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/42">Save a photograph from the feed whenever its light, composition, or story gives you an idea to return to.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onSavedChange={(postId, saved) => {
            if (!saved) setPosts((current) => current.filter((item) => item.id !== postId));
          }}
        />
      ))}
    </div>
  );
}
