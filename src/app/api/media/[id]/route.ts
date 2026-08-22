import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const media = await prisma.media.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });

  if (!media) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(new Uint8Array(media.data), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(media.data.byteLength),
      "Content-Type": media.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
