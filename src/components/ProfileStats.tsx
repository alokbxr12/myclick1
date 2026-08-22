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
      <div className="flex gap-6 text-sm mb-2">
        <span>
          <strong>{posts}</strong> posts
        </span>
        <button onClick={() => setModal("followers")} className="hover:underline">
          <strong>{followers}</strong> followers
        </button>
        <button onClick={() => setModal("following")} className="hover:underline">
          <strong>{following}</strong> following
        </button>
      </div>

      {modal && <FollowListModal username={username} type={modal} onClose={() => setModal(null)} />}
    </>
  );
}
