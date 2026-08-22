import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage } from "@/lib/upload";

const POST_SELECT = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  authorId: true,
  cameraModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

// Reads an optional short text field from a JSON body, trims it, and enforces a max length.
function readOptionalField(value: unknown, maxLength: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value !== null && typeof value !== "string") return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      ...POST_SELECT,
      likes: { where: { userId: session!.user.id }, select: { id: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { likes, ...rest } = post;
  return NextResponse.json({ post: { ...rest, likedByMe: likes.length > 0 } });
}

// PATCH /api/posts/:id -> edit caption (owner only)
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.authorId !== userId) {
    return NextResponse.json({ error: "You can only edit your own posts" }, { status: 403 });
  }

  const body = await request.json();
  const caption = body?.caption;
  if (caption !== null && typeof caption !== "string") {
    return NextResponse.json({ error: "Invalid caption" }, { status: 400 });
  }
  if (typeof caption === "string" && caption.length > 2000) {
    return NextResponse.json({ error: "Caption must be at most 2000 characters" }, { status: 400 });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      cameraModel: readOptionalField(body?.cameraModel, 60),
      focalLength: readOptionalField(body?.focalLength, 20),
      aperture: readOptionalField(body?.aperture, 20),
      shutterSpeed: readOptionalField(body?.shutterSpeed, 20),
      iso: readOptionalField(body?.iso, 20),
    },
    select: POST_SELECT,
  });

  return NextResponse.json({ post });
}

// DELETE /api/posts/:id -> delete a post (owner only)
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true, imageUrl: true } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (existing.authorId !== userId) {
    return NextResponse.json({ error: "You can only delete your own posts" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });
  await deleteUploadedImage(existing.imageUrl);

  return NextResponse.json({ success: true });
}
