export type PostAuthor = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type PostImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

export type Post = {
  id: string;
  caption: string | null;
  imageUrl: string;
  createdAt: string;
  cameraModel: string | null;
  focalLength: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: string | null;
  author: PostAuthor;
  images: PostImage[];
  _count: { likes: number; comments: number };
  likedByMe: boolean;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: PostAuthor;
  _count: { likes: number };
  likedByMe: boolean;
};
