export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Keep uploads below Vercel's 4.5 MB function request/response limit. The
// remaining space covers multipart form fields and headers.
export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_IMAGES_PER_POST = 6;
export const MAX_POST_IMAGE_BYTES = 4 * 1024 * 1024;

export function getImageUploadError(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WEBP or GIF images are allowed";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be 4 MB or smaller";
  }

  return null;
}
