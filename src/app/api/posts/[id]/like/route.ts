import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/posts/:id/like -> toggle like on a post
export async function POST(_request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });
  }

  const likeCount = await prisma.like.count({ where: { postId } });

  return NextResponse.json({ liked: !existing, likeCount });
}
