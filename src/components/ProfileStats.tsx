"use client";

import { useState } from "react";
import { FollowListModal } from "./FollowListModal";

export function ProfileStats({
  username,
  posts,
  followers,
  following,
}: {
  username: string;
  posts: number;
  followers: number;
  following: number;
}) {
  const [modal, setModal] = useState<"followers" | "following" | null>(null);

  return (
    <>
      <div className="mb-4 grid w-full grid-cols-3 gap-1.5 rounded-2xl border border-white/[0.07] bg-black/15 p-1.5 text-center">
        <span className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2.5 transition sm:hover:bg-white/[0.055]">
          <strong className="text-sm text-white">{posts}</strong>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">Posts</span>
        </span>
        <button
          onClick={() => setModal("followers")}
          className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2.5 transition hover:bg-red-500/[0.09] hover:text-white"
        >
          <strong className="text-sm text-white">{followers}</strong>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">Followers</span>
        </button>
        <button
          onClick={() => setModal("following")}
          className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2.5 transition hover:bg-red-500/[0.09] hover:text-white"
        >
          <strong className="text-sm text-white">{following}</strong>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">Following</span>
        </button>
      </div>

      {modal && <FollowListModal username={username} type={modal} onClose={() => setModal(null)} />}
    </>
  );
}
