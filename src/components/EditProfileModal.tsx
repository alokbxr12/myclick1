"use client";

import { useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { CloseIcon, TrashIcon, UploadCloudIcon } from "./Icons";
import { getImageUploadError } from "@/lib/image-upload-constraints";

const BIO_MAX_LENGTH = 160;

export function EditProfileModal({
  user,
  onClose,
}: {
  user: { username: string; bio: string | null; avatarUrl: string | null };
  onClose: () => void;
}) {
  const { update } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectAvatar(selected: File | null) {
    if (!selected) return;
    const validationError = getImageUploadError(selected);
    if (validationError) {
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setAvatarFile(selected);
    setPreview(URL.createObjectURL(selected));
    setRemoveAvatar(false);
    setError(null);
  }

  function removeSelectedAvatar() {
    setAvatarFile(null);
    setPreview(null);
    setRemoveAvatar(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);
    if (removeAvatar) formData.append("deleteAvatar", "true");

    const response = await fetch("/api/users/me", { method: "PATCH", body: formData });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Couldn’t update your profile. Please try again.");
      return;
    }

    const data = await response.json();
    await update({ username: data.user.username, avatarUrl: data.user.avatarUrl });
    onClose();
    router.replace(`/profile/${data.user.username}`);
    router.refresh();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/80 sm:items-center sm:px-6 sm:py-7" onClick={onClose}>
      <form
        aria-labelledby="edit-profile-title"
        aria-modal="true"
        className="my-auto flex min-h-dvh w-full flex-col bg-[#111115] text-white shadow-[0_30px_100px_-30px_rgba(0,0,0,0.95)] sm:min-h-[42rem] sm:max-w-5xl sm:rounded-[2rem] sm:border sm:border-white/10"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Your space</p>
            <h2 id="edit-profile-title" className="mt-1 text-lg font-bold tracking-[-0.025em] text-white">Edit profile</h2>
            <p className="mt-1 text-xs text-white/42">Update how the community sees your work.</p>
          </div>
          <button
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.07] hover:text-white"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid flex-1 content-center gap-6 px-5 py-6 sm:grid-cols-[minmax(19rem,0.9fr)_minmax(0,1.35fr)] sm:gap-10 sm:px-10 sm:py-9">
          <section className="flex flex-col justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:min-h-80 sm:p-7">
            <Avatar src={preview} username={username || user.username} size={112} />
            <div className="mt-5">
              <p className="text-base font-semibold text-white">Profile photo</p>
              <p className="mt-2 text-sm leading-6 text-white/42">A clear portrait makes it easier to recognize your work.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white"
                >
                  <UploadCloudIcon className="h-4 w-4" />
                  Change photo
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={removeSelectedAvatar}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={(event) => selectAvatar(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </section>

          <div className="space-y-6 sm:py-1">
            <div>
              <label htmlFor="profile-username" className="text-xs font-semibold text-white/68">Username</label>
              <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/[0.035] px-3.5 focus-within:border-red-400/70 focus-within:ring-2 focus-within:ring-red-500/15">
                <span className="text-sm text-white/35">@</span>
                <input
                  id="profile-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent px-1.5 py-3 text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/38">3–20 characters; letters, numbers, and underscores only.</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="profile-bio" className="text-xs font-semibold text-white/68">Bio</label>
                <span className="text-[11px] text-white/38">{bio.length}/{BIO_MAX_LENGTH}</span>
              </div>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={BIO_MAX_LENGTH}
                rows={8}
                placeholder="What do you love to photograph?"
                className="mt-2 min-h-48 w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/15"
              />
            </div>

            {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200" role="alert">{error}</p>}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-4 sm:px-10 sm:py-5">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.07] hover:text-white">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_-16px_rgba(241,91,101,0.95)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? "Saving…" : "Save profile"}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
