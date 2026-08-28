"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, UploadCloudIcon } from "@/components/Icons";
import { CameraDetailsFields } from "@/components/CameraDetailsFields";
import { ImageCropModal } from "@/components/ImageCropModal";
import { MentionInput } from "@/components/MentionInput";
import { PhotographerTagPicker, type PhotographerTag } from "@/components/PhotographerTagPicker";
import { getImageUploadError, MAX_IMAGES_PER_POST, MAX_POST_IMAGE_BYTES } from "@/lib/image-upload-constraints";

type UploadImage = {
  id: string;
  file: File;
  preview: string;
};

type MetadataStatus = "reading" | "found" | "unavailable" | "idle";

function textValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function compactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function formatFocalLength(value: unknown) {
  const text = textValue(value);
  if (!text) return "";
  const numeric = Number(text);
  return Number.isFinite(numeric) ? `${compactNumber(numeric)}mm` : text.includes("mm") ? text : `${text}mm`;
}

function formatAperture(value: unknown) {
  const text = textValue(value);
  if (!text) return "";
  const numeric = Number(text);
  return Number.isFinite(numeric) ? `f/${compactNumber(numeric)}` : text.toLowerCase().startsWith("f/") ? text : `f/${text}`;
}

function formatShutterSpeed(value: unknown) {
  const text = textValue(value);
  if (!text) return "";
  const numeric = Number(text);
  if (!Number.isFinite(numeric) || numeric <= 0) return text.endsWith("s") ? text : `${text}s`;
  if (numeric >= 1) return `${compactNumber(numeric)}s`;
  return `1/${Math.round(1 / numeric)}s`;
}

function formatIso(value: unknown) {
  const text = textValue(value);
  if (!text) return "";
  return text.toUpperCase().startsWith("ISO") ? text : `ISO ${text}`;
}

