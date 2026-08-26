import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/activity -> recent interactions directed at the signed-in member.
export async function GET(request: Request) {
  const session = await auth();
  const userId = session!.user.id;
  const summaryOnly = new URL(request.url).searchParams.get("summary") === "1";

  const unreadCount = await prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  });

  if (summaryOnly) {
    return NextResponse.json({ unreadCount });
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      type: true,
      createdAt: true,
      readAt: true,
      actor: { select: { id: true, username: true, name: true, avatarUrl: true } },
      post: { select: { id: true, imageUrl: true, caption: true } },
      comment: { select: { content: true } },
    },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/activity -> mark the current member's activity as seen.
export async function PATCH() {
  const session = await auth();
  const userId = session!.user.id;

  await prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ unreadCount: 0 });
}
