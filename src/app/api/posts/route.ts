import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";
import { deleteUploadedImage } from "@/lib/upload";
import { getImageUploadError, MAX_IMAGES_PER_POST, MAX_POST_IMAGE_BYTES } from "@/lib/image-upload-constraints";
import { getPostImages } from "@/lib/post-images";

const POST_SELECT = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  cameraModel: true,
  lensModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

// Reads an optional short text field from form data, trims it, and enforces a max length.
function readOptionalField(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

// GET /api/posts -> feed: original posts and reposts from the current user and
// the people they follow. A repost references its original post instead of
// copying it, so likes, comments, and authorship remain shared.
export async function GET() {
  const session = await auth();
  const userId = session!.user.id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = new Set(following.map((follow) => follow.followingId));
  const authorIds = [userId, ...followingIds];

  const FEED_POST_SELECT = {
    ...POST_SELECT,
    likes: { where: { userId }, select: { id: true } },
    reposts: { where: { userId }, select: { id: true } },
    savedBy: { where: { userId }, select: { id: true } },
  } as const;

  const [originalPosts, repostEvents] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      orderBy: { createdAt: "desc" },
      select: FEED_POST_SELECT,
    }),
    prisma.repost.findMany({
      // A repost is for the reposter's followers, not for the reposter's own feed.
      where: { userId: { in: [...followingIds] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        post: { select: FEED_POST_SELECT },
      },
    }),
  ]);

  const originalItems = originalPosts.map(({ likes, reposts, savedBy, ...post }) => ({
    ...post,
    feedItemId: `post:${post.id}`,
    feedCreatedAt: post.createdAt,
    author: {
      ...post.author,
      isFollowing: followingIds.has(post.author.id),
    },
    images: getPostImages(post),
    likedByMe: likes.length > 0,
    repostedByMe: reposts.length > 0,
    savedByMe: savedBy.length > 0,
    repostedBy: null,
  }));

  const repostItems = repostEvents.map(({ id, createdAt, user, post }) => {
    const { likes, reposts, savedBy, ...originalPost } = post;
    return {
      ...originalPost,
      feedItemId: `repost:${id}`,
      feedCreatedAt: createdAt,
      author: {
        ...originalPost.author,
        isFollowing: followingIds.has(originalPost.author.id),
      },
      images: getPostImages(originalPost),
      likedByMe: likes.length > 0,
      repostedByMe: reposts.length > 0,
      savedByMe: savedBy.length > 0,
      repostedBy: user,
    };
  });

  const posts = [...originalItems, ...repostItems]
    .sort((first, second) => (
      second.feedCreatedAt.getTime() - first.feedCreatedAt.getTime()
      || first.feedItemId.localeCompare(second.feedItemId)
    ));

  return NextResponse.json({ posts });
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
  const images = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const legacyImage = formData.get("image");
  const files = images.length > 0
    ? images
    : legacyImage instanceof File && legacyImage.size > 0
      ? [legacyImage]
      : [];
  const caption = formData.get("caption");

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
  }
  if (files.length > MAX_IMAGES_PER_POST) {
    return NextResponse.json({ error: `You can add up to ${MAX_IMAGES_PER_POST} photos in one post` }, { status: 400 });
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_POST_IMAGE_BYTES) {
    return NextResponse.json({ error: "Photos in one post must be 4 MB or smaller in total" }, { status: 400 });
  }
  for (const file of files) {
    const validationError = getImageUploadError(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  }
  if (caption !== null && typeof caption !== "string") {
    return NextResponse.json({ error: "Invalid caption" }, { status: 400 });
  }
  if (typeof caption === "string" && caption.length > 2000) {
    return NextResponse.json({ error: "Caption must be at most 2000 characters" }, { status: 400 });
  }

  const imageUrls: string[] = [];
  try {
    for (const file of files) {
      imageUrls.push(await saveUploadedImage(file));
    }
  } catch (err) {
    await Promise.all(imageUrls.map((imageUrl) => deleteUploadedImage(imageUrl)));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload image" },
      { status: 400 }
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        imageUrl: imageUrls[0],
        images: { create: imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) },
        caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
        cameraModel: readOptionalField(formData, "cameraModel", 60),
        lensModel: readOptionalField(formData, "lensModel", 120),
        focalLength: readOptionalField(formData, "focalLength", 20),
        aperture: readOptionalField(formData, "aperture", 20),
        shutterSpeed: readOptionalField(formData, "shutterSpeed", 20),
        iso: readOptionalField(formData, "iso", 20),
      },
      select: POST_SELECT,
    });

    return NextResponse.json({
      post: {
        ...post,
        images: getPostImages(post),
        author: { ...post.author, isFollowing: false },
        likedByMe: false,
        savedByMe: false,
      },
    }, { status: 201 });
  } catch {
    await Promise.all(imageUrls.map((imageUrl) => deleteUploadedImage(imageUrl)));
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
