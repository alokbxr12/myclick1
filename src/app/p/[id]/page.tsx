import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

const POST_SELECT = {
  id: true,
  caption: true,
  imageUrl: true,
  createdAt: true,
  cameraModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      ...POST_SELECT,
      likes: { where: { userId }, select: { id: true } },
    },
  });

  if (!post) notFound();

  const { likes, ...rest } = post;
  const isFollowing = rest.author.id !== userId && (await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: rest.author.id } },
    select: { followerId: true },
  })) !== null;
  const shaped = {
    ...rest,
    createdAt: rest.createdAt.toISOString(),
    author: { ...rest.author, isFollowing },
    likedByMe: likes.length > 0,
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <PostCard post={shaped} />
    </div>
  );
}
