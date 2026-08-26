"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { ProfileStats } from "./ProfileStats";
import { EditAvatarModal } from "./EditAvatarModal";
import { EditBioModal } from "./EditBioModal";
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
  const [showEditAvatar, setShowEditAvatar] = useState(false);
  const [showEditBio, setShowEditBio] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  return (
    <div className="glass-panel flex flex-col items-stretch gap-5 rounded-2xl p-4 shadow-lg sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      {/* Avatar with click-to-edit overlay when isMe */}
      <div
        className={`relative shrink-0 self-center sm:self-auto ${isMe ? "cursor-pointer group" : ""}`}
        onClick={() => isMe && setShowEditAvatar(true)}
      >
        <Avatar src={user.avatarUrl} username={user.username} size={96} />
        {isMe && (
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            <CameraEditIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="w-full min-w-0 flex-1">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                onClick={() => setShowEditBio(true)}
                className="rounded-lg border border-black/15 px-3 py-1 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 flex items-center gap-1.5"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                <span>Edit bio</span>
              </button>
              <button
                onClick={() => setShowEditAvatar(true)}
                className="rounded-lg border border-black/15 dark:border-white/20 px-3 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <CameraEditIcon className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>
              <button
                onClick={() => setShowDeleteAccount(true)}
                title="Delete Account"
                className="rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Account</span>
              </button>
            </div>
          )}
        </div>

        <ProfileStats
          username={user.username}
          posts={user._count.posts}
          followers={user._count.followers}
          following={user._count.following}
        />

        {user.name && <p className="mt-2 truncate text-sm font-medium">{user.name}</p>}
        {user.bio && <p className="mt-0.5 whitespace-pre-line break-words text-sm text-black/70 dark:text-white/70">{user.bio}</p>}
      </div>

      {showEditAvatar && (
        <EditAvatarModal
          currentAvatarUrl={user.avatarUrl}
          username={user.username}
          onClose={() => setShowEditAvatar(false)}
        />
      )}

      {showEditBio && <EditBioModal currentBio={user.bio} onClose={() => setShowEditBio(false)} />}

      {showDeleteAccount && (
        <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
}
