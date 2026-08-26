"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PhotoCollageBackground } from "@/components/PhotoCollageBackground";
import { BrandMark } from "@/components/BrandMark";
import { TermsModal } from "@/components/TermsModal";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const accountCreated = searchParams.get("accountCreated") === "1";
  const [showAccountCreated, setShowAccountCreated] = useState(accountCreated);

  useEffect(() => {
    if (!accountCreated) return;
    const timer = window.setTimeout(() => setShowAccountCreated(false), 6000);
    return () => window.clearTimeout(timer);
  }, [accountCreated]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      identifier: email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("We couldn’t match those details. Check them and try again.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/feed");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white selection:bg-red-500/35">
      {showAccountCreated && (
        <div
          role="status"
          aria-live="polite"
          className="auth-enter fixed left-1/2 top-5 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-400/20 bg-[#111914] px-4 py-3.5 text-emerald-50 shadow-[0_20px_60px_-22px_rgba(16,185,129,0.7)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/12 text-emerald-400">
            <SuccessIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Account is created</p>
            <p className="mt-0.5 text-xs text-emerald-100/58">Now sign in to enter your gallery.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAccountCreated(false)}
            aria-label="Dismiss account-created message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-100/40 transition hover:bg-white/[0.06] hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.18fr)_minmax(430px,0.82fr)]">
        <section className="relative hidden min-h-screen overflow-hidden lg:flex" aria-label="MyClick photography community">
          <PhotoCollageBackground />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14 2xl:p-16">
            <Brand />

            <div className="auth-enter max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                Made for the eye behind the lens
              </div>

              <h2 className="max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] text-white xl:text-6xl 2xl:text-7xl">
                Every frame finds
                <span className="block italic text-white/72">its people.</span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/68 xl:text-lg">
                A focused community for photographers to publish meaningful work,
                trade perspective, and follow the stories behind every image.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3 text-xs text-white/65">
                {["Portrait", "Street", "Wildlife", "Landscape"].map((genre) => (
                  <span key={genre} className="rounded-full border border-white/12 bg-white/[0.07] px-3 py-1.5 backdrop-blur-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-6 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span>No noise. Just photographs worth seeing.</span>
              <span className="hidden text-right xl:block">City after rain · 35mm · f/1.8</span>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="absolute inset-0 lg:hidden">
            <PhotoCollageBackground />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
          </div>

          <div className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
          <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-red-700/10 blur-3xl" />

          <div className="auth-enter relative z-10 w-full max-w-[440px]">
            <div className="mb-9 lg:hidden">
              <Brand compact />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#111114]/92 p-6 shadow-[0_32px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <div className="mb-8">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-red-400">
                  Welcome back
                </p>
                <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  Sign in to your gallery
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/52">
                  Pick up where your last frame left off.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-semibold tracking-wide text-white/72">
                    Email or username
                  </label>
                  <div className="group relative">
                    <AtIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32 transition-colors group-focus-within:text-red-400" />
                    <input
                      id="email"
                      type="text"
                      required
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.045] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-red-500/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <label htmlFor="password" className="text-xs font-semibold tracking-wide text-white/72">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs font-medium text-white/42 transition hover:text-white">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="group relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32 transition-colors group-focus-within:text-red-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      aria-describedby={error ? "login-error" : undefined}
                      className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.045] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-red-500/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-red-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.07] hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <EyeIcon crossed={showPassword} className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </div>

                {error && (
                  <div id="login-error" role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-3 text-xs leading-5 text-red-200">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-1 flex h-[52px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(220,38,38,0.85)] transition hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-[0_16px_38px_-12px_rgba(220,38,38,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111114] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Enter MyClick
                      <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">New here?</span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <Link
                href="/register"
                className="flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.025] text-sm font-semibold text-white/78 transition hover:border-white/25 hover:bg-white/[0.065] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Create your photographer profile
              </Link>

              <p className="mt-7 text-center text-[11px] leading-5 text-white/28">
                By continuing, you agree to our{" "}
                <button onClick={() => setShowTerms(true)} className="underline decoration-white/20 underline-offset-4 transition hover:text-white/60">
                  Terms &amp; Conditions
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className={`${compact ? "h-10 w-11" : "h-11 w-12"} relative flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl" />
        <BrandMark className="relative h-9 w-11" />
      </div>
      <div>
        <p className="text-xl font-bold tracking-[-0.04em] text-white">
          My<span className="bg-gradient-to-r from-[#ff9a64] via-[#fb5d68] to-[#ee4768] bg-clip-text text-transparent">Click</span>
        </p>
        {!compact && <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/42">Capture · Share · Inspire</p>}
      </div>
    </div>
  );
}

function AtIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.1 6.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ crossed, className = "" }: { crossed: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" />
      {crossed && <path d="m4 4 16 16" strokeLinecap="round" />}
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SuccessIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
