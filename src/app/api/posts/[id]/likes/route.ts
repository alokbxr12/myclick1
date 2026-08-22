import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/:id/likes -> photographers who liked a post
export async function GET(_request: Request, { params }: RouteParams) {
  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json({ users: likes.map(({ user }) => user) });
}
