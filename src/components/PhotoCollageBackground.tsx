import Image from "next/image";

// Original project artwork generated for MyClick's public sign-in experience.
export function PhotoCollageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#08090c]" aria-hidden="true">
      <Image
        src="/login-photography-hero.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="scale-[1.015] object-cover object-[52%_center]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-black/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_35%,transparent_0%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0.7)_100%)]" />
      <div className="auth-grain absolute inset-0 opacity-25 mix-blend-soft-light" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-1/3 translate-y-1/3 rounded-full bg-red-600/20 blur-3xl" />
    </div>
  );
}
