"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar } from "./Avatar";
import { HomeIcon, SearchIcon, PlusSquareIcon, LogOutIcon } from "./Icons";
import { BrandMark } from "./BrandMark";
import { VerifiedBadge } from "./VerifiedBadge";

const navItems = [
  { href: "/feed", label: "Feed", icon: HomeIcon },
  { href: "/search", label: "Discover", icon: SearchIcon },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated") return null;
  if (["/login", "/register", "/forgot-password"].includes(pathname)) return null;
  if (pathname.startsWith("/reset-password")) return null;

  const profileHref = `/profile/${session.user.username}`;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="relative sticky top-0 z-40 border-b border-white/[0.07] bg-[#08090b]/88 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.95)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red-400/45 before:to-transparent">
        <nav className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/feed" className="group flex items-center gap-2.5" aria-label="MyClick feed">
            <div className="relative flex h-10 w-11 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl opacity-0 transition group-hover:opacity-100" />
              <BrandMark className="relative h-9 w-11 transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04]" />
            </div>
            <div>
              <p className="text-[18px] font-bold leading-none tracking-[-0.045em] text-white">
                My<span className="bg-gradient-to-r from-[#ff9a64] via-[#fb5d68] to-[#ee4768] bg-clip-text text-transparent">Click</span>
              </p>
              <p className="mt-1 hidden text-[8px] font-semibold uppercase tracking-[0.22em] text-white/32 sm:block">
                Capture · Share · Inspire
              </p>
            </div>
          </Link>

          <div className="hidden items-center rounded-xl border border-white/[0.07] bg-white/[0.025] p-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  isActive(href)
                    ? "bg-white/[0.09] text-white shadow-sm"
                    : "text-white/45 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                <Icon className="h-[17px] w-[17px]" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/upload"
              className="hidden h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white shadow-[0_10px_24px_-12px_rgba(220,38,38,0.9)] transition hover:-translate-y-0.5 hover:bg-red-500 sm:flex"
            >
              <PlusSquareIcon className="h-[17px] w-[17px]" />
              Publish
            </Link>

            <Link
              href={profileHref}
              aria-label="My profile"
              className={`flex items-center gap-2 rounded-xl border px-1.5 py-1.5 transition hover:bg-white/[0.055] sm:pr-3 ${
                isActive(profileHref) ? "border-red-500/35 bg-red-500/[0.08]" : "border-transparent"
              }`}
            >
              <Avatar src={session.user.avatarUrl} username={session.user.username} size={30} />
              <span className="hidden min-w-0 max-w-28 items-center gap-1 text-xs font-semibold text-white/72 sm:flex">
                <span className="truncate">{session.user.username}</span>
                <VerifiedBadge className="h-3 w-3" />
              </span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
            >
              <LogOutIcon className="h-[17px] w-[17px]" />
            </button>
          </div>
        </nav>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid h-[66px] grid-cols-4 rounded-[1.35rem] border border-white/10 bg-[#101014]/92 px-2 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl md:hidden" aria-label="Mobile navigation">
        <MobileNavLink href="/feed" label="Feed" active={isActive("/feed")}>
          <HomeIcon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href="/search" label="Discover" active={isActive("/search")}>
          <SearchIcon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href="/upload" label="Publish" active={isActive("/upload")} featured>
          <PlusSquareIcon className="h-5 w-5" />
        </MobileNavLink>
        <MobileNavLink href={profileHref} label="Profile" active={isActive(profileHref)}>
          <Avatar src={session.user.avatarUrl} username={session.user.username} size={22} className="ring-0" />
        </MobileNavLink>
      </nav>
    </>
  );
}

function MobileNavLink({
  href,
  label,
  active,
  featured = false,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition ${
        active ? "text-white" : "text-white/38"
      }`}
    >
      <span className={`${featured ? "flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.9)]" : ""}`}>
        {children}
      </span>
      <span>{label}</span>
      {active && !featured && <span className="absolute top-1.5 h-1 w-1 rounded-full bg-red-400" />}
    </Link>
  );
}
