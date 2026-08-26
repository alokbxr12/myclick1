-- Preserve one daily snapshot of the prior day's highest-liked uploads.
-- The snapshot is created when the feed is first requested after midnight.
CREATE TABLE "featured_photo_days" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "sourceStartsAt" TIMESTAMP(3) NOT NULL,
    "sourceEndsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "featured_photo_days_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "featured_photos" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "likesAtSelection" INTEGER NOT NULL,
    "dayId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "featured_photos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "featured_photo_days_dateKey_key" ON "featured_photo_days"("dateKey");
CREATE UNIQUE INDEX "featured_photos_dayId_rank_key" ON "featured_photos"("dayId", "rank");
CREATE UNIQUE INDEX "featured_photos_dayId_postId_key" ON "featured_photos"("dayId", "postId");
CREATE INDEX "featured_photos_postId_idx" ON "featured_photos"("postId");

ALTER TABLE "featured_photos"
  ADD CONSTRAINT "featured_photos_dayId_fkey"
  FOREIGN KEY ("dayId") REFERENCES "featured_photo_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "featured_photos"
  ADD CONSTRAINT "featured_photos_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
