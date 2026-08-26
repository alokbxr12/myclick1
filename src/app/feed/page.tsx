"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { PhotographyTip } from "@/components/PhotographyTip";
import { PlusSquareIcon, PolaroidCameraIcon, SearchIcon } from "@/components/Icons";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { Post } from "@/types/post";

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Feed request failed");
        return res.json();
      })
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleDeleted(id: string) {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }

  return (
    <div className="app-feed-bg relative min-h-[calc(100vh-72px)] overflow-hidden pb-24 md:pb-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-red-950/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1180px] items-start gap-8 px-4 py-7 sm:px-6 sm:py-10 xl:grid-cols-[minmax(0,760px)_320px] xl:gap-12">
        <main className="min-w-0">
          <header className="mb-7 flex items-end justify-between gap-5 px-1 sm:mb-9">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
                Your circle
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-[2rem]">
                Photographs worth pausing for.
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/42">
                Fresh work from you and the photographers you follow.
              </p>
            </div>

            <Link
              href="/upload"
              className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-xs font-semibold text-white/72 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-white sm:flex xl:hidden"
            >
              <PlusSquareIcon className="h-4 w-4 text-red-400" />
              New photograph
            </Link>
          </header>

          {loading && <FeedSkeleton />}

          {!loading && error && (
            <div className="rounded-3xl border border-red-500/15 bg-red-500/[0.055] px-6 py-10 text-center">
              <p className="text-sm font-semibold text-red-200">The feed couldn’t be loaded.</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-xs text-white/50 underline underline-offset-4 hover:text-white">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && <EmptyFeed />}

          {!loading && !error && posts.length > 0 && (
            <div className="flex flex-col gap-8 sm:gap-10">
              {posts.map((post, index) => (
                <div className="contents" key={post.id}>
                  <PostCard post={post} onDeleted={handleDeleted} showOwnerMenu />
                  {index === 1 && posts.length > 2 && <PhotographyTip />}
                </div>
              ))}
            </div>
          )}
        </main>

        <aside className="sticky top-[104px] hidden flex-col gap-4 xl:flex" aria-label="Photographer shortcuts">
          <div className="rounded-3xl border border-white/[0.075] bg-white/[0.028] p-5 shadow-[0_22px_60px_-36px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3">
              <Avatar src={session?.user.avatarUrl} username={session?.user.username ?? "photographer"} size={46} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{session?.user.name ?? session?.user.username}</p>
                <p className="flex min-w-0 items-center gap-1 text-xs text-white/35">
                  <span className="truncate">@{session?.user.username}</span>
                  <VerifiedBadge className="h-3 w-3" />
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href={`/profile/${session?.user.username}`} className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5 text-center text-[11px] font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white">
                View profile
              </Link>
              <Link href="/upload" className="rounded-xl bg-red-600 px-3 py-2.5 text-center text-[11px] font-bold text-white transition hover:bg-red-500">
                Publish
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/[0.075] bg-[#111115]">
            <div className="relative h-32 overflow-hidden bg-[radial-gradient(circle_at_20%_25%,rgba(239,68,68,0.3),transparent_35%),linear-gradient(145deg,#241315,#0e1014_58%,#17151b)]">
              <div className="absolute -right-5 -top-8 h-32 w-32 rounded-full border border-white/[0.06]" />
              <div className="absolute -right-1 -top-3 h-20 w-20 rounded-full border border-white/[0.08]" />
              <div className="absolute bottom-4 left-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/25">
                <PolaroidCameraIcon className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Weekly frame</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white">Reflections</h2>
              <p className="mt-2 text-xs leading-5 text-white/42">
                Find a reflection that changes the story—not just the symmetry. Share what caught your eye.
              </p>
              <Link href="/upload" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/65 transition hover:text-white">
                Take the prompt <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <Link href="/search" className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-3.5 text-xs text-white/42 transition hover:border-white/12 hover:bg-white/[0.025] hover:text-white/72">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.045] group-hover:bg-white/[0.08]">
              <SearchIcon className="h-4 w-4" />
            </span>
            Discover another perspective
          </Link>

          <p className="px-2 text-[10px] leading-4 text-white/20">
            MyClick · Photograph first, metrics second.
          </p>
        </aside>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-label="Loading feed">
      {[0, 1].map((item) => (
        <div key={item} className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025]">
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.07]" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-full bg-white/[0.07]" />
              <div className="h-2 w-20 animate-pulse rounded-full bg-white/[0.04]" />
            </div>
          </div>
          <div className="aspect-[4/3] animate-pulse bg-white/[0.045]" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.075] bg-white/[0.025] px-6 py-16 text-center sm:px-12 sm:py-20">
      <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-800/15 blur-3xl" />
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
        <PolaroidCameraIcon className="h-7 w-7 text-red-400" />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-white">Your feed is a blank contact sheet.</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/42">
        Publish your first photograph or discover photographers whose work you want to follow.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/upload" className="rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-red-500">
          Publish a photograph
        </Link>
        <Link href="/search" className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white">
          Discover photographers
        </Link>
      </div>
    </div>
  );
}
