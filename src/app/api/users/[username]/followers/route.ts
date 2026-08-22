import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ username: string }> };

// GET /api/users/:username/followers -> users who follow this user
export async function GET(_request: Request, { params }: RouteParams) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [follows, myFollowing] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: target.id },
      orderBy: { createdAt: "desc" },
      select: {
        follower: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } }),
  ]);

  const followingIds = new Set(myFollowing.map((f) => f.followingId));

  const users = follows.map(({ follower }) => ({
    ...follower,
    isFollowing: followingIds.has(follower.id),
    isMe: follower.id === currentUserId,
  }));

  return NextResponse.json({ users });
}
