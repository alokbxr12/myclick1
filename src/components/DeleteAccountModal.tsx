"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { CloseIcon, TrashIcon } from "./Icons";

const REASONS = [
  "Taking a break from social media",
  "Privacy concerns",
  "Creating a new account",
  "Too distracting",
  "Other reason",
];

export function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const finalReason =
      selectedReason === "Other reason" && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    const res = await fetch("/api/users/me", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: finalReason }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete account");
      return;
    }

    setDeleted(true);
  }

  function handleFinalGoodbye() {
    signOut({ callbackUrl: "/login" });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/80 sm:items-center sm:px-6 sm:py-7"
      onClick={deleted ? handleFinalGoodbye : onClose}
    >
      <div
        className="my-auto flex min-h-dvh w-full flex-col gap-6 bg-[#111115] p-5 text-white shadow-2xl sm:min-h-[34rem] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-white/10 sm:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        {!deleted ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-400">
                <TrashIcon className="h-5 w-5" />
                Delete Account
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-lg leading-none rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Note */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
              ⚠️ <strong>Warning:</strong> This action is permanent. All your photos, posts, comments, likes, and followers will be permanently deleted.
            </div>

            {/* Reason Options */}
            <div className="flex flex-1 flex-col gap-3">
              <label className="text-sm font-semibold text-white">
                Please tell us why you&apos;re leaving:
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-3 text-xs text-white/80 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <input
                      type="radio"
                      name="deleteReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="accent-red-500 w-4 h-4"
                    />
                    {reason}
                  </label>
                ))}
              </div>

              {selectedReason === "Other reason" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tell us more…"
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-red-500 sm:col-span-2"
                />
              )}
            </div>

            {error && <p className="text-xs text-red-400 font-medium text-center">{error}</p>}

            {/* Always-visible Action Buttons */}
            <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3.5 px-4 text-sm shadow-xl shadow-red-950/80 border border-red-400/40 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                {loading ? "Deleting account…" : "Confirm & Delete My Account"}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium py-2.5 transition-colors"
              >
                Cancel & Keep My Account
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <span className="text-5xl animate-bounce">🥺</span>
            <h2 className="text-xl font-bold tracking-tight text-white">We&apos;ll miss you!</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Your account has been successfully deleted. We&apos;re sad to see you go… please come back soon!
            </p>
            <button
              onClick={handleFinalGoodbye}
              className="w-full mt-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white px-4 py-3 text-sm font-bold shadow-lg shadow-red-950/50"
            >
              Goodbye 🥺
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
