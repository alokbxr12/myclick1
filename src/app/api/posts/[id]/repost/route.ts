import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/posts/:id/repost -> toggle a repost of the original post.
export async function POST(_request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.authorId === userId) {
    return NextResponse.json({ error: "You cannot repost your own photograph" }, { status: 400 });
  }

  const existing = await prisma.repost.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.repost.delete({ where: { id: existing.id } });
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.repost.create({ data: { userId, postId } });
      await tx.notification.create({
        data: { type: "REPOST", actorId: userId, recipientId: post.authorId, postId },
      });
    });
  }

  return NextResponse.json({ reposted: !existing });
}
