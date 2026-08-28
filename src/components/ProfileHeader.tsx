"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { ProfileStats } from "./ProfileStats";
import { EditProfileModal } from "./EditProfileModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { CameraEditIcon, PencilIcon, TrashIcon } from "./Icons";
import { VerifiedBadge } from "./VerifiedBadge";

export function ProfileHeader({
  user,
  isMe,
  isFollowing,
}: {
  user: {
    username: string;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
    _count: { followers: number; following: number; posts: number };
  };
  isMe: boolean;
  isFollowing: boolean;
}) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  return (
    <div className="relative grid grid-cols-[84px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 rounded-[1.75rem] border border-white/[0.075] bg-[#101114]/92 p-4 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.98)] sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-6 sm:p-6">
      {/* Avatar with click-to-edit overlay when isMe */}
      <div
        className={`relative z-10 flex w-[84px] flex-col items-center gap-2 sm:w-24 ${isMe ? "cursor-pointer group" : ""}`}
        onClick={() => isMe && setShowEditProfile(true)}
      >
        <div className="relative">
          <Avatar src={user.avatarUrl} username={user.username} size={84} />
          {isMe && (
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            <CameraEditIcon className="w-6 h-6" />
          </div>
          )}
        </div>
        {user.name && <p className="w-full truncate text-center text-xs font-medium text-white/68">{user.name}</p>}
      </div>

      <div className="relative z-10 min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="flex max-w-full min-w-0 items-center gap-1.5">
              <h1 className="min-w-0 truncate text-lg font-semibold">{user.username}</h1>
              <VerifiedBadge className="h-4 w-4" />
            </div>
            {!isMe && (
              <div className="shrink-0">
                <FollowButton username={user.username} initialFollowing={isFollowing} />
              </div>
            )}
          </div>

          {isMe && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                <span>Edit profile</span>
              </button>
              <button
                onClick={() => setShowDeleteAccount(true)}
                title="Delete Account"
                className="flex items-center gap-1 rounded-lg border border-red-400/30 bg-red-500/[0.04] px-2.5 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Account</span>
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="relative z-10 col-span-2 min-w-0 sm:col-start-2 sm:col-span-1">
        <ProfileStats
          username={user.username}
          posts={user._count.posts}
          followers={user._count.followers}
          following={user._count.following}
        />
        {user.bio && <p className="mt-0.5 whitespace-pre-line break-words text-sm text-black/70 dark:text-white/70">{user.bio}</p>}
      </div>

      {showEditProfile && <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} />}

      {showDeleteAccount && (
        <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
}
