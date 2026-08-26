import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/search?q=... -> find users by username or name
export async function GET(request: Request) {
  const session = await auth();
  const currentUserId = session!.user.id;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ users: [] });
  }

  const [users, following] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, name: true, avatarUrl: true },
      take: 20,
    }),
    prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } }),
  ]);

  const followingIds = new Set(following.map((follow) => follow.followingId));

  return NextResponse.json({ users: users.map((user) => ({ ...user, isFollowing: followingIds.has(user.id) })) });
}
