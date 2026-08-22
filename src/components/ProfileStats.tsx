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
      <div className="mb-3 grid w-full grid-cols-3 gap-2 text-center text-xs sm:flex sm:w-auto sm:gap-6 sm:text-left sm:text-sm">
        <span className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2 sm:block sm:bg-transparent sm:p-0">
          <strong className="text-white">{posts}</strong>{" "}
          <span className="text-white/48">posts</span>
        </span>
        <button
          onClick={() => setModal("followers")}
          className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2 hover:bg-white/[0.065] sm:block sm:bg-transparent sm:p-0 sm:hover:bg-transparent sm:hover:underline"
        >
          <strong className="text-white">{followers}</strong>{" "}
          <span className="text-white/48">followers</span>
        </button>
        <button
          onClick={() => setModal("following")}
          className="flex min-w-0 flex-col rounded-xl bg-white/[0.035] px-2 py-2 hover:bg-white/[0.065] sm:block sm:bg-transparent sm:p-0 sm:hover:bg-transparent sm:hover:underline"
        >
          <strong className="text-white">{following}</strong>{" "}
          <span className="text-white/48">following</span>
        </button>
      </div>

      {modal && <FollowListModal username={username} type={modal} onClose={() => setModal(null)} />}
    </>
  );
}
