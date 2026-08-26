import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";

const POST_SELECT = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  cameraModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

// Reads an optional short text field from form data, trims it, and enforces a max length.
function readOptionalField(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

// GET /api/posts -> feed: posts from the current user and the people they follow
export async function GET() {
  const session = await auth();
  const userId = session!.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = new Set(following.map((follow) => follow.followingId));
  const authorIds = [userId, ...followingIds];

  const posts = await prisma.post.findMany({
    where: { authorId: { in: authorIds } },
    orderBy: { createdAt: "desc" },
    select: {
      ...POST_SELECT,
      likes: { where: { userId }, select: { id: true } },
    },
  });

  const shaped = posts.map(({ likes, ...post }) => ({
    ...post,
    author: {
      ...post.author,
      isFollowing: followingIds.has(post.author.id),
    },
    likedByMe: likes.length > 0,
  }));

  return NextResponse.json({ posts: shaped });
}

// POST /api/posts -> create a new post (multipart/form-data: image, caption)
export async function POST(request: Request) {
  const session = await auth();
  const userId = session!.user.id;

  // Guard against a stale session referencing a since-deleted account.
  const authorExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!authorExists) {
    return NextResponse.json(
      { error: "Your session has expired. Please sign out and sign in again." },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const caption = formData.get("caption");

  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  }
  if (caption !== null && typeof caption !== "string") {
    return NextResponse.json({ error: "Invalid caption" }, { status: 400 });
  }
  if (typeof caption === "string" && caption.length > 2000) {
    return NextResponse.json({ error: "Caption must be at most 2000 characters" }, { status: 400 });
  }

  let imageUrl: string;
  try {
    imageUrl = await saveUploadedImage(image);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload image" },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      imageUrl,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      cameraModel: readOptionalField(formData, "cameraModel", 60),
      focalLength: readOptionalField(formData, "focalLength", 20),
      aperture: readOptionalField(formData, "aperture", 20),
      shutterSpeed: readOptionalField(formData, "shutterSpeed", 20),
      iso: readOptionalField(formData, "iso", 20),
    },
    select: POST_SELECT,
  });

  return NextResponse.json({ post: { ...post, author: { ...post.author, isFollowing: false }, likedByMe: false } }, { status: 201 });
}
