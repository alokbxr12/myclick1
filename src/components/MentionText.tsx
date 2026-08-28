import Link from "next/link";

const MENTION_PATTERN = /(@[a-zA-Z0-9_]{3,20})/g;

export function MentionText({ text }: { text: string }) {
  return (
    <>
      {text.split(MENTION_PATTERN).map((part, index) => {
        if (!part.startsWith("@")) return part;
        const username = part.slice(1);
        return (
          <Link key={`${username}-${index}`} href={`/profile/${username}`} className="font-semibold text-red-300 transition hover:text-red-200 hover:underline hover:underline-offset-2">
            {part}
          </Link>
        );
      })}
    </>
  );
}
