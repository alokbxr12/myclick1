import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractMentionedUsernames } from "@/lib/mentions";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/posts/:id/comments -> list comments for a post
export async function GET(_request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const [comments, following] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId }, select: { id: true } },
      },
    }),
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
  ]);

  const followingIds = new Set(following.map((follow) => follow.followingId));

  return NextResponse.json({
    comments: comments.map(({ likes, ...comment }) => ({
      ...comment,
      user: { ...comment.user, isFollowing: followingIds.has(comment.user.id) },
      likedByMe: likes.length > 0,
    })),
  });
}

// POST /api/posts/:id/comments -> add a comment
export async function POST(request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true } });
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

  const mentionedUsernames = extractMentionedUsernames(content);
  const mentionedUsers = mentionedUsernames.length > 0
    ? await prisma.user.findMany({
        where: { id: { not: userId }, username: { in: mentionedUsernames, mode: "insensitive" } },
        select: { id: true },
      })
    : [];

  const comment = await prisma.$transaction(async (tx) => {
    const createdComment = await tx.comment.create({
      data: { content, userId, postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true } },
      },
    });

    if (post.authorId !== userId) {
      await tx.notification.create({
        data: {
          type: "COMMENT",
          actorId: userId,
          recipientId: post.authorId,
          postId,
          commentId: createdComment.id,
        },
      });
    }

    const mentionRecipients = mentionedUsers.filter((user) => user.id !== post.authorId);
    if (mentionRecipients.length > 0) {
      await tx.notification.createMany({
        data: mentionRecipients.map((user) => ({
          type: "MENTION" as const,
          actorId: userId,
          recipientId: user.id,
          postId,
          commentId: createdComment.id,
        })),
      });
    }

    return createdComment;
  });

  return NextResponse.json({ comment: { ...comment, user: { ...comment.user, isFollowing: false }, likedByMe: false } }, { status: 201 });
}
