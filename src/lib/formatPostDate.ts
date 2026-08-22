// Formats a post's timestamp as "DD MMM", e.g. "22 Aug".
export function formatPostDate(isoDate: string): string {
  const postDate = new Date(isoDate);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(postDate);
}

// Comments show an exact local date and time so conversations are easy to follow.
export function formatCommentDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}
