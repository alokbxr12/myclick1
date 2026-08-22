"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PostCard } from "./PostCard";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";
import type { Post } from "@/types/post";

export function ProfilePostsGrid({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openPost = openIndex !== null ? posts[openIndex] : null;
  const hasPrev = openIndex !== null && openIndex > 0;
  const hasNext = openIndex !== null && openIndex < posts.length - 1;

  function close() {
    setOpenIndex(null);
  }

  function showPrev() {
    setOpenIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }

  function showNext() {
    setOpenIndex((i) => (i !== null && i < posts.length - 1 ? i + 1 : i));
  }

  useEffect(() => {
    if (openIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, posts.length]);

  function handleDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    close();
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 mt-8 rounded-lg overflow-hidden">
        {posts.map((post, index) => (
          <button
            key={post.id}
            onClick={() => setOpenIndex(index)}
            className="relative aspect-square bg-black/5 dark:bg-white/5 group overflow-hidden"
          >
            <Image
              src={post.imageUrl}
              alt={post.caption ?? "Photo"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100">
              <span>♥ {post._count.likes}</span>
              <span>💬 {post._count.comments}</span>
            </div>
          </button>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-sm text-black/60 dark:text-white/60 mt-10">No posts yet.</p>
      )}

      {openPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={close}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            disabled={!hasPrev}
            aria-label="Previous photo"
            className="hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white transition-opacity disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/20"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <div className="w-full max-w-md max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <PostCard
              post={openPost}
              onDeleted={handleDeleted}
              showOwnerMenu
              imageOverlay={
                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              }
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            disabled={!hasNext}
            aria-label="Next photo"
            className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-11 h-11 rounded-full bg-white/10 text-white transition-opacity disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/20"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}
