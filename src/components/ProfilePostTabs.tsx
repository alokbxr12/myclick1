"use client";

import { useState } from "react";
import { BookmarkIcon, GridIcon, RepostIcon } from "./Icons";
import { ProfilePostsGrid } from "./ProfilePostsGrid";
import type { Post } from "@/types/post";

type TabId = "posts" | "saved" | "reposts";

export function ProfilePostTabs({
  posts,
  reposts,
  savedPosts,
  isMe,
}: {
  posts: Post[];
  reposts: Post[];
  savedPosts: Post[];
  isMe: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("posts");
  const tabs: { id: TabId; label: string; icon: typeof GridIcon; visible: boolean }[] = [
    { id: "posts", label: "Posts", icon: GridIcon, visible: true },
    { id: "saved", label: "Saved", icon: BookmarkIcon, visible: isMe },
    { id: "reposts", label: "Reposts", icon: RepostIcon, visible: true },
  ];
  const currentPosts = activeTab === "posts" ? posts : activeTab === "saved" ? savedPosts : reposts;
  const emptyMessage = activeTab === "posts"
    ? "No posts yet."
    : activeTab === "saved"
      ? "No saved frames yet."
      : "No reposts yet.";

  return (
    <section className="mt-8">
      <div className="flex items-center justify-center gap-1 border-y border-black/10 px-2 dark:border-white/[0.09]" role="tablist" aria-label="Profile photographs">
        {tabs.filter((tab) => tab.visible).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={label}
              title={label}
              onClick={() => setActiveTab(id)}
              className={`relative flex h-14 min-w-16 items-center justify-center px-5 transition ${
                active ? "text-red-400" : "text-black/40 hover:text-black/70 dark:text-white/38 dark:hover:text-white/75"
              }`}
            >
              {id === "saved" ? <BookmarkIcon filled={active} className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-red-400" />}
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </div>

      <ProfilePostsGrid
        key={activeTab}
        posts={currentPosts}
        emptyMessage={emptyMessage}
        removeWhenUnsaved={activeTab === "saved"}
      />
    </section>
  );
}
