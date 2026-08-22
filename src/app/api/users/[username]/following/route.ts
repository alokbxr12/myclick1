import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ username: string }> };

// GET /api/users/:username/following -> users this user follows
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
      where: { followerId: target.id },
      orderBy: { createdAt: "desc" },
      select: {
        following: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } }),
  ]);

  const followingIds = new Set(myFollowing.map((f) => f.followingId));

  const users = follows.map(({ following }) => ({
    ...following,
    isFollowing: followingIds.has(following.id),
    isMe: following.id === currentUserId,
  }));

  return NextResponse.json({ users });
}
