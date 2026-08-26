"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { CloseIcon, HeartIcon } from "./Icons";
import { FollowButton } from "./FollowButton";
import { VerifiedBadge } from "./VerifiedBadge";

type Liker = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
  isMe: boolean;
};

export function PostLikesModal({
  postId,
  likeCount,
  onClose,
}: {
  postId: string;
  likeCount: number;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<Liker[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/posts/${postId}/likes`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load likes");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUsers(data.users ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-likes-title"
        className="flex max-h-[78dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111115] shadow-[0_30px_100px_-30px_rgba(0,0,0,0.95)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <HeartIcon filled className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 id="post-likes-title" className="text-sm font-bold text-white">Liked by</h2>
              <p className="text-[10px] text-white/38">
                {likeCount} {likeCount === 1 ? "photographer" : "photographers"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close likes"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.07] hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="custom-scrollbar min-h-0 overflow-y-auto p-2">
          {users === null && !error && (
            <div className="flex flex-col gap-2 p-2" aria-label="Loading likes">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-2xl bg-white/[0.035]" />
              ))}
            </div>
          )}

          {error && (
            <p className="px-4 py-10 text-center text-xs text-red-300/75">
              We couldn’t load these photographers.
            </p>
          )}

          {users?.length === 0 && (
            <p className="px-4 py-10 text-center text-xs text-white/38">No likes on this frame yet.</p>
          )}

          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.045]"
            >
              <Link href={`/profile/${user.username}`} onClick={onClose} className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar src={user.avatarUrl} username={user.username} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white/88">
                    <span className="truncate">{user.username}</span>
                    <VerifiedBadge className="h-3.5 w-3.5" />
                  </p>
                  {user.name && <p className="mt-0.5 truncate text-xs text-white/36">{user.name}</p>}
                </div>
              </Link>
              {!user.isMe && <FollowButton compact username={user.username} initialFollowing={user.isFollowing} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
