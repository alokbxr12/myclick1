"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PostCard } from "./PostCard";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./Icons";
import type { Post } from "@/types/post";

export function ProfilePostsGrid({
  posts: initialPosts,
  emptyMessage = "No posts yet.",
  removeWhenUnsaved = false,
}: {
  posts: Post[];
  emptyMessage?: string;
  removeWhenUnsaved?: boolean;
}) {
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
      <div className="mt-4 grid overflow-hidden rounded-[1.5rem] border border-white/[0.075] bg-white/[0.025] p-1.5 grid-cols-3 gap-1.5 shadow-[0_24px_70px_-48px_rgba(0,0,0,0.98)]">
        {posts.map((post, index) => (
          <button
            key={post.id}
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-black/5 dark:bg-white/5"
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
        <p className="mt-10 text-center text-sm text-black/60 dark:text-white/60">{emptyMessage}</p>
      )}

      {openPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-3 py-4 backdrop-blur-sm sm:px-8 sm:py-8" onClick={close} role="dialog" aria-modal="true" aria-label="Photograph viewer">
          <div className="relative flex w-full max-w-2xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={showPrev}
              disabled={!hasPrev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white shadow-lg transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-25 sm:-left-14 sm:h-11 sm:w-11"
            >
              <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="custom-scrollbar max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-[1.75rem] shadow-[0_32px_100px_-38px_rgba(0,0,0,1)] sm:max-h-[calc(100vh-4rem)]">
              <PostCard
                post={openPost}
                onDeleted={handleDeleted}
                onSavedChange={(postId, saved) => {
                  if (!removeWhenUnsaved || saved) return;
                  setPosts((current) => current.filter((post) => post.id !== postId));
                  close();
                }}
                showOwnerMenu
                imageOverlay={
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white transition hover:bg-black/80"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                }
              />
            </div>

            <button
              onClick={showNext}
              disabled={!hasNext}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white shadow-lg transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-25 sm:-right-14 sm:h-11 sm:w-11"
            >
              <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
