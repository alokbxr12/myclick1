export function VerifiedBadge({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      aria-label="Verified photographer"
      title="Verified photographer"
    >
      <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="#1d9bf0" />
        <path
          d="m5.8 10.2 2.55 2.5 5.85-6"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
