import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [following, people, photoCandidates] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    }),
    prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        _count: { select: { posts: true, followers: true } },
      },
      take: 40,
    }),
    prisma.post.findMany({
      where: { authorId: { not: currentUserId } },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        author: { select: { id: true, username: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
  ]);

  const followingIds = new Set(following.map((relationship) => relationship.followingId));

  const suggestedPeople = people
    .map((person) => ({ ...person, isFollowing: followingIds.has(person.id) }))
    .sort((first, second) => {
      if (first.isFollowing !== second.isFollowing) return Number(first.isFollowing) - Number(second.isFollowing);

      const firstScore = first._count.posts * 2 + first._count.followers;
      const secondScore = second._count.posts * 2 + second._count.followers;
      return secondScore - firstScore || first.username.localeCompare(second.username);
    })
    .slice(0, 3);

  const inspirationPosts = photoCandidates
    .map((post) => ({
      ...post,
      author: { ...post.author, isFollowing: followingIds.has(post.author.id) },
    }))
    .sort((first, second) => {
      const firstScore = first._count.likes * 3 + first._count.comments;
      const secondScore = second._count.likes * 3 + second._count.comments;
      return secondScore - firstScore;
    })
    .slice(0, 3);

  return NextResponse.json({ suggestedPeople, inspirationPosts });
}
