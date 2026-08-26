"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon } from "./Icons";

const BIO_MAX_LENGTH = 160;

export function EditBioModal({ currentBio, onClose }: { currentBio: string | null; onClose: () => void }) {
  const router = useRouter();
  const [bio, setBio] = useState(currentBio ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("bio", bio);

    const response = await fetch("/api/users/me", {
      method: "PATCH",
      body: formData,
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Couldn’t save your bio. Please try again.");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
      onClick={onClose}
    >
      <form
        aria-labelledby="edit-bio-title"
        aria-modal="true"
        className="glass-panel my-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-white/10 p-6 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 id="edit-bio-title" className="text-lg font-bold text-white">Edit bio</h2>
            <p className="mt-0.5 text-xs text-white/50">Give fellow photographers a little context.</p>
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="sr-only" htmlFor="bio">Bio</label>
          <textarea
            autoFocus
            className="min-h-28 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/20"
            id="bio"
            maxLength={BIO_MAX_LENGTH}
            onChange={(event) => setBio(event.target.value)}
            placeholder="What do you love to photograph?"
            value={bio}
          />
          <div className="mt-1.5 flex items-start justify-between gap-4 text-[11px]">
            <p className="leading-4 text-white/45">Try your subjects, your city, or the way you see the world.</p>
            <span className="shrink-0 text-white/45">{bio.length}/{BIO_MAX_LENGTH}</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-xl border border-red-400/40 bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-950/50 transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? "Saving…" : "Save bio"}
          </button>
        </div>
      </form>
    </div>
  );
}
