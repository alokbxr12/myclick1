"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { BrandMark } from "@/components/BrandMark";
import { PhotoCollageBackground } from "@/components/PhotoCollageBackground";
import { getImageUploadError } from "@/lib/image-upload-constraints";

const fieldClassName = "h-12 w-full rounded-xl border border-white/[0.11] bg-white/[0.035] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/[0.17] focus:border-red-400/65 focus:bg-white/[0.055] focus:ring-4 focus:ring-red-500/10";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected) {
      const validationError = getImageUploadError(selected);
      if (validationError) {
        setAvatar(null);
        setAvatarPreview(null);
        setError(validationError);
        event.target.value = "";
        return;
      }
    }

    setAvatar(selected);
    setAvatarPreview(selected ? URL.createObjectURL(selected) : null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    if (avatar) formData.append("avatar", avatar);

    const response = await fetch("/api/register", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?accountCreated=1");
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#09090b] text-white selection:bg-red-500/35">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.18fr)_minmax(430px,0.82fr)]">
        <section className="relative hidden min-h-screen overflow-hidden lg:flex" aria-label="MyClick photography community">
          <PhotoCollageBackground />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14 2xl:p-16">
            <Brand />

            <div className="max-w-xl pb-8">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-red-300">Make room for your point of view</p>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white xl:text-6xl">
                Every photographer starts with one frame.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/64 xl:text-[17px]">
                Build a space for the images you notice, the stories you want to tell, and the people who understand the difference.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 border-t border-white/14 pt-6 text-[11px] leading-4 text-white/54">
              <p><span className="mb-1 block text-white/86">01</span>Your own gallery</p>
              <p><span className="mb-1 block text-white/86">02</span>A curious community</p>
              <p><span className="mb-1 block text-white/86">03</span>Frames with feeling</p>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-10 xl:px-14">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-red-600/[0.10] blur-3xl" />
            <div className="absolute -bottom-40 -left-28 h-72 w-72 rounded-full bg-orange-400/[0.07] blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
          </div>

          <main className="relative w-full max-w-[29rem]">
            <div className="mb-8 lg:hidden">
              <Brand compact />
            </div>

            <div className="mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">Join the community</p>
              <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">Create your photographer profile.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/46">A few details now—your photographs can do the rest of the talking.</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[1.7rem] border border-white/[0.09] bg-[#111116]/82 p-5 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[0.075] bg-white/[0.025] p-3.5">
                <label htmlFor="avatar" className="group relative shrink-0 cursor-pointer">
                  <div className="rounded-full bg-gradient-to-br from-red-400 via-red-600 to-amber-500 p-[2px]">
                    <div className="rounded-full bg-[#17171d] p-[2px]">
                      <Avatar src={avatarPreview} username={username || "?"} size={56} className="ring-0" />
                    </div>
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">Edit</span>
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="min-w-0">
                  <label htmlFor="avatar" className="cursor-pointer text-sm font-semibold text-white transition hover:text-red-300">
                    {avatarPreview ? "Profile photo selected" : "Add a profile photo"}
                  </label>
                  <p className="mt-1 text-[11px] leading-4 text-white/40">Optional, but it helps your work feel recognisable. JPG, PNG, WEBP or GIF · max 4 MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Username" htmlFor="username">
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="yourframe"
                    className={fieldClassName}
                  />
                </Field>
                <Field label="Full name" optional htmlFor="name">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="How people know you"
                    className={fieldClassName}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Email" htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={fieldClassName}
                  />
                </Field>
                <Field label="Password" htmlFor="password">
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className={fieldClassName}
                  />
                </Field>
              </div>

              {error && (
                <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-3.5 py-3 text-xs leading-5 text-red-200" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#f15b65] to-[#ed466b] px-4 text-sm font-bold text-white shadow-[0_16px_34px_-16px_rgba(241,91,101,0.95)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(241,91,101,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating your profile…" : "Create my profile"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/42">
              Already part of MyClick?{" "}
              <Link href="/login" className="font-semibold text-white/80 underline decoration-white/20 underline-offset-4 transition hover:text-red-300 hover:decoration-red-300/60">
                Sign in
              </Link>
            </p>
          </main>
        </section>
      </div>
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

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-white/74">{label}</label>
        {optional && <span className="text-[10px] text-white/30">Optional</span>}
      </div>
      {children}
    </div>
  );
}
