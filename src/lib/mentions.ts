const MENTION_PATTERN = /(^|[^a-zA-Z0-9_])@([a-zA-Z0-9_]{3,20})/g;

// Returns unique usernames mentioned with @username. Usernames are deliberately
// kept aligned with the account username rules.
export function extractMentionedUsernames(text: string | null | undefined) {
  if (!text) return [];
  const usernames = new Set<string>();
  for (const match of text.matchAll(MENTION_PATTERN)) usernames.add(match[2]);
  return [...usernames];
}
