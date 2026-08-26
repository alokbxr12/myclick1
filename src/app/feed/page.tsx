"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { PhotographyTip } from "@/components/PhotographyTip";
import { BrandMark } from "@/components/BrandMark";
import { FollowButton } from "@/components/FollowButton";
import { PeopleSuggestions, type SuggestedPerson } from "@/components/PeopleSuggestions";
import { PlusSquareIcon, PolaroidCameraIcon, SearchIcon } from "@/components/Icons";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { Post } from "@/types/post";

type InspirationPost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  author: { id: string; username: string; name: string | null; isFollowing: boolean };
  _count: { likes: number; comments: number };
};

type FeaturedPost = {
  id: string;
  imageUrl: string;
  caption: string | null;
  images: { id: string; imageUrl: string; sortOrder: number }[];
  rank: number;
  likesAtSelection: number;
  author: { id: string; username: string; name: string | null; avatarUrl: string | null; isFollowing: boolean; isOwn: boolean };
  _count: { likes: number; comments: number };
};

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPerson[]>([]);
  const [inspirationPosts, setInspirationPosts] = useState<InspirationPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
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

    fetch("/api/discover")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setSuggestedPeople(data.suggestedPeople ?? []);
        setInspirationPosts(data.inspirationPosts ?? []);
        setFeaturedPosts(data.featuredPhotos ?? []);
      })
      .catch(() => {});
  }, []);

  function handleDeleted(id: string) {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }

  return (
    <div className="app-feed-bg relative min-h-[calc(100vh-72px)] overflow-hidden pb-24 md:pb-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-red-950/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-80 h-72 w-72 rounded-full bg-orange-500/[0.035] blur-3xl" />

      <div className="relative mx-auto grid max-w-[1180px] items-start gap-8 px-4 py-7 sm:px-6 sm:py-10 xl:grid-cols-[minmax(0,760px)_320px] xl:gap-12">
        <main className="min-w-0">
          <header className="feed-hero mb-8 overflow-hidden rounded-[2rem] border border-white/[0.08] px-5 py-6 shadow-[0_28px_90px_-52px_rgba(0,0,0,0.98)] sm:mb-10 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-8 -top-10 h-52 w-52 rounded-full border border-white/[0.075]" />
            <div className="pointer-events-none absolute right-10 top-8 h-28 w-28 rounded-full border border-red-300/[0.12]" />
            <div className="pointer-events-none absolute -right-8 bottom-0 h-32 w-80 bg-gradient-to-l from-red-500/[0.09] to-transparent blur-2xl" />

            <div className="relative flex items-end justify-between gap-5">
              <div className="max-w-xl">
                <div className="feed-hero-kicker mb-4 flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff7b6f] shadow-[0_0_14px_rgba(255,123,111,0.9)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/90">Your circle</p>
                </div>
                <h1 className="feed-hero-title text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[2.75rem]">
                  <span className="block">Photographs worth</span>
                  <span className="feed-title-shimmer block">pausing for.</span>
                </h1>
                <p className="feed-hero-copy mt-4 max-w-md text-sm leading-6 text-white/52 sm:text-[15px]">
                  Fresh work, thoughtful exchanges, and the stories behind every frame.
                </p>
                <div className="feed-hero-actions mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/upload"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_30px_-16px_rgba(241,91,101,0.95)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-16px_rgba(241,91,101,0.9)]"
                  >
                    <PlusSquareIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
                    Share a frame
                  </Link>
                  <span className="text-[11px] text-white/34">Make the ordinary worth looking at twice.</span>
                </div>
              </div>

              <div className="feed-hero-mark relative hidden h-36 w-36 shrink-0 items-center justify-center sm:flex" aria-hidden>
                <div className="absolute inset-2 rounded-full border border-white/[0.09]" />
                <div className="absolute inset-5 rounded-full border border-red-300/[0.16]" />
                <div className="absolute inset-0 rounded-full border border-dashed border-white/[0.075]" />
                <BrandMark className="relative h-20 w-24 drop-shadow-[0_12px_26px_rgba(0,0,0,0.55)]" />
              </div>
            </div>
          </header>

          {featuredPosts.length > 0 && <FeaturedPhotos posts={featuredPosts} />}

          {loading && <FeedSkeleton />}

          {!loading && error && (
            <div className="rounded-3xl border border-red-500/15 bg-red-500/[0.055] px-6 py-10 text-center">
              <p className="text-sm font-semibold text-red-200">The feed couldn’t be loaded.</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-xs text-white/50 underline underline-offset-4 hover:text-white">
                Try again
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && <EmptyFeed inspirationPosts={inspirationPosts} />}

          {!loading && !error && posts.length > 0 && (
            <div className="flex flex-col gap-8 sm:gap-10">
              {posts.map((post, index) => (
                <div className="contents" key={post.feedItemId ?? post.id}>
                  <PostCard post={post} onDeleted={handleDeleted} showOwnerMenu />
                  {index === 1 && posts.length > 2 && <PhotographyTip />}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && posts.length > 0 && <CommunityInspiration inspirationPosts={inspirationPosts} />}

          {!loading && !error && suggestedPeople.length > 0 && (
            <PeopleSuggestions people={suggestedPeople} className="mt-8 xl:hidden" />
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

          <PeopleSuggestions people={suggestedPeople} />

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

function EmptyFeed({ inspirationPosts }: { inspirationPosts: InspirationPost[] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[#101014]/88 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)]">
      <div className="relative px-6 pb-8 pt-10 text-center sm:px-12 sm:pt-12">
        <div className="absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-800/15 blur-3xl" />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
          <PolaroidCameraIcon className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="relative mt-6 text-xl font-semibold tracking-[-0.025em] text-white">Your feed is waiting for its first frame.</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-white/42">
          Start with a photograph you care about, or spend a moment with what the community is making.
        </p>
        <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/upload" className="rounded-xl bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-5 py-3 text-xs font-bold text-white shadow-[0_14px_28px_-16px_rgba(241,91,101,0.95)] transition hover:-translate-y-0.5">
            Publish a photograph
          </Link>
          <Link href="/search" className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white">
            Discover photographers
          </Link>
        </div>
      </div>

      <CommunityInspiration inspirationPosts={inspirationPosts} embedded />
    </div>
  );
}

function CommunityInspiration({ inspirationPosts, embedded = false }: { inspirationPosts: InspirationPost[]; embedded?: boolean }) {
  if (inspirationPosts.length === 0) return null;

  return (
    <section
      aria-labelledby="community-inspiration-title"
      className={embedded
        ? "border-t border-white/[0.065] px-4 pb-5 pt-5 sm:px-5 sm:pb-6"
        : "overflow-hidden rounded-[2rem] border border-white/[0.075] bg-[#101014]/88 px-4 pb-5 pt-5 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)] sm:px-5 sm:pb-6"}
    >
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Made by the community</p>
          <h3 id="community-inspiration-title" className="mt-1 text-base font-semibold tracking-[-0.025em] text-white">A little inspiration to begin</h3>
        </div>
        <span className="hidden text-[11px] text-white/34 sm:block">Open a frame to see the full story</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {inspirationPosts.map((post) => (
          <div key={post.id} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/[0.04]">
            <Link href={`/p/${post.id}`} aria-label={`Open photograph by ${post.author.username}`} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt={post.caption ?? `Photograph by ${post.author.username}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>
            <div className="absolute right-2 top-2 z-10">
              <FollowButton compact initialFollowing={post.author.isFollowing} username={post.author.username} />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-3 pb-3 pt-9">
              <Link href={`/profile/${post.author.username}`} className="pointer-events-auto block min-w-0">
                <p className="truncate text-[10px] font-semibold text-white transition hover:text-red-200">@{post.author.username}</p>
              </Link>
              <p className="mt-0.5 text-[9px] text-white/55">{post._count.likes} {post._count.likes === 1 ? "appreciation" : "appreciations"}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedPhotos({ posts }: { posts: FeaturedPost[] }) {
  return (
    <section aria-labelledby="featured-photos-title" className="mb-8 overflow-hidden rounded-[2rem] border border-amber-200/[0.12] bg-[radial-gradient(circle_at_88%_0%,rgba(251,146,60,0.16),transparent_38%),linear-gradient(140deg,rgba(120,53,15,0.2),rgba(16,16,20,0.94)_48%,rgba(17,17,21,0.98))] px-4 pb-4 pt-5 shadow-[0_28px_80px_-54px_rgba(251,146,60,0.82)] sm:mb-10 sm:px-5 sm:pb-5 sm:pt-6">
      <div className="mb-4 px-1 sm:mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/85">Featured photos</p>
          <h2 id="featured-photos-title" className="mt-1 whitespace-nowrap text-[17px] font-semibold leading-6 tracking-[-0.035em] text-white sm:text-lg">Yesterday&apos;s most-loved frames</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {posts.map((post) => (
          <article key={post.id} className="featured-photo-card group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_18px_44px_-30px_rgba(0,0,0,0.95)]">
            <Link href={`/p/${post.id}`} aria-label={`Open featured photograph by ${post.author.username}`} className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.imageUrl} alt={post.caption ?? `Featured photograph by ${post.author.username}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </Link>

            <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-lg border border-amber-100/20 bg-black/45 px-1.5 text-[10px] font-bold text-amber-100 shadow-lg backdrop-blur-md">
              {String(post.rank).padStart(2, "0")}
            </span>

            {!post.author.isOwn && (
              <div className="absolute right-2 top-2 z-10">
                <FollowButton compact initialFollowing={post.author.isFollowing} username={post.author.username} />
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/42 to-transparent px-2.5 pb-2.5 pt-10 sm:px-3 sm:pb-3">
              <Link href={`/profile/${post.author.username}`} className="pointer-events-auto block min-w-0">
                <p className="truncate text-[10px] font-semibold text-white transition hover:text-amber-100 sm:text-[11px]">@{post.author.username}</p>
              </Link>
              <p className="mt-0.5 truncate text-[9px] text-amber-100/70 sm:text-[10px]">
                {post.likesAtSelection} {post.likesAtSelection === 1 ? "like" : "likes"} yesterday
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
