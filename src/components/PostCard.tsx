"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar } from "./Avatar";
import { FollowButton } from "./FollowButton";
import { ArrowUpIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, CommentIcon, ShareIcon, RepostIcon, MoreIcon, PolaroidCameraIcon } from "./Icons";
import { VerifiedBadge } from "./VerifiedBadge";
import { PostLikesModal } from "./PostLikesModal";
import { formatCommentDateTime, formatPostDate } from "@/lib/formatPostDate";
import type { Comment, Post } from "@/types/post";

export function PostCard({
  post,
  onDeleted,
  onSavedChange,
  imageOverlay,
  showOwnerMenu = false,
}: {
  post: Post;
  onDeleted?: (id: string) => void;
  onSavedChange?: (id: string, saved: boolean) => void;
  imageOverlay?: React.ReactNode;
  showOwnerMenu?: boolean;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [caption, setCaption] = useState(post.caption ?? "");
  const [cameraModel, setCameraModel] = useState(post.cameraModel ?? "");
  const [focalLength, setFocalLength] = useState(post.focalLength ?? "");
  const [aperture, setAperture] = useState(post.aperture ?? "");
  const [shutterSpeed, setShutterSpeed] = useState(post.shutterSpeed ?? "");
  const [iso, setIso] = useState(post.iso ?? "");
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);
  const [reposted, setReposted] = useState(post.repostedByMe ?? false);
  const [repostBusy, setRepostBusy] = useState(false);
  const [saved, setSaved] = useState(post.savedByMe ?? false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [popping, setPopping] = useState(false);
  const [commentLikeBusy, setCommentLikeBusy] = useState<string | null>(null);

  const isOwner = session?.user?.id === post.author.id;
  const hasExif = post.cameraModel || post.focalLength || post.aperture || post.shutterSpeed || post.iso;
  const postImages = post.images.length > 0 ? post.images : [{ id: `legacy-${post.id}`, imageUrl: post.imageUrl, sortOrder: 0 }];
  const [selectedImage, setSelectedImage] = useState({ postId: post.id, index: 0 });
  const activeImageIndex = selectedImage.postId === post.id ? Math.min(selectedImage.index, postImages.length - 1) : 0;
  const activeImage = postImages[activeImageIndex] ?? postImages[0];

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(data.likeCount);
    if (data.liked) {
      setPopping(true);
      setTimeout(() => setPopping(false), 350);
    }
  }

  async function loadComments() {
    setShowComments((visible) => !visible);
    if (commentsLoaded) return;
    const res = await fetch(`/api/posts/${post.id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
      setCommentsLoaded(true);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment.trim() }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      setComments((current) => [data.comment, ...current]);
      setCommentCount((count) => count + 1);
      setNewComment("");
    }
  }

  async function toggleCommentLike(commentId: string) {
    setCommentLikeBusy(commentId);
    const res = await fetch(`/api/posts/${post.id}/comments/${commentId}/like`, { method: "POST" });
    setCommentLikeBusy(null);
    if (!res.ok) return;

    const data = await res.json();
    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId
          ? { ...comment, likedByMe: data.liked, _count: { likes: data.likeCount } }
          : comment
      )
    );
  }

  async function saveCaption() {
    setBusy(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, cameraModel, focalLength, aperture, shutterSpeed, iso }),
    });
    setBusy(false);
    if (res.ok) setEditing(false);
  }

  async function deletePost() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) onDeleted?.(post.id);
    setMenuOpen(false);
  }

  async function sharePost() {
    const url = `${window.location.origin}/p/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url, title: "MyClick photo" });
        return;
      } catch {
        // User cancelled or sharing is unsupported; copy the link instead.
      }
    }
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  async function toggleRepost() {
    if (isOwner || repostBusy) return;
    setRepostBusy(true);
    const res = await fetch(`/api/posts/${post.id}/repost`, { method: "POST" });
    setRepostBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setReposted(data.reposted);
  }

  async function toggleSaved() {
    if (saveBusy) return;
    setSaveBusy(true);
    const res = await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
    setSaveBusy(false);
    if (!res.ok) return;
    const data = await res.json();
    setSaved(data.saved);
    onSavedChange?.(post.id, data.saved);
    window.dispatchEvent(new CustomEvent("myclick:saved-frames-changed", { detail: { saved: data.saved } }));
  }

  return (
    <>
      <article className="overflow-hidden rounded-[1.75rem] border border-white/[0.075] bg-[#101014] shadow-[0_26px_80px_-48px_rgba(0,0,0,0.95)] transition duration-300 hover:border-white/[0.11]">
      {post.repostedBy && (
        <div className="flex items-center gap-2 border-b border-white/[0.055] bg-amber-300/[0.035] px-4 py-2 text-[10px] font-semibold text-amber-100/70 sm:px-5">
          <RepostIcon className="h-3.5 w-3.5 shrink-0 text-amber-200/80" />
          <Link href={`/profile/${post.repostedBy.username}`} className="truncate transition hover:text-amber-100">
            @{post.repostedBy.username} reposted this photograph
          </Link>
        </div>
      )}
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <Link href={`/profile/${post.author.username}`} className="group flex min-w-0 items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-red-400 via-red-600 to-amber-500 p-[2px]">
            <div className="rounded-full bg-[#101014] p-[2px]">
              <Avatar src={post.author.avatarUrl} username={post.author.username} size={38} className="ring-0" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white transition group-hover:text-red-300">
              {post.author.name ?? post.author.username}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/32">
              <span className="truncate">@{post.author.username}</span>
              <VerifiedBadge className="h-3 w-3" />
              <span aria-hidden="true">·</span>
              <time>{formatPostDate(post.createdAt)}</time>
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {!isOwner && <FollowButton compact initialFollowing={post.author.isFollowing} username={post.author.username} />}

          {showOwnerMenu && isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Post options"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white/75"
            >
              <MoreIcon className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <button className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#18181d]/98 p-1 text-xs shadow-2xl backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setEditing((value) => !value);
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-white/65 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Edit details
                  </button>
                  <button onClick={deletePost} disabled={busy} className="w-full rounded-lg px-3 py-2.5 text-left text-red-400 transition hover:bg-red-500/10">
                    Delete post
                  </button>
                </div>
              </>
            )}
          </div>
          )}
        </div>
      </header>

      <div className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden bg-black" onDoubleClick={toggleLike}>
        {/* Natural dimensions keep each photographer's original framing intact. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeImage.imageUrl} alt={post.caption ?? `Photograph by ${post.author.username}`} className="block h-auto max-h-[82vh] w-full object-contain" />
        {imageOverlay}
        {postImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedImage({ postId: post.id, index: (activeImageIndex - 1 + postImages.length) % postImages.length });
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/70 sm:left-4 sm:h-10 sm:w-10"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedImage({ postId: post.id, index: (activeImageIndex + 1) % postImages.length });
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur transition hover:bg-black/70 sm:right-4 sm:h-10 sm:w-10"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white/85 backdrop-blur">
              {activeImageIndex + 1} / {postImages.length}
            </span>
          </>
        )}
        {popping && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5">
            <HeartIcon filled className="like-pop h-20 w-20 text-red-500 drop-shadow-[0_8px_25px_rgba(0,0,0,0.65)]" />
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 items-center rounded-xl text-xs font-semibold transition ${
                liked ? "bg-red-500/10 text-red-400" : "bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <button
                onClick={toggleLike}
                className="flex h-10 items-center pl-3 pr-2"
                aria-label={liked ? "Unlike this post" : "Like this post"}
              >
                <HeartIcon filled={liked} className={`h-5 w-5 ${popping ? "like-pop" : ""}`} />
              </button>
              <button
                onClick={() => setShowLikes(true)}
                className="flex h-10 min-w-8 items-center justify-center rounded-r-xl pr-3 transition hover:text-white"
                aria-label={`View ${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
              >
                {likeCount}
              </button>
            </div>
            <button
              onClick={loadComments}
              className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                showComments ? "bg-white/[0.09] text-white" : "bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
              aria-label="Comments"
              aria-expanded={showComments}
            >
              <CommentIcon className="h-5 w-5" />
              <span>{commentCount}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {shared && <span className="text-[10px] font-medium text-emerald-400">Link copied</span>}
            <button
              onClick={toggleSaved}
              disabled={saveBusy}
              aria-label={saved ? "Remove from saved frames" : "Save photograph"}
              title={saved ? "Saved" : "Save frame"}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${
                saved
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
                  : "bg-white/[0.035] text-white/48 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <BookmarkIcon filled={saved} className="h-[18px] w-[18px]" />
            </button>
            {!isOwner && (
              <button
                onClick={toggleRepost}
                disabled={repostBusy}
                aria-label={reposted ? "Remove repost" : "Repost photograph"}
                className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  reposted
                    ? "bg-amber-300/10 text-amber-200 hover:bg-amber-300/15"
                    : "bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <RepostIcon className="h-[18px] w-[18px]" />
                <span>{reposted ? "Reposted" : "Repost"}</span>
              </button>
            )}
            <button onClick={sharePost} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.035] text-white/48 transition hover:bg-white/[0.07] hover:text-white" aria-label="Share photograph">
              <ShareIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {!editing && hasExif && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.055] pt-4">
            {post.cameraModel && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/[0.08] px-2.5 py-1.5 text-[10px] font-semibold text-red-300/85">
                <PolaroidCameraIcon className="h-3 w-3" />
                {post.cameraModel}
              </span>
            )}
            {[post.focalLength, post.aperture, post.shutterSpeed, post.iso].filter(Boolean).map((spec) => (
              <span key={spec} className="rounded-lg border border-white/[0.055] px-2.5 py-1.5 font-mono text-[10px] text-white/38">
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4">
          {editing ? (
            <EditPostForm
              caption={caption}
              setCaption={setCaption}
              cameraModel={cameraModel}
              setCameraModel={setCameraModel}
              focalLength={focalLength}
              setFocalLength={setFocalLength}
              aperture={aperture}
              setAperture={setAperture}
              shutterSpeed={shutterSpeed}
              setShutterSpeed={setShutterSpeed}
              iso={iso}
              setIso={setIso}
              busy={busy}
              onSave={saveCaption}
              onCancel={() => setEditing(false)}
            />
          ) : (
            post.caption && (
              <p className="text-sm leading-6 text-white/68">
                <Link href={`/profile/${post.author.username}`} className="mr-1.5 inline-flex items-center gap-1 font-semibold text-white hover:text-red-300">
                  <span>{post.author.username}</span>
                  <VerifiedBadge className="h-3 w-3" />
                </Link>
                {caption}
              </p>
            )
          )}
        </div>

        {showComments && (
          <div className="mt-5 border-t border-white/[0.065] pt-5">
            <div className="custom-scrollbar flex max-h-64 flex-col gap-4 overflow-y-auto pr-1">
              {commentsLoaded && comments.length === 0 && <p className="py-2 text-xs text-white/30">Be the first to respond to this frame.</p>}
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar src={comment.user.avatarUrl} username={comment.user.username} size={28} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <Link href={`/profile/${comment.user.username}`} className="inline-flex items-center gap-1 text-xs font-semibold text-white/85 hover:text-red-300">
                        <span>{comment.user.username}</span>
                        <VerifiedBadge className="h-3 w-3" />
                      </Link>
                      {session?.user?.id !== comment.user.id && <FollowButton compact username={comment.user.username} initialFollowing={comment.user.isFollowing} />}
                    </div>
                    <p className="break-words text-xs leading-5 text-white/58">
                      {comment.content}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-white/28">
                      <time dateTime={comment.createdAt}>{formatCommentDateTime(comment.createdAt)}</time>
                      <button
                        onClick={() => toggleCommentLike(comment.id)}
                        disabled={commentLikeBusy === comment.id}
                        className={`inline-flex items-center gap-1 font-semibold transition hover:text-red-300 disabled:opacity-45 ${
                          comment.likedByMe ? "text-red-400" : "text-white/34"
                        }`}
                        aria-label={comment.likedByMe ? "Unlike comment" : "Like comment"}
                      >
                        <HeartIcon filled={comment.likedByMe} className="h-3 w-3" />
                        <span>{comment._count.likes > 0 ? comment._count.likes : "Like"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submitComment} className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5 focus-within:border-white/15">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share what caught your eye…"
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-white/24"
              />
              <button
                type="submit"
                disabled={busy || !newComment.trim()}
                aria-label="Post comment"
                title="Post comment"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff7a64] to-[#ed466b] text-white shadow-[0_8px_18px_-10px_rgba(241,91,101,0.95)] transition hover:scale-[1.04] hover:from-[#ff8a70] hover:to-[#f05275] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
      </article>

      {showLikes && (
        <PostLikesModal postId={post.id} likeCount={likeCount} onClose={() => setShowLikes(false)} />
      )}
    </>
  );
}

function EditPostForm({
  caption,
  setCaption,
  cameraModel,
  setCameraModel,
  focalLength,
  setFocalLength,
  aperture,
  setAperture,
  shutterSpeed,
  setShutterSpeed,
  iso,
  setIso,
  busy,
  onSave,
  onCancel,
}: {
  caption: string;
  setCaption: (value: string) => void;
  cameraModel: string;
  setCameraModel: (value: string) => void;
  focalLength: string;
  setFocalLength: (value: string) => void;
  aperture: string;
  setAperture: (value: string) => void;
  shutterSpeed: string;
  setShutterSpeed: (value: string) => void;
  iso: string;
  setIso: (value: string) => void;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const inputClass = "rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-white/24 focus:border-red-500/40";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.065] bg-black/15 p-3.5">
      <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} maxLength={2000} placeholder="Write about this photograph…" className={`${inputClass} resize-none`} />
      <div className="grid grid-cols-2 gap-2">
        <input value={cameraModel} onChange={(e) => setCameraModel(e.target.value)} placeholder="Camera model" className={`${inputClass} col-span-2`} />
        <input value={focalLength} onChange={(e) => setFocalLength(e.target.value)} placeholder="50mm" className={inputClass} />
        <input value={aperture} onChange={(e) => setAperture(e.target.value)} placeholder="f/1.8" className={inputClass} />
        <input value={shutterSpeed} onChange={(e) => setShutterSpeed(e.target.value)} placeholder="1/1000s" className={inputClass} />
        <input value={iso} onChange={(e) => setIso(e.target.value)} placeholder="ISO 100" className={inputClass} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSave} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-red-500 disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-[11px] font-semibold text-white/42 transition hover:bg-white/[0.05] hover:text-white/70">
          Cancel
        </button>
      </div>
    </div>
  );
}
