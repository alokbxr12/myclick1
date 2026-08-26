import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfilePostsGrid } from "@/components/ProfilePostsGrid";
import { getPostImages } from "@/lib/post-images";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      posts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          createdAt: true,
          cameraModel: true,
          focalLength: true,
          aperture: true,
          shutterSpeed: true,
          iso: true,
          images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
          _count: { select: { likes: true, comments: true } },
          likes: { where: { userId: currentUserId }, select: { id: true } },
        },
      },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  if (!user) notFound();

  const isMe = user.id === currentUserId;
  const isFollowing = isMe
    ? false
    : (await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } },
      })) !== null;

  const posts = user.posts.map(({ likes, ...post }) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    author: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl, isFollowing },
    images: getPostImages(post),
    likedByMe: likes.length > 0,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader user={user} isMe={isMe} isFollowing={isFollowing} />

      <ProfilePostsGrid posts={posts} />
    </div>
  );
}
