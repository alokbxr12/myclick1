-- CreateEnum
CREATE TYPE "CollaborationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MENTION';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLLAB_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COLLAB_ACCEPTED';

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_collaborations" (
    "id" TEXT NOT NULL,
    "status" "CollaborationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "postId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,

    CONSTRAINT "post_collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_postId_userId_key" ON "post_tags"("postId", "userId");
CREATE INDEX "post_tags_userId_idx" ON "post_tags"("userId");
CREATE UNIQUE INDEX "post_collaborations_postId_collaboratorId_key" ON "post_collaborations"("postId", "collaboratorId");
CREATE INDEX "post_collaborations_collaboratorId_status_idx" ON "post_collaborations"("collaboratorId", "status");

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_collaborations" ADD CONSTRAINT "post_collaborations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_collaborations" ADD CONSTRAINT "post_collaborations_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
