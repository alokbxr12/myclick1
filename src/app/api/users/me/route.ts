import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/upload";

// PATCH /api/users/me -> Update or delete profile picture
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, avatarUrl: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const deleteAvatar = formData.get("deleteAvatar");
  const avatarFile = formData.get("avatar");

  // Remove avatar
  if (deleteAvatar === "true") {
    if (currentUser.avatarUrl) {
      await deleteUploadedImage(currentUser.avatarUrl);
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: { id: true, username: true, avatarUrl: true },
    });
    return NextResponse.json({ user: updated });
  }

  // Upload new avatar
  if (avatarFile instanceof File && avatarFile.size > 0) {
    let newAvatarUrl: string;
    try {
      newAvatarUrl = await saveUploadedImage(avatarFile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to upload photo" },
        { status: 400 }
      );
    }

    if (currentUser.avatarUrl) {
      await deleteUploadedImage(currentUser.avatarUrl);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: newAvatarUrl },
      select: { id: true, username: true, avatarUrl: true },
    });

    return NextResponse.json({ user: updated });
  }

  return NextResponse.json({ error: "No changes provided" }, { status: 400 });
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
      posts: { select: { imageUrl: true } },
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
  for (const post of user.posts) {
    if (post.imageUrl) {
      await deleteUploadedImage(post.imageUrl);
    }
  }

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
