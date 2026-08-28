import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/posts/:id/collaboration -> accept or decline the current member's invitation.
export async function POST(request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const body = await request.json().catch(() => ({}));
  const response = body?.response;
  if (response !== "accept" && response !== "decline") {
    return NextResponse.json({ error: "Choose whether to accept or decline the collaboration" }, { status: 400 });
  }

  const collaboration = await prisma.postCollaboration.findUnique({
    where: { postId_collaboratorId: { postId, collaboratorId: userId } },
    select: { id: true, status: true, post: { select: { authorId: true } } },
  });
  if (!collaboration) return NextResponse.json({ error: "Collaboration request not found" }, { status: 404 });
  if (collaboration.status !== "PENDING") return NextResponse.json({ error: "This collaboration request has already been answered" }, { status: 409 });

  const status = response === "accept" ? "ACCEPTED" : "DECLINED";
  await prisma.$transaction(async (tx) => {
    await tx.postCollaboration.update({ where: { id: collaboration.id }, data: { status, respondedAt: new Date() } });
    if (status === "ACCEPTED" && collaboration.post.authorId !== userId) {
      await tx.notification.create({
        data: { type: "COLLAB_ACCEPTED", actorId: userId, recipientId: collaboration.post.authorId, postId },
      });
    }
  });

  return NextResponse.json({ status });
}