function formatCameraModel(make: unknown, model: unknown) {
  const cameraMake = textValue(make);
  const cameraModel = textValue(model);
  if (!cameraMake) return cameraModel;
  if (!cameraModel || cameraModel.toLowerCase().startsWith(cameraMake.toLowerCase())) return cameraModel || cameraMake;
  return `${cameraMake} ${cameraModel}`;
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadImage[]>([]);
  const [cropTargetId, setCropTargetId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [photographerTags, setPhotographerTags] = useState<PhotographerTag[]>([]);
  const [cameraModel, setCameraModel] = useState("");
  const [lensModel, setLensModel] = useState("");
  const [focalLength, setFocalLength] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutterSpeed, setShutterSpeed] = useState("");
  const [iso, setIso] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [metadataStatus, setMetadataStatus] = useState<MetadataStatus>("idle");

  const cropTarget = images.find((image) => image.id === cropTargetId) ?? null;
  const totalBytes = images.reduce((total, image) => total + image.file.size, 0);

  async function prefillCameraDetails(file: File) {
    setMetadataStatus("reading");
    try {
      const exifr = await import("exifr");
      const metadata = await exifr.parse(file, ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO"]);
      const camera = formatCameraModel(metadata?.Make, metadata?.Model);
      const lens = textValue(metadata?.LensModel);
      const focal = formatFocalLength(metadata?.FocalLength);
      const apertureValue = formatAperture(metadata?.FNumber);
      const shutter = formatShutterSpeed(metadata?.ExposureTime);
      const isoValue = formatIso(metadata?.ISO);
      const hasMetadata = Boolean(camera || lens || focal || apertureValue || shutter || isoValue);

      if (camera) setCameraModel((current) => current || camera);
      if (lens) setLensModel((current) => current || lens);
      if (focal) setFocalLength((current) => current || focal);
      if (apertureValue) setAperture((current) => current || apertureValue);
      if (shutter) setShutterSpeed((current) => current || shutter);
      if (isoValue) setIso((current) => current || isoValue);
      setMetadataStatus(hasMetadata ? "found" : "unavailable");
    } catch {
      setMetadataStatus("unavailable");
    }
  }

  function addFiles(selectedFiles: FileList | File[]) {
    const files = Array.from(selectedFiles);
    const availableSlots = MAX_IMAGES_PER_POST - images.length;
    if (availableSlots <= 0) {
      setError(`You can add up to ${MAX_IMAGES_PER_POST} photos in one post.`);
      return;
    }

    const accepted: UploadImage[] = [];
    let validationError: string | null = null;
    for (const file of files.slice(0, availableSlots)) {
      const imageError = getImageUploadError(file);
      if (imageError) {
        validationError ??= imageError;
        continue;
      }
      accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      setImages((current) => [...current, ...accepted]);
      void prefillCameraDetails(accepted[0].file);
    }
    if (files.length > availableSlots) {
      setError(`Only the first ${availableSlots} photo${availableSlots === 1 ? "" : "s"} could be added. A post can contain up to ${MAX_IMAGES_PER_POST}.`);
    } else {
      setError(validationError);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const removed = current.find((image) => image.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((image) => image.id !== id);
    });
    if (cropTargetId === id) setCropTargetId(null);
    setError(null);
  }

  function replaceWithCrop(id: string, file: File) {
    const validationError = getImageUploadError(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setImages((current) => current.map((image) => {
      if (image.id !== id) return image;
      URL.revokeObjectURL(image.preview);
      return { ...image, file, preview: URL.createObjectURL(file) };
    }));
    setCropTargetId(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (images.length === 0) {
      setError("Choose at least one photo to publish.");
      return;
    }
    if (totalBytes > MAX_POST_IMAGE_BYTES) {
      setError("Your photos are over the 4 MB total upload limit. Crop one or more photos, or choose smaller files.");
      return;
    }

    setError(null);
    setLoading(true);
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image.file));
    formData.append("caption", caption);
    formData.append("taggedUsernames", JSON.stringify(photographerTags.map((tag) => tag.username)));
    formData.append("collaboratorUsernames", JSON.stringify(photographerTags.filter((tag) => tag.inviteToCollaborate).map((tag) => tag.username)));
    formData.append("cameraModel", cameraModel);
    formData.append("lensModel", lensModel);
    formData.append("focalLength", focalLength);
    formData.append("aperture", aperture);
    formData.append("shutterSpeed", shutterSpeed);
    formData.append("iso", iso);

    const response = await fetch("/api/posts", { method: "POST", body: formData });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Failed to publish photos.");
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-white/[0.075] bg-[#101014] shadow-[0_28px_80px_-52px_rgba(0,0,0,0.98)]">
        <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Share your perspective</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-white">Publish a new post</h1>
          <p className="mt-2 text-sm text-white/42">Add one frame or a small sequence. Crop any photo before sharing it.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-5 sm:p-7">
          <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

          {images.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-red-400 bg-red-500/10" : "border-white/15 bg-white/[0.025] hover:border-red-400/60 hover:bg-white/[0.045]"}`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-red-300"><UploadCloudIcon className="h-7 w-7" /></span>
              <div>
                <p className="text-sm font-semibold text-white">Choose photos to share</p>
                <p className="mt-1 text-xs leading-5 text-white/42">Click or drop up to {MAX_IMAGES_PER_POST} JPEG, PNG, WEBP, or GIF files. Crop before publishing.</p>
              </div>
            </div>
          ) : (
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <p className="text-sm font-semibold text-white">Your sequence</p>
                  <p className="mt-0.5 text-[11px] text-white/38">{images.length}/{MAX_IMAGES_PER_POST} photos · {(totalBytes / (1024 * 1024)).toFixed(1)} MB of 4 MB</p>
                </div>
                {images.length < MAX_IMAGES_PER_POST && <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold text-white/70 transition hover:bg-white/[0.1] hover:text-white">Add photos</button>}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image, index) => (
                  <div key={image.id} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.preview} alt={`Selected photo ${index + 1}`} className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-black/65 px-1.5 py-1 text-[10px] font-bold text-white">{index + 1}</span>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-8">
                      <button type="button" onClick={() => setCropTargetId(image.id)} className="rounded-md bg-white/15 px-2 py-1.5 text-[10px] font-bold text-white backdrop-blur transition hover:bg-white/25">Crop</button>
                      <button type="button" onClick={() => removeImage(image.id)} aria-label={`Remove photo ${index + 1}`} className="flex h-7 w-7 items-center justify-center rounded-md bg-black/45 text-white/70 backdrop-blur transition hover:bg-red-500 hover:text-white"><CloseIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <MentionInput value={caption} onChange={setCaption} placeholder="Write a caption… Use @ to mention someone" maxLength={2000} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/15" />

          <PhotographerTagPicker selected={photographerTags} onChange={setPhotographerTags} />

          <CameraDetailsFields
            cameraModel={cameraModel}
            setCameraModel={setCameraModel}
            lensModel={lensModel}
            setLensModel={setLensModel}
            focalLength={focalLength}
            setFocalLength={setFocalLength}
            aperture={aperture}
            setAperture={setAperture}
            shutterSpeed={shutterSpeed}
            setShutterSpeed={setShutterSpeed}
            iso={iso}
            setIso={setIso}
            metadataStatus={metadataStatus}
          />

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200" role="alert">{error}</p>}

          <button type="submit" disabled={loading || images.length === 0} className="group relative isolate flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border border-red-300/20 bg-[linear-gradient(135deg,#d83943_0%,#981b25_55%,#3f090d_100%)] px-3.5 py-3 text-left text-white shadow-[0_18px_45px_-22px_rgba(220,38,38,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0">
            <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.2),transparent_38%)]" />
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/15 shadow-inner"><UploadCloudIcon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold tracking-[-0.01em]">{loading ? "Publishing…" : images.length > 1 ? `Publish ${images.length} photos` : "Publish photograph"}</span><span className="mt-0.5 block text-[10px] font-medium text-white/60">Share this frame with the MyClick community</span></span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg" aria-hidden="true">→</span>
          </button>
        </form>
      </div>

      {cropTarget && <ImageCropModal key={cropTarget.id} file={cropTarget.file} onCancel={() => setCropTargetId(null)} onComplete={(file) => replaceWithCrop(cropTarget.id, file)} />}
    </div>
  );
}
