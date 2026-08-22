import { prisma } from "@/lib/prisma";
import { getImageUploadError } from "@/lib/image-upload-constraints";

export async function saveUploadedImage(file: File): Promise<string> {
  const validationError = getImageUploadError(file);
  if (validationError) throw new Error(validationError);

  const media = await prisma.media.create({
    data: {
      mimeType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
    },
    select: { id: true },
  });

  return `/api/media/${media.id}`;
}

export async function deleteUploadedImage(imageUrl: string): Promise<void> {
  const match = imageUrl.match(/^\/api\/media\/([^/?#]+)$/);
  if (!match) return;
  await prisma.media.deleteMany({ where: { id: match[1] } });
}
