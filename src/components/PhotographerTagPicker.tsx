"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import { CloseIcon } from "./Icons";

export type PhotographerTag = {
  id: string;
  username: string;
  name: string | null;
  avatarUrl: string | null;
  inviteToCollaborate: boolean;
};

type SearchUser = Omit<PhotographerTag, "inviteToCollaborate">;

export function PhotographerTagPicker({ selected, onChange }: { selected: PhotographerTag[]; onChange: (tags: PhotographerTag[]) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);

  useEffect(() => {
    if (!query.trim()) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        setResults(data.users ?? []);
      } catch {
        // This is an enhancement to publishing, not a reason to block the post.
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  function add(user: SearchUser) {
    if (selected.some((tag) => tag.id === user.id)) return;
    onChange([...selected, { ...user, inviteToCollaborate: false }]);
    setQuery("");
    setResults([]);
  }

  function remove(id: string) {
    onChange(selected.filter((tag) => tag.id !== id));
  }

  function toggleCollaboration(id: string) {
    onChange(selected.map((tag) => tag.id === id ? { ...tag, inviteToCollaborate: !tag.inviteToCollaborate } : tag));
  }

  const visibleResults = results.filter((user) => !selected.some((tag) => tag.id === user.id));

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">People in this post <span className="font-normal text-white/35">(optional)</span></h2>
        <p className="mt-1 text-xs leading-5 text-white/43">Tag a photographer, then optionally invite them to publish this frame together.</p>
      </div>

      <div className="relative mt-4">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a photographer to tag" className="w-full rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/10" />
        {query.trim() && visibleResults.length > 0 && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#18181d] p-1.5 shadow-2xl">
            {visibleResults.map((user) => (
              <button key={user.id} type="button" onClick={() => add(user)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.07]">
                <Avatar src={user.avatarUrl} username={user.username} size={32} />
                <span className="min-w-0"><span className="block truncate text-xs font-semibold text-white">{user.name || user.username}</span><span className="block truncate text-[10px] text-white/40">@{user.username}</span></span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 space-y-2">
          {selected.map((tag) => (
            <div key={tag.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.065] bg-black/15 p-2.5">
              <Avatar src={tag.avatarUrl} username={tag.username} size={30} />
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-white">{tag.name || tag.username}</span><span className="block truncate text-[10px] text-white/40">@{tag.username}</span></span>
              <button type="button" onClick={() => toggleCollaboration(tag.id)} aria-pressed={tag.inviteToCollaborate} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${tag.inviteToCollaborate ? "bg-amber-300/15 text-amber-100 ring-1 ring-amber-200/20" : "bg-white/[0.055] text-white/48 hover:bg-white/[0.09] hover:text-white"}`}>
                {tag.inviteToCollaborate ? "Collab invite on" : "Invite to collab"}
              </button>
              <button type="button" onClick={() => remove(tag.id)} aria-label={`Remove ${tag.username}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/38 transition hover:bg-red-500/15 hover:text-red-300"><CloseIcon className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
