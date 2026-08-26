export function HeartIcon({ filled = false, className = "" }: { filled?: boolean; className?: string }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 21s-6.7-4.35-9.3-8.2C1.02 10.6 1.4 7.4 3.8 5.6c2.1-1.55 4.9-1.1 6.4.8L12 8l1.8-1.6c1.5-1.9 4.3-2.35 6.4-.8 2.4 1.8 2.78 5 1.1 7.2C18.7 16.65 12 21 12 21z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M12 21s-6.7-4.35-9.3-8.2C1.02 10.6 1.4 7.4 3.8 5.6c2.1-1.55 4.9-1.1 6.4.8L12 8l1.8-1.6c1.5-1.9 4.3-2.35 6.4-.8 2.4 1.8 2.78 5 1.1 7.2C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

export function CommentIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 20l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoreIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusSquareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

export function LogOutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Original instant-camera glyph (body, viewfinder bump, lens, flash) — not derived from any brand asset.
export function PolaroidCameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <rect x="2.5" y="6" width="19" height="14" rx="2.5" />
      <path d="M8 6l1.3-2.2A1 1 0 0 1 10.2 3h3.6a1 1 0 0 1 .9.8L16 6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="4" />
      <circle cx="12" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
      <path d="M18 9.2h1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden>
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden>
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function UploadCloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M7 18a4.5 4.5 0 0 1-1-8.9A5.5 5.5 0 0 1 16.7 7 4.5 4.5 0 0 1 17 18H7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v7M9 14l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CameraEditIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M14.5 4h-5L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-1.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="m4 20 4.1-1 10.4-10.4a2.1 2.1 0 0 0-3-3L5.1 16 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13.9 7.1 3 3" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserSilhouetteIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M12 13.5c-4.4 0-8 2.5-8 6.5v1h16v-1c0-4-3.6-6.5-8-6.5z" />
    </svg>
  );
}
