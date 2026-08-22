"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { UploadCloudIcon, TrashIcon, CloseIcon } from "./Icons";
import { getImageUploadError } from "@/lib/image-upload-constraints";

export function EditAvatarModal({
  currentAvatarUrl,
  username,
  onClose,
}: {
  currentAvatarUrl: string | null;
  username: string;
  onClose: () => void;
}) {
  const { update } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function selectFile(selected: File | null) {
    if (selected) {
      const validationError = getImageUploadError(selected);
      if (validationError) {
        setFile(null);
        setError(validationError);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    selectFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      selectFile(dropped);
    }
  }

  async function handleSave() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update profile picture");
      return;
    }

    const data = await res.json();
    await update({ avatarUrl: data.user.avatarUrl });
    router.refresh();
    onClose();
  }

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("deleteAvatar", "true");

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to remove profile picture");
      return;
    }

    await update({ avatarUrl: null });
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-sm rounded-2xl shadow-2xl p-6 my-auto flex flex-col gap-5 text-white border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="font-bold text-lg text-white">Update Profile Picture</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-lg leading-none rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Clickable Dropzone & Preview Box */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative w-full rounded-xl border-2 border-dashed p-6 cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${
            dragging
              ? "border-red-500 bg-red-500/10"
              : "border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10"
          }`}
        >
          <div className="relative">
            <Avatar src={preview} username={username} size={96} />
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1.5 rounded-full shadow-md">
              <UploadCloudIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-white">
              {file ? "Photo selected!" : "Click or drag photo here"}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              JPEG, PNG, WEBP or GIF · max 4 MB
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {file ? (
            <>
              {/* Prominent Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3.5 px-4 text-sm shadow-xl shadow-red-950/80 border border-red-400/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Saving photo…" : "✓ Save New Profile Photo"}
              </button>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="w-full rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium py-2.5 transition-colors"
              >
                Choose a different photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold py-3 px-4 text-sm flex items-center justify-center gap-2 transition-colors border border-white/15"
              >
                <UploadCloudIcon className="w-4 h-4" />
                Select Photo from Device
              </button>

              {currentAvatarUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={loading}
                  className="w-full rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-medium py-2.5 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Remove profile photo
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
