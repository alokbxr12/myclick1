"use client";

import { useId, useMemo, useState } from "react";

type MetadataStatus = "reading" | "found" | "unavailable" | "idle";

type CameraDetailsFieldsProps = {
  cameraModel: string;
  setCameraModel: (value: string) => void;
  lensModel: string;
  setLensModel: (value: string) => void;
  focalLength: string;
  setFocalLength: (value: string) => void;
  aperture: string;
  setAperture: (value: string) => void;
  shutterSpeed: string;
  setShutterSpeed: (value: string) => void;
  iso: string;
  setIso: (value: string) => void;
  metadataStatus?: MetadataStatus;
  compact?: boolean;
};

const MODELS_BY_BRAND: Record<string, string[]> = {
  Canon: ["Canon EOS R1", "Canon EOS R3", "Canon EOS R5 Mark II", "Canon EOS R5", "Canon EOS R6 Mark II", "Canon EOS R6", "Canon EOS R8", "Canon EOS R7", "Canon EOS 5D Mark IV", "Canon EOS 6D Mark II"],
  Nikon: ["Nikon Z9", "Nikon Z8", "Nikon Zf", "Nikon Z6 III", "Nikon Z6 II", "Nikon Z7 II", "Nikon Z5", "Nikon D850", "Nikon D780", "Nikon D750"],
  Sony: ["Sony α1", "Sony α9 III", "Sony α7R V", "Sony α7R IV", "Sony α7 IV", "Sony α7 III", "Sony α7C II", "Sony α7C", "Sony FX3", "Sony FX30", "Sony α6700", "Sony RX100 VII"],
  Fujifilm: ["Fujifilm GFX100 II", "Fujifilm GFX100S II", "Fujifilm X-H2S", "Fujifilm X-H2", "Fujifilm X-T5", "Fujifilm X-T50", "Fujifilm X100VI", "Fujifilm X-S20"],
  Panasonic: ["Panasonic Lumix S1R II", "Panasonic Lumix S5IIX", "Panasonic Lumix S5II", "Panasonic Lumix G9 II", "Panasonic Lumix GH7", "Panasonic Lumix GH6"],
  "OM System": ["OM SYSTEM OM-1 Mark II", "OM SYSTEM OM-1", "OM SYSTEM OM-5", "Olympus OM-D E-M1 Mark III"],
  Leica: ["Leica Q3", "Leica SL3", "Leica M11", "Leica D-Lux 8"],
  Pentax: ["Pentax K-1 Mark II", "Pentax K-3 Mark III"],
  DJI: ["DJI Mavic 3 Pro", "DJI Air 3", "DJI Mini 4 Pro", "DJI Osmo Pocket 3"],
  Apple: ["Apple iPhone 16 Pro", "Apple iPhone 15 Pro", "Apple iPhone 14 Pro"],
  Google: ["Google Pixel 9 Pro", "Google Pixel 8 Pro"],
  Samsung: ["Samsung Galaxy S25 Ultra", "Samsung Galaxy S24 Ultra"],
};

const LENS_OPTIONS = [
  "Canon RF 24-70mm F2.8 L IS USM", "Canon RF 50mm F1.2 L USM", "Canon RF 70-200mm F2.8 L IS USM",
  "NIKKOR Z 24-70mm f/2.8 S", "NIKKOR Z 50mm f/1.8 S", "NIKKOR Z 70-200mm f/2.8 VR S",
  "Sony FE 24-70mm F2.8 GM II", "Sony FE 35mm F1.4 GM", "Sony FE 50mm F1.2 GM", "Sony FE 70-200mm F2.8 GM OSS II",
  "Fujinon XF 16-55mm F2.8 R LM WR II", "Fujinon XF 23mm F1.4 R LM WR", "Fujinon XF 50-140mm F2.8 R LM OIS WR",
  "Sigma 24-70mm F2.8 DG DN II | Art", "Sigma 35mm F1.4 DG DN | Art", "Sigma 85mm F1.4 DG DN | Art",
  "Tamron 28-75mm F2.8 Di III VXD G2", "Tamron 35-150mm F2-2.8 Di III VXD",
];

