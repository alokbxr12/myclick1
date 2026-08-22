"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar } from "./Avatar";
import { HeartIcon, CommentIcon, ShareIcon, MoreIcon, PolaroidCameraIcon } from "./Icons";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatPostDate } from "@/lib/formatPostDate";
import type { Comment, Post } from "@/types/post";

export function PostCard({
  post,
  onDeleted,
  imageOverlay,
  showOwnerMenu = false,
}: {
  post: Post;
  onDeleted?: (id: string) => void;
  imageOverlay?: React.ReactNode;
  showOwnerMenu?: boolean;
}) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
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
  const [popping, setPopping] = useState(false);

  const isOwner = session?.user?.id === post.author.id;
  const hasExif = post.cameraModel || post.focalLength || post.aperture || post.shutterSpeed || post.iso;

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
      setComments((current) => [...current, data.comment]);
      setCommentCount((count) => count + 1);
      setNewComment("");
    }
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

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/[0.075] bg-[#101014] shadow-[0_26px_80px_-48px_rgba(0,0,0,0.95)] transition duration-300 hover:border-white/[0.11]">
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
      </header>

      <div className="relative flex min-h-[260px] w-full items-center justify-center overflow-hidden bg-black" onDoubleClick={toggleLike}>
        {/* Natural dimensions keep each photographer's original framing intact. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.imageUrl} alt={post.caption ?? `Photograph by ${post.author.username}`} className="block h-auto max-h-[82vh] w-full object-contain" />
        {imageOverlay}
        {popping && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5">
            <HeartIcon filled className="like-pop h-20 w-20 text-red-500 drop-shadow-[0_8px_25px_rgba(0,0,0,0.65)]" />
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                liked ? "bg-red-500/10 text-red-400" : "bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
              }`}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <HeartIcon filled={liked} className={`h-5 w-5 ${popping ? "like-pop" : ""}`} />
              <span>{likeCount}</span>
            </button>
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
                  <p className="min-w-0 text-xs leading-5 text-white/58">
                    <Link href={`/profile/${comment.user.username}`} className="mr-1.5 inline-flex items-center gap-1 font-semibold text-white/85 hover:text-red-300">
                      <span>{comment.user.username}</span>
                      <VerifiedBadge className="h-3 w-3" />
                    </Link>
                    {comment.content}
                  </p>
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
              <button type="submit" disabled={busy || !newComment.trim()} className="rounded-lg bg-white/[0.08] px-3 py-2 text-[11px] font-semibold text-white/65 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
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
