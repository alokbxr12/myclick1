"use client";

import { useState } from "react";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
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
        following
          ? "rounded-md border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm font-medium"
          : "rounded-md bg-foreground text-background px-4 py-1.5 text-sm font-medium disabled:opacity-50"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
