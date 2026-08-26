"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "./Icons";

const RATIOS = [
  { label: "Square", value: 1 },
  { label: "Portrait", value: 4 / 5 },
  { label: "Wide", value: 16 / 9 },
];

function drawCrop(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  aspectRatio: number,
  zoom: number,
  positionX: number,
  positionY: number,
  maxDimension: number
) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const baseWidth = imageRatio > aspectRatio ? image.naturalHeight * aspectRatio : image.naturalWidth;
  const baseHeight = baseWidth / aspectRatio;
  const cropWidth = baseWidth / zoom;
  const cropHeight = baseHeight / zoom;
  const horizontalRoom = Math.max(0, (image.naturalWidth - cropWidth) / 2);
  const verticalRoom = Math.max(0, (image.naturalHeight - cropHeight) / 2);
  const sourceX = horizontalRoom + horizontalRoom * (positionX / 100);
  const sourceY = verticalRoom + verticalRoom * (positionY / 100);
  const scale = Math.min(1, maxDimension / Math.max(cropWidth, cropHeight));

  canvas.width = Math.max(1, Math.round(cropWidth * scale));
  canvas.height = Math.max(1, Math.round(cropHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
}

export function ImageCropModal({
  file,
  onCancel,
  onComplete,
}: {
  file: File;
  onCancel: () => void;
  onComplete: (file: File) => void;
}) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState(4 / 5);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const sourceUrl = URL.createObjectURL(file);
    const sourceImage = new Image();
    sourceImage.onload = () => {
      if (active) setImage(sourceImage);
    };
    sourceImage.onerror = () => {
      if (active) setError("This photo could not be opened for cropping.");
    };
    sourceImage.src = sourceUrl;

    return () => {
      active = false;
      URL.revokeObjectURL(sourceUrl);
    };
  }, [file]);

  useEffect(() => {
    if (!image || !previewCanvasRef.current) return;
    drawCrop(previewCanvasRef.current, image, aspectRatio, zoom, positionX, positionY, 960);
  }, [image, aspectRatio, zoom, positionX, positionY]);

  function resetCrop() {
    setZoom(1);
    setPositionX(0);
    setPositionY(0);
  }

  function applyCrop() {
    if (!image) return;
    setSaving(true);
    setError(null);

    const output = document.createElement("canvas");
    drawCrop(output, image, aspectRatio, zoom, positionX, positionY, 1800);
    output.toBlob(
      (blob) => {
        setSaving(false);
        if (!blob) {
          setError("We couldn’t create that crop. Please try again.");
          return;
        }

        const filename = file.name.replace(/\.[^.]+$/, "") || "photograph";
        onComplete(new File([blob], `${filename}-cropped.jpg`, { type: "image/jpeg", lastModified: Date.now() }));
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/90 p-3 sm:p-6" onClick={onCancel}>
      <section
        aria-labelledby="crop-photo-title"
        aria-modal="true"
        className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#111115] text-white shadow-[0_32px_120px_-36px_rgba(0,0,0,1)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Fine tune your frame</p>
            <h2 id="crop-photo-title" className="mt-1 text-lg font-bold tracking-[-0.025em]">Crop photo</h2>
          </div>
          <button type="button" aria-label="Close cropper" onClick={onCancel} className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.07] hover:text-white">
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-6">
          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-black">
            {image ? <canvas ref={previewCanvasRef} className="max-h-[58dvh] max-w-full rounded-lg object-contain" aria-label="Crop preview" /> : <p className="text-xs text-white/40">Preparing photo…</p>}
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Shape</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {RATIOS.map((ratio) => (
                  <button
                    type="button"
                    key={ratio.label}
                    onClick={() => {
                      setAspectRatio(ratio.value);
                      resetCrop();
                    }}
                    className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition ${aspectRatio === ratio.value ? "bg-red-500 text-white" : "bg-white/[0.055] text-white/50 hover:bg-white/[0.1] hover:text-white"}`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <CropRange label="Zoom" min={1} max={3} step={0.01} value={zoom} onChange={setZoom} valueLabel={`${zoom.toFixed(2)}×`} />
            <CropRange label="Horizontal position" min={-100} max={100} step={1} value={positionX} onChange={setPositionX} />
            <CropRange label="Vertical position" min={-100} max={100} step={1} value={positionY} onChange={setPositionY} />

            <button type="button" onClick={resetCrop} className="text-xs font-semibold text-white/48 transition hover:text-white">Reset crop</button>
            <p className="text-[11px] leading-4 text-white/33">Cropping creates an optimized JPEG copy; your original photo stays on your device.</p>
          </div>
        </div>

        {error && <p className="mx-5 mb-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-200 sm:mx-6">{error}</p>}

        <footer className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-4 sm:px-6">
          <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/[0.07] hover:text-white">Cancel</button>
          <button type="button" disabled={!image || saving} onClick={applyCrop} className="rounded-xl bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Applying crop…" : "Use crop"}</button>
        </footer>
      </section>
    </div>
  );
}

function CropRange({
  label,
  min,
  max,
  step,
  value,
  valueLabel,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-[11px] font-semibold text-white/52">{label}{valueLabel && <span>{valueLabel}</span>}</span>
      <input className="mt-2 w-full accent-red-500" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
