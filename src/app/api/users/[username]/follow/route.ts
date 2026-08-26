import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ username: string }> };

// POST /api/users/:username/follow -> follow a user
export async function POST(_request: Request, { params }: RouteParams) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.id === currentUserId) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: target.id } },
    select: { id: true },
  });

  if (!existingFollow) {
    await prisma.$transaction(async (tx) => {
      await tx.follow.create({ data: { followerId: currentUserId, followingId: target.id } });
      await tx.notification.create({
        data: { type: "FOLLOW", actorId: currentUserId, recipientId: target.id },
      });
    });
  }

  return NextResponse.json({ following: true });
}

// DELETE /api/users/:username/follow -> unfollow a user
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.follow.deleteMany({
    where: { followerId: currentUserId, followingId: target.id },
  });

  return NextResponse.json({ following: false });
}
