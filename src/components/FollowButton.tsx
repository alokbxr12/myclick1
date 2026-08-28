"use client";

import { useEffect, useState } from "react";

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
    if (res.ok) {
      const nextFollowing = !following;
      setFollowing(nextFollowing);
      window.dispatchEvent(new CustomEvent("myclick:follow-change", { detail: { username, following: nextFollowing } }));
    }
  }

  useEffect(() => {
    function syncFollowing(event: Event) {
      const detail = (event as CustomEvent<{ username: string; following: boolean }>).detail;
      if (detail?.username === username) setFollowing(detail.following);
    }

    window.addEventListener("myclick:follow-change", syncFollowing);
    return () => window.removeEventListener("myclick:follow-change", syncFollowing);
  }, [username]);

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
          ? "rounded-xl border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white/72 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)] transition hover:bg-white/[0.09] hover:text-white disabled:opacity-50"
          : "rounded-xl border border-red-200/20 bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_26px_-15px_rgba(241,91,101,0.95)] transition hover:-translate-y-px hover:brightness-110 disabled:opacity-50"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
