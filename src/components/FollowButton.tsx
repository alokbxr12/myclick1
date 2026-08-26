"use client";

import { useState } from "react";

export function FollowButton({
  username,
  initialFollowing,
  compact = false,
}: {
  username: string;
  initialFollowing: boolean;
  compact?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const res = await fetch(`/api/users/${username}/follow`, {
      method: following ? "DELETE" : "POST",
    });
    setBusy(false);
    if (res.ok) setFollowing(!following);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        compact && following
          ? "rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1.5 text-[11px] font-semibold text-white/58 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
          : compact
            ? "rounded-lg bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-[0_8px_18px_-12px_rgba(241,91,101,0.95)] transition hover:-translate-y-px disabled:opacity-50"
          : following
          ? "rounded-md border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm font-medium"
          : "rounded-md bg-foreground text-background px-4 py-1.5 text-sm font-medium disabled:opacity-50"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
