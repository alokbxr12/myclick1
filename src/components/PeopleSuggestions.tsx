"use client";

import Link from "next/link";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { VerifiedBadge } from "./VerifiedBadge";

export type SuggestedPerson = {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
  _count: { posts: number; followers: number };
};

export function PeopleSuggestions({ people, className = "" }: { people: SuggestedPerson[]; className?: string }) {
  if (people.length === 0) return null;

  return (
    <section aria-labelledby="people-suggestions-title" className={`overflow-hidden rounded-3xl border border-white/[0.075] bg-[#101014]/82 shadow-[0_20px_56px_-42px_rgba(0,0,0,0.98)] ${className}`}>
      <div className="flex items-end justify-between gap-3 border-b border-white/[0.06] px-5 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">From the community</p>
          <h2 id="people-suggestions-title" className="mt-1 text-base font-semibold tracking-[-0.025em] text-white">Photographers to follow</h2>
        </div>
        <Link href="/search" className="text-[11px] font-semibold text-white/42 transition hover:text-red-300">Discover</Link>
      </div>

      <div className="divide-y divide-white/[0.055]">
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-3 px-5 py-3.5">
            <Link href={`/profile/${person.username}`} className="shrink-0 rounded-full transition hover:scale-[1.03]">
              <Avatar src={person.avatarUrl} username={person.username} size={40} />
            </Link>
            <Link href={`/profile/${person.username}`} className="min-w-0 flex-1">
              <p className="flex min-w-0 items-center gap-1.5 truncate text-xs font-semibold text-white transition hover:text-red-300">
                <span className="truncate">{person.name ?? person.username}</span>
                <VerifiedBadge className="h-3 w-3 shrink-0" />
              </p>
              <p className="mt-0.5 truncate text-[11px] text-white/35">@{person.username} · {person._count.posts} {person._count.posts === 1 ? "frame" : "frames"}</p>
            </Link>
            <FollowButton compact initialFollowing={person.isFollowing} username={person.username} />
          </div>
        ))}
      </div>
    </section>
  );
}
