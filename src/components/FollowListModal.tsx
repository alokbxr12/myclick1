"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { VerifiedBadge } from "./VerifiedBadge";

type ListUser = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
  isMe: boolean;
};

export function FollowListModal({
  username,
  type,
  onClose,
}: {
  username: string;
  type: "followers" | "following";
  onClose: () => void;
}) {
  const [users, setUsers] = useState<ListUser[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/users/${username}/${type}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsers(data.users ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [username, type]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040406]/78 p-3 backdrop-blur-md sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#101014]/98 shadow-[0_30px_100px_-32px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] bg-[radial-gradient(circle_at_0%_0%,rgba(241,91,101,0.13),transparent_42%)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300/85">Profile circle</p>
            <h2 className="mt-1 text-lg font-semibold capitalize text-white">{type}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.045] text-lg leading-none text-white/70 transition hover:bg-white/[0.1] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div
          className="custom-scrollbar min-h-0 max-h-[min(34rem,66dvh)] overflow-y-auto p-2.5 sm:p-3"
          style={{ overscrollBehavior: "contain" }}
        >
          {users === null && (
            <p className="py-12 text-center text-sm text-white/48">Loading…</p>
          )}

          {users !== null && users.length === 0 && (
            <p className="py-12 text-center text-sm text-white/48">
              No {type} yet.
            </p>
          )}

          {users?.map((user) => (
            <div
              key={user.id}
              className="mb-2 flex min-w-0 items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 transition hover:border-red-300/20 hover:bg-red-500/[0.045] sm:min-h-[76px] sm:gap-3 sm:px-3.5"
            >
              <Link
                href={`/profile/${user.username}`}
                onClick={onClose}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Avatar src={user.avatarUrl} username={user.username} size={40} className="ring-red-300/20" />
                <div className="min-w-0">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-white">
                    <span className="truncate">{user.username}</span>
                    <VerifiedBadge className="h-3.5 w-3.5" />
                  </p>
                  {user.name && (
                    <p className="mt-0.5 truncate text-xs text-white/42">{user.name}</p>
                  )}
                </div>
              </Link>
              {!user.isMe && (
                <FollowButton compact username={user.username} initialFollowing={user.isFollowing} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
