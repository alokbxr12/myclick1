type StoredImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

type PostWithImages = {
  id: string;
  imageUrl: string;
  images: StoredImage[];
};

// Posts created before galleries retain imageUrl as their cover image. This
// fallback keeps them renderable even if a deployment is partway through the
// data migration.
export function getPostImages(post: PostWithImages): StoredImage[] {
  return post.images.length > 0
    ? post.images
    : [{ id: `legacy-${post.id}`, imageUrl: post.imageUrl, sortOrder: 0 }];
}
