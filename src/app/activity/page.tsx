"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { BellIcon, CommentIcon, HeartIcon, RepostIcon, UserProfileIcon } from "@/components/Icons";

type ActivityType = "LIKE" | "COMMENT" | "REPOST" | "FOLLOW" | "MENTION" | "COLLAB_REQUEST" | "COLLAB_ACCEPTED";

type ActivityItem = {
  id: string;
  type: ActivityType;
  createdAt: string;
  readAt: string | null;
  actor: { id: string; username: string; name: string | null; avatarUrl: string | null };
  post: { id: string; imageUrl: string; caption: string | null } | null;
  comment: { content: string } | null;
  collaborationStatus: "PENDING" | "ACCEPTED" | "DECLINED" | null;
};

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const className = "h-3.5 w-3.5";
  if (type === "LIKE") return <HeartIcon filled className={className} />;
  if (type === "COMMENT") return <CommentIcon className={className} />;
  if (type === "REPOST") return <RepostIcon className={className} />;
  if (type === "MENTION") return <CommentIcon className={className} />;
  return <UserProfileIcon className={className} />;
}

function description(item: ActivityItem) {
  switch (item.type) {
    case "LIKE":
      return "liked your photograph";
    case "COMMENT":
      return "commented on your photograph";
    case "REPOST":
      return "reposted your photograph";
    case "FOLLOW":
      return "started following you";
    case "MENTION":
      return "mentioned you";
    case "COLLAB_REQUEST":
      return "invited you to collaborate on a photograph";
    case "COLLAB_ACCEPTED":
      return "accepted your collaboration invite";
  }
}

export default function ActivityPage() {
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collaborationBusy, setCollaborationBusy] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/activity", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load activity");
      const data = await response.json();
      setNotifications(data.notifications);
      setError("");
      void fetch("/api/activity", { method: "PATCH" });
      window.dispatchEvent(new Event("myclick:activity-seen"));
    } catch {
      setError("Your activity couldn't be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void loadActivity());
    return () => window.cancelAnimationFrame(frame);
  }, [loadActivity]);

  async function respondToCollaboration(item: ActivityItem, response: "accept" | "decline") {
    if (!item.post || collaborationBusy) return;
    setCollaborationBusy(item.id);
    const result = await fetch(`/api/posts/${item.post.id}/collaboration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    setCollaborationBusy(null);
    if (!result.ok) return;
    const data = await result.json();
    setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, collaborationStatus: data.status } : notification));
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] max-w-3xl px-4 pb-28 pt-7 sm:px-6 sm:pt-10">
      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101014] shadow-[0_24px_70px_-38px_rgba(0,0,0,0.95)]">
        <header className="flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-r from-white/[0.035] to-transparent px-5 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-400/20">
                <BellIcon className="h-[19px] w-[19px]" />
              </span>
              <h1 className="text-xl font-bold tracking-[-0.03em] text-white">Activity</h1>
            </div>
            <p className="mt-2 text-sm text-white/45">The moments your photographs and profile start a conversation.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadActivity();
            }}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-white/45 transition hover:bg-white/[0.06] hover:text-white"
          >
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-7">
            {[0, 1, 2].map((item) => <div key={item} className="h-[74px] animate-pulse rounded-2xl bg-white/[0.045]" />)}
          </div>
        ) : error ? (
          <div className="p-7 text-center">
            <p className="text-sm text-red-200/90">{error}</p>
            <button type="button" onClick={() => { setLoading(true); void loadActivity(); }} className="mt-3 text-sm font-semibold text-red-400 hover:text-red-300">Try again</button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.045] text-white/35">
              <BellIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-white">Your activity will appear here</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">Likes, comments, mentions, collaboration invites, reposts, and new followers will show up as your community finds your work.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.065]">
            {notifications.map((item) => (
              <li key={item.id} className={`transition hover:bg-white/[0.025] ${item.readAt ? "" : "bg-red-500/[0.035]"}`}>
                <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
                  <Link href={`/profile/${item.actor.username}`} className="relative shrink-0" aria-label={`View ${item.actor.username}'s profile`}>
                    <Avatar src={item.actor.avatarUrl} username={item.actor.username} size={42} />
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#101014] bg-red-500 text-white">
                      <ActivityIcon type={item.type} />
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1 text-sm leading-5 text-white/58">
                    <p>
                      <Link href={`/profile/${item.actor.username}`} className="font-semibold text-white transition hover:text-red-300">{item.actor.name || item.actor.username}</Link>{" "}
                      {description(item)} <span className="ml-1 text-xs text-white/30">{relativeTime(item.createdAt)}</span>
                    </p>
                    {item.type === "COMMENT" && item.comment && <p className="mt-1 truncate text-xs text-white/38">“{item.comment.content}”</p>}
                    {item.type === "COLLAB_REQUEST" && item.collaborationStatus === "PENDING" && (
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" disabled={collaborationBusy === item.id} onClick={() => void respondToCollaboration(item, "accept")} className="rounded-lg bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:brightness-110 disabled:opacity-50">
                          Accept
                        </button>
                        <button type="button" disabled={collaborationBusy === item.id} onClick={() => void respondToCollaboration(item, "decline")} className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-white/60 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-50">
                          Decline
                        </button>
                      </div>
                    )}
                    {item.type === "COLLAB_REQUEST" && item.collaborationStatus && item.collaborationStatus !== "PENDING" && <p className="mt-1 text-[10px] font-semibold text-white/35">{item.collaborationStatus === "ACCEPTED" ? "Collaboration accepted" : "Collaboration declined"}</p>}
                  </div>

                  {item.post && (
                    <Link href={`/p/${item.post.id}`} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/[0.055] ring-1 ring-white/10 transition hover:scale-[1.03] hover:ring-red-400/45" aria-label="Open photograph">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.post.imageUrl} alt={item.post.caption || "Photograph"} className="h-full w-full object-cover" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
