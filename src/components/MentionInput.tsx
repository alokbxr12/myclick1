"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "./Avatar";

type SearchUser = { id: string; username: string; name: string | null; avatarUrl: string | null };

function findActiveMention(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);
  if (!match) return null;
  return { query: match[1], start: cursor - match[1].length - 1, end: cursor };
}

type MentionInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  className: string;
  rows?: number;
  menuPlacement?: "top" | "bottom";
};

export function MentionInput({ value, onChange, placeholder, maxLength, className, rows, menuPlacement = "bottom" }: MentionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(value.length);
  const [results, setResults] = useState<SearchUser[]>([]);
  const activeMention = useMemo(() => findActiveMention(value, cursor), [cursor, value]);

  useEffect(() => {
    if (!activeMention?.query) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(activeMention.query)}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        setResults(data.users ?? []);
      } catch {
        // Searching for a mention is optional; typing remains uninterrupted.
      }
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [activeMention?.query]);

  function updateCursor(element: HTMLInputElement | HTMLTextAreaElement) {
    setCursor(element.selectionStart ?? element.value.length);
  }

  function chooseUser(user: SearchUser) {
    if (!activeMention) return;
    const next = `${value.slice(0, activeMention.start)}@${user.username} ${value.slice(activeMention.end)}`;
    const nextCursor = activeMention.start + user.username.length + 2;
    onChange(next);
    window.requestAnimationFrame(() => {
      const field = rows ? textareaRef.current : inputRef.current;
      field?.focus();
      field?.setSelectionRange(nextCursor, nextCursor);
      setCursor(nextCursor);
    });
  }

  const fieldProps = {
    value,
    placeholder,
    maxLength,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(event.target.value);
      updateCursor(event.target);
    },
    onClick: (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => updateCursor(event.currentTarget),
    onKeyUp: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => updateCursor(event.currentTarget),
    onSelect: (event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => updateCursor(event.currentTarget),
    className,
  };

  return (
    <div className="relative min-w-0 flex-1">
      {rows ? <textarea {...fieldProps} ref={textareaRef} rows={rows} /> : <input {...fieldProps} ref={inputRef} />}
      {activeMention?.query && results.length > 0 && (
        <div className={`absolute inset-x-0 z-40 overflow-hidden rounded-2xl border border-red-300/30 bg-[#191117]/[0.99] p-2 shadow-[0_22px_55px_-18px_rgba(0,0,0,1)] ring-1 ring-black/35 ${menuPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <p className="px-2.5 pb-1.5 pt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-red-200/70">Mention a photographer</p>
          {results.map((user) => (
            <button key={user.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseUser(user)} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2.5 text-left transition hover:border-red-300/20 hover:bg-red-500/[0.11]">
              <Avatar src={user.avatarUrl} username={user.username} size={32} className="ring-red-200/20" />
              <span className="min-w-0"><span className="block truncate text-xs font-bold text-white">{user.name || user.username}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-red-100/75">@{user.username}</span></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