const FOCAL_LENGTH_OPTIONS = ["14mm", "16mm", "20mm", "24mm", "28mm", "35mm", "50mm", "55mm", "70mm", "85mm", "105mm", "135mm", "200mm", "24-70mm", "70-200mm"];
const APERTURE_OPTIONS = ["f/1.2", "f/1.4", "f/1.8", "f/2", "f/2.8", "f/4", "f/5.6", "f/8", "f/11", "f/16"];
const SHUTTER_SPEED_OPTIONS = ["1/8000s", "1/4000s", "1/2000s", "1/1000s", "1/500s", "1/250s", "1/125s", "1/60s", "1/30s", "1/15s", "1s"];
const ISO_OPTIONS = ["ISO 50", "ISO 100", "ISO 200", "ISO 400", "ISO 800", "ISO 1600", "ISO 3200", "ISO 6400", "ISO 12800"];

function inferBrand(cameraModel: string) {
  const match = Object.keys(MODELS_BY_BRAND).find((brand) => cameraModel.toLowerCase().includes(brand.toLowerCase()));
  return match ?? "";
}

function Field({ label, list, value, setValue, placeholder }: { label: string; list: string; value: string; setValue: (value: string) => void; placeholder: string }) {
  return (
    <label className="min-w-0">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/37">{label}</span>
      <input list={list} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/10" />
    </label>
  );
}

export function CameraDetailsFields({
  cameraModel, setCameraModel, lensModel, setLensModel, focalLength, setFocalLength, aperture, setAperture, shutterSpeed, setShutterSpeed, iso, setIso, metadataStatus = "idle", compact = false,
}: CameraDetailsFieldsProps) {
  const [brand, setBrand] = useState(() => inferBrand(cameraModel));
  const idPrefix = useId();
  const cameraOptions = useMemo(() => brand ? MODELS_BY_BRAND[brand] ?? [] : Object.values(MODELS_BY_BRAND).flat(), [brand]);
  const listId = (suffix: string) => `camera-details-${idPrefix}-${suffix}`;
  const statusMessage = metadataStatus === "reading"
    ? "Reading camera details from your first photo…"
    : metadataStatus === "found"
      ? "Camera details were filled from your first photo. You can edit any value."
      : metadataStatus === "unavailable"
        ? "No camera details were found in this photo. Choose a suggestion or type your own."
        : "Choose a suggestion or type any camera, lens, or setting.";

  return (
    <section className={`rounded-2xl border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] ${compact ? "p-3.5" : "p-4 sm:p-5"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Camera details <span className="font-normal text-white/35">(optional)</span></h2>
          <p className="mt-1 text-xs leading-5 text-white/43">{statusMessage}</p>
        </div>
        {metadataStatus === "found" && <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-[10px] font-semibold text-emerald-200/90">EXIF detected</span>}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <label className="min-w-0">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/37">Camera brand</span>
          <select value={brand} onChange={(event) => setBrand(event.target.value)} className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-400/70 focus:ring-2 focus:ring-red-500/10">
            <option value="">All brands</option>
            {Object.keys(MODELS_BY_BRAND).map((cameraBrand) => <option key={cameraBrand} value={cameraBrand}>{cameraBrand}</option>)}
            <option value="Other">Other / manual</option>
          </select>
        </label>
        <Field label="Camera make & model" list={listId("models")} value={cameraModel} setValue={setCameraModel} placeholder="e.g. Sony α7 IV" />
      </div>

      <div className="mt-3">
        <Field label="Lens" list={listId("lenses")} value={lensModel} setValue={setLensModel} placeholder="e.g. 24-70mm f/2.8" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Focal length" list={listId("focal-lengths")} value={focalLength} setValue={setFocalLength} placeholder="50mm" />
        <Field label="Aperture" list={listId("apertures")} value={aperture} setValue={setAperture} placeholder="f/1.8" />
        <Field label="Shutter" list={listId("shutter-speeds")} value={shutterSpeed} setValue={setShutterSpeed} placeholder="1/1000s" />
        <Field label="ISO" list={listId("iso")} value={iso} setValue={setIso} placeholder="ISO 100" />
      </div>

      <datalist id={listId("models")}>{cameraOptions.map((option) => <option key={option} value={option} />)}</datalist>
      <datalist id={listId("lenses")}>{LENS_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
      <datalist id={listId("focal-lengths")}>{FOCAL_LENGTH_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
      <datalist id={listId("apertures")}>{APERTURE_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
      <datalist id={listId("shutter-speeds")}>{SHUTTER_SPEED_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
      <datalist id={listId("iso")}>{ISO_OPTIONS.map((option) => <option key={option} value={option} />)}</datalist>
    </section>
  );
}
