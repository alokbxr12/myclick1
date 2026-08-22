import Image from "next/image";
import { UserSilhouetteIcon } from "./Icons";

export function Avatar({
  src,
  username,
  size = 40,
  className = "",
}: {
  src?: string | null;
  username: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white/20 dark:ring-white/10 ${
        src ? "bg-black/20" : "bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 text-zinc-300"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt={username} fill sizes={`${size}px`} className="object-cover" unoptimized />
      ) : (
        <UserSilhouetteIcon className="w-3/5 h-3/5 text-zinc-300 translate-y-[8%]" />
      )}
    </div>
  );
}
