"use client";

import { useState } from "react";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { ProfileStats } from "./ProfileStats";
import { EditAvatarModal } from "./EditAvatarModal";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { CameraEditIcon, TrashIcon } from "./Icons";

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
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-lg flex items-center gap-6">
      {/* Avatar with click-to-edit overlay when isMe */}
      <div
        className={`relative shrink-0 ${isMe ? "cursor-pointer group" : ""}`}
        onClick={() => isMe && setShowEditAvatar(true)}
      >
        <Avatar src={user.avatarUrl} username={user.username} size={96} />
        {isMe && (
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            <CameraEditIcon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold truncate">{user.username}</h1>
            {!isMe && <FollowButton username={user.username} initialFollowing={isFollowing} />}
          </div>

          {isMe && (
            <div className="flex items-center gap-2">
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

        {user.name && <p className="text-sm font-medium mt-1 truncate">{user.name}</p>}
        {user.bio && <p className="text-sm text-black/70 dark:text-white/70 mt-0.5">{user.bio}</p>}
      </div>

      {showEditAvatar && (
        <EditAvatarModal
          currentAvatarUrl={user.avatarUrl}
          username={user.username}
          onClose={() => setShowEditAvatar(false)}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />
      )}
    </div>
  );
}
