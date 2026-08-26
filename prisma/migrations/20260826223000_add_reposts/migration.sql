-- A repost points to the original post; it never duplicates the photograph,
-- likes, comments, or ownership data.
CREATE TABLE "reposts" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "reposts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reposts_userId_postId_key" ON "reposts"("userId", "postId");
CREATE INDEX "reposts_userId_createdAt_idx" ON "reposts"("userId", "createdAt");
CREATE INDEX "reposts_postId_idx" ON "reposts"("postId");

ALTER TABLE "reposts"
  ADD CONSTRAINT "reposts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reposts"
  ADD CONSTRAINT "reposts_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
