// Formats a post's timestamp as "DD MMM", e.g. "22 Aug".
export function formatPostDate(isoDate: string): string {
  const postDate = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(postDate);
}
