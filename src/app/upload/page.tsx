"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloudIcon } from "@/components/Icons";
import { getImageUploadError } from "@/lib/image-upload-constraints";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [cameraModel, setCameraModel] = useState("");
  const [focalLength, setFocalLength] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [iso, setIso] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function selectFile(selected: File | null) {
    if (selected) {
      const validationError = getImageUploadError(selected);
      if (validationError) {
        setFile(null);
        setPreview(null);
        setError(validationError);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
    }

    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
    setError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    selectFile(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) selectFile(dropped);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a photo to upload");
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);
    formData.append("cameraModel", cameraModel);
    formData.append("focalLength", focalLength);
    formData.append("aperture", aperture);
    formData.append("shutterSpeed", shutterSpeed);
    formData.append("iso", iso);

    const res = await fetch("/api/posts", { method: "POST", body: formData });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to upload photo");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="glass-panel rounded-2xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-6">Upload a new photo</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 transition-colors ${
              dragging
                ? "border-[var(--accent-2)] bg-[var(--accent-2)]/10"
                : "border-black/20 dark:border-white/25 hover:border-[var(--accent-2)]/60 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <UploadCloudIcon className="w-12 h-12 text-black/40 dark:text-white/40" />
                <p className="text-sm font-medium">Click or drag a photo here</p>
                <p className="text-xs text-black/50 dark:text-white/50">
                  JPEG, PNG, WEBP or GIF · max 4 MB
                </p>
              </>
            )}
          </div>

          {preview && (
            <button
              type="button"
              onClick={() => {
                selectFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="text-xs self-start text-black/60 dark:text-white/60 hover:underline"
            >
              Remove photo
            </button>
          )}

          <textarea
            placeholder="Write a caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
          />

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-black/60 dark:text-white/60">Camera details (optional)</p>
            <input
              value={cameraModel}
              onChange={(e) => setCameraModel(e.target.value)}
              placeholder="Camera (e.g. Sony α7 IV)"
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                value={focalLength}
                onChange={(e) => setFocalLength(e.target.value)}
                placeholder="50mm"
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 text-sm"
              />
              <input
                value={aperture}
                onChange={(e) => setAperture(e.target.value)}
                placeholder="f/1.8"
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 text-sm"
              />
              <input
                value={shutterSpeed}
                onChange={(e) => setShutterSpeed(e.target.value)}
                placeholder="1/1000s"
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-2 py-2 text-sm"
              />
            </div>
            <input
              value={iso}
              onChange={(e) => setIso(e.target.value)}
              placeholder="ISO 100"
              className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="group relative isolate mt-1 flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border border-red-300/20 bg-[linear-gradient(135deg,#d83943_0%,#981b25_55%,#3f090d_100%)] px-3.5 py-3 text-left text-white shadow-[0_18px_45px_-22px_rgba(220,38,38,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200/35 hover:shadow-[0_22px_50px_-20px_rgba(220,38,38,1),inset_0_1px_0_rgba(255,255,255,0.32)] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.2),transparent_38%)]" />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/15 shadow-inner">
              <UploadCloudIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold tracking-[-0.01em]">
                {loading ? "Publishing photograph…" : "Publish photograph"}
              </span>
              <span className="mt-0.5 block text-[10px] font-medium text-white/60">
                Share this frame with the MyClick community
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg transition group-hover:translate-x-0.5 group-hover:bg-white/15" aria-hidden="true">
              →
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
