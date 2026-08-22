"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-sm max-h-[85dvh] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
          <h2 className="font-semibold capitalize">{type}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-lg leading-none rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div
          className="custom-scrollbar overflow-y-auto min-h-0 max-h-[204px]"
          style={{ overscrollBehavior: "contain" }}
        >
          {users === null && (
            <p className="text-sm text-center text-black/60 dark:text-white/60 py-8">Loading…</p>
          )}

          {users !== null && users.length === 0 && (
            <p className="text-sm text-center text-black/60 dark:text-white/60 py-8">
              No {type} yet.
            </p>
          )}

          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 min-h-[68px] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Link
                href={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Avatar src={user.avatarUrl} username={user.username} size={40} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.username}</p>
                  {user.name && (
                    <p className="text-xs text-black/60 dark:text-white/60 truncate">{user.name}</p>
                  )}
                </div>
              </Link>
              {!user.isMe && (
                <FollowButton username={user.username} initialFollowing={user.isFollowing} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
