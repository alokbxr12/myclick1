import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/:id/comments -> list comments for a post
export async function GET(_request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true } },
      likes: { where: { userId }, select: { id: true } },
    },
  });

  return NextResponse.json({
    comments: comments.map(({ likes, ...comment }) => ({
      ...comment,
      likedByMe: likes.length > 0,
    })),
  });
}

// POST /api/posts/:id/comments -> add a comment
export async function POST(request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: "Comment must be at most 1000 characters" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { content, userId, postId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true } },
    },
  });

  return NextResponse.json({ comment: { ...comment, likedByMe: false } }, { status: 201 });
}
