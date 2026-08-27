import Link from "next/link";
import { auth } from "@/auth";
import { BookmarkIcon, SearchIcon } from "@/components/Icons";
import { SavedFramesFeed } from "@/components/SavedFramesFeed";
import { getPostImages } from "@/lib/post-images";
import { prisma } from "@/lib/prisma";

const POST_SELECT = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  cameraModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

export default async function SavedFramesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [savedEntries, following] = await Promise.all([
    prisma.savedPost.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        post: {
          select: {
            ...POST_SELECT,
            likes: { where: { userId }, select: { id: true } },
            reposts: { where: { userId }, select: { id: true } },
          },
        },
      },
    }),
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
  ]);

  const followingIds = new Set(following.map((relationship) => relationship.followingId));
  const posts = savedEntries.map(({ post }) => {
    const { likes, reposts, ...rest } = post;
    return {
      ...rest,
      createdAt: rest.createdAt.toISOString(),
      author: { ...rest.author, isFollowing: followingIds.has(rest.author.id) },
      images: getPostImages(rest),
      likedByMe: likes.length > 0,
      repostedByMe: reposts.length > 0,
      savedByMe: true,
    };
  });

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] max-w-2xl px-4 pb-28 pt-7 sm:px-6 sm:pt-10 md:pb-12">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[radial-gradient(circle_at_88%_0%,rgba(239,68,68,0.18),transparent_42%),linear-gradient(145deg,rgba(27,18,24,0.96),rgba(16,16,20,0.94)_58%)] px-5 py-6 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)] sm:mb-10 sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-300/15 bg-red-500/10 text-red-300">
            <BookmarkIcon filled className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-300/90">Your visual library</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">Saved frames</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/48">A private collection of photographs worth returning to when you need a fresh perspective.</p>
          </div>
        </div>
      </header>

      {posts.length === 0 && (
        <Link href="/search" className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white">
          <SearchIcon className="h-4 w-4" />
          Discover photographs to save
        </Link>
      )}

      <SavedFramesFeed initialPosts={posts} />
    </main>
  );
}
