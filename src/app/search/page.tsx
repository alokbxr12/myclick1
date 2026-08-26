"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";

type UserResult = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = value.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => setResults(data.users ?? []))
        .finally(() => setLoading(false));
    }, 300);
  }

  const trimmedQuery = query.trim();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="glass-panel rounded-2xl p-6 shadow-lg">
      <h1 className="text-xl font-semibold mb-4">Find people</h1>
      <input
        autoFocus
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search by username or name…"
        className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm mb-6"
      />

      {loading && <p className="text-sm text-black/60 dark:text-white/60">Searching…</p>}

      <div className="flex flex-col gap-3">
        {results.map((user) => (
          <div key={user.id} className="flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">
            <Link href={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-red-300">
              <Avatar src={user.avatarUrl} username={user.username} size={40} />
              <div className="min-w-0">
                <p className="flex min-w-0 items-center gap-1 text-sm font-medium">
                  <span className="truncate">{user.username}</span>
                  <VerifiedBadge className="h-3.5 w-3.5" />
                </p>
                {user.name && <p className="text-xs text-black/60 dark:text-white/60">{user.name}</p>}
              </div>
            </Link>
            <FollowButton compact username={user.username} initialFollowing={user.isFollowing} />
          </div>
        ))}
      </div>

      {!loading && trimmedQuery && results.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">No users found.</p>
      )}
      </div>
    </div>
  );
}
