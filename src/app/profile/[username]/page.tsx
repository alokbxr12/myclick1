import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ProfilePostTabs } from "@/components/ProfilePostTabs";
import { getPostImages } from "@/lib/post-images";

const POST_SELECT = {
  id: true,
  imageUrl: true,
  caption: true,
  createdAt: true,
  cameraModel: true,
  focalLength: true,
  aperture: true,
  shutterSpeed: true,
  iso: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;
  const postSelect = {
    ...POST_SELECT,
    likes: { where: { userId: currentUserId }, select: { id: true } },
    reposts: { where: { userId: currentUserId }, select: { id: true } },
    savedBy: { where: { userId: currentUserId }, select: { id: true } },
  } as const;

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
        select: postSelect,
      },
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });

  if (!user) notFound();

  const isMe = user.id === currentUserId;
  const [following, repostEntries] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } }),
    prisma.repost.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { post: { select: postSelect } },
    }),
  ]);
  const savedEntries = isMe
    ? await prisma.savedPost.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { post: { select: postSelect } },
      })
    : [];
  const followingIds = new Set(following.map((relationship) => relationship.followingId));
  const isFollowing = !isMe && followingIds.has(user.id);

  const shapePost = (post: (typeof user.posts)[number]) => {
    const { likes, reposts, savedBy, ...rest } = post;
    return {
      ...rest,
      createdAt: rest.createdAt.toISOString(),
      author: { ...rest.author, isFollowing: followingIds.has(rest.author.id) },
      images: getPostImages(rest),
      likedByMe: likes.length > 0,
      repostedByMe: reposts.length > 0,
      savedByMe: savedBy.length > 0,
    };
  };

  const posts = user.posts.map(shapePost);
  const reposts = repostEntries.map(({ post }) => shapePost(post));
  const savedPosts = savedEntries.map(({ post }) => shapePost(post));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProfileHeader user={user} isMe={isMe} isFollowing={isFollowing} />

      <ProfilePostTabs posts={posts} reposts={reposts} savedPosts={savedPosts} isMe={isMe} />
    </div>
  );
}
