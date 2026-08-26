-- Support a gallery of ordered images on every post while retaining the
-- existing posts.imageUrl column as the backwards-compatible cover image.
CREATE TABLE "post_images" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "postId" TEXT NOT NULL,

    CONSTRAINT "post_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "post_images_postId_sortOrder_key" ON "post_images"("postId", "sortOrder");
CREATE INDEX "post_images_postId_idx" ON "post_images"("postId");

ALTER TABLE "post_images"
  ADD CONSTRAINT "post_images_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bring every pre-gallery post into the new relation so it has its original
-- image as the first gallery item.
INSERT INTO "post_images" ("id", "imageUrl", "sortOrder", "postId")
SELECT 'legacy_' || "id", "imageUrl", 0, "id"
FROM "posts";
