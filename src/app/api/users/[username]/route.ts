import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPostImages } from "@/lib/post-images";

type RouteParams = { params: Promise<{ username: string }> };

// GET /api/users/:username -> profile info, posts, follow counts
export async function GET(_request: Request, { params }: RouteParams) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      posts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          caption: true,
          imageUrl: true,
          createdAt: true,
          images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isFollowing =
    user.id !== currentUserId &&
    (await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
    })) !== null;

  return NextResponse.json({
    user: {
      ...user,
      posts: user.posts.map((post) => ({ ...post, images: getPostImages(post) })),
      isFollowing,
      isMe: user.id === currentUserId,
    },
  });
}
