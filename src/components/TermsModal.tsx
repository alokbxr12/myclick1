"use client";

export function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Terms &amp; Conditions</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-lg leading-none rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <p className="text-sm leading-relaxed text-black/80 dark:text-white/80">
          You retain ownership of content you upload. By uploading content, you grant us a
          limited licence to host, display and distribute that content as necessary to operate
          the platform.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
