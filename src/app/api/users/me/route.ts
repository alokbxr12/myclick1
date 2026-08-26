import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

const BIO_MAX_LENGTH = 160;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

// PATCH /api/users/me -> Update a username, bio, and/or profile picture.
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatarUrl: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const deleteAvatar = formData.get("deleteAvatar");
  const avatarFile = formData.get("avatar");
  const bio = formData.get("bio");
  const username = formData.get("username");
  const hasBioUpdate = bio !== null;
  const hasUsernameUpdate = username !== null;

  if (hasBioUpdate && typeof bio !== "string") {
    return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
  }
  if (hasUsernameUpdate && typeof username !== "string") {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }
  if (avatarFile !== null && !(avatarFile instanceof File)) {
    return NextResponse.json({ error: "Invalid profile photo" }, { status: 400 });
  }
  if (deleteAvatar === "true" && avatarFile instanceof File && avatarFile.size > 0) {
    return NextResponse.json({ error: "Choose a new photo or remove the current one, not both" }, { status: 400 });
  }

  const normalizedBio = typeof bio === "string" ? bio.trim() : undefined;
  if (normalizedBio && normalizedBio.length > BIO_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Bio must be at most ${BIO_MAX_LENGTH} characters` },
      { status: 400 }
    );
  }

  const normalizedUsername = typeof username === "string" ? username.trim() : undefined;
  if (normalizedUsername) {
    if (normalizedUsername.length < USERNAME_MIN_LENGTH || normalizedUsername.length > USERNAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Username must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers and underscores" },
        { status: 400 }
      );
    }
  } else if (hasUsernameUpdate) {
    return NextResponse.json({ error: "Username cannot be empty" }, { status: 400 });
  }

  let newAvatarUrl: string | null | undefined;
  if (deleteAvatar === "true") {
    newAvatarUrl = null;
  } else if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      newAvatarUrl = await saveUploadedImage(avatarFile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to upload photo" },
        { status: 400 }
      );
    }
  }

  if (!hasBioUpdate && !hasUsernameUpdate && newAvatarUrl === undefined) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(hasUsernameUpdate ? { username: normalizedUsername } : {}),
        ...(hasBioUpdate ? { bio: normalizedBio || null } : {}),
        ...(newAvatarUrl !== undefined ? { avatarUrl: newAvatarUrl } : {}),
      },
      select: { id: true, username: true, bio: true, avatarUrl: true },
    });

    if (newAvatarUrl !== undefined && currentUser.avatarUrl && currentUser.avatarUrl !== newAvatarUrl) {
      await deleteUploadedImage(currentUser.avatarUrl);
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (typeof newAvatarUrl === "string") await deleteUploadedImage(newAvatarUrl);
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Couldn’t update your profile" }, { status: 500 });
  }
}

// DELETE /api/users/me -> Delete user account
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await request.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason.trim() : null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      avatarUrl: true,
      posts: { select: { imageUrl: true, images: { select: { imageUrl: true } } } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Clean up the user's avatar from local PostgreSQL storage.
  if (user.avatarUrl) {
    await deleteUploadedImage(user.avatarUrl);
  }

  // Clean up the user's post images from local PostgreSQL storage.
  const postImageUrls = user.posts.flatMap((post) => [post.imageUrl, ...post.images.map((image) => image.imageUrl)]);
  await Promise.all([...new Set(postImageUrls)].map((imageUrl) => deleteUploadedImage(imageUrl)));

  // Delete user record from database (cascade deletes posts, comments, likes, follows, reset tokens)
  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({
    success: true,
    message: "Account deleted successfully",
    reason: reason ?? undefined,
  });
}
