import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string; commentId: string }> };

// POST /api/posts/:id/comments/:commentId/like -> toggle a comment like
export async function POST(_request: Request, { params }: RouteParams) {
  const { id: postId, commentId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
    select: { id: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.commentLike.create({ data: { userId, commentId } });
  }

  const likeCount = await prisma.commentLike.count({ where: { commentId } });

  return NextResponse.json({ liked: !existing, likeCount });
}
