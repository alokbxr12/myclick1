import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPostImages } from "@/lib/post-images";

const FEATURED_TIME_ZONE = process.env.FEATURED_PHOTOS_TIME_ZONE ?? "Asia/Kolkata";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const FEATURED_POST_SELECT = {
  id: true,
  imageUrl: true,
  caption: true,
  createdAt: true,
  author: { select: { id: true, username: true, name: true, avatarUrl: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { id: true, imageUrl: true, sortOrder: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedDateParts(date: Date): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FEATURED_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function dateKeyFromParts({ year, month, day }: Pick<ZonedDateParts, "year" | "month" | "day">): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day) + days * DAY_IN_MILLISECONDS);

  return dateKeyFromParts({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

// Prisma stores timestamps in UTC. Convert a platform-local midnight into its
// UTC instant so the daily window changes at midnight in the configured zone.
function localMidnight(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const localTimestamp = Date.UTC(year, month - 1, day);
  const offsetAt = (instant: Date) => {
    const parts = getZonedDateParts(instant);
    return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant.getTime();
  };

  const firstPass = new Date(localTimestamp - offsetAt(new Date(localTimestamp)));
  return new Date(localTimestamp - offsetAt(firstPass));
}

function getFeaturedWindow(now = new Date()) {
  const featureDateKey = dateKeyFromParts(getZonedDateParts(now));
  const sourceDateKey = shiftDateKey(featureDateKey, -1);

  return {
    dateKey: featureDateKey,
    sourceStartsAt: localMidnight(sourceDateKey),
    sourceEndsAt: localMidnight(featureDateKey),
  };
}

async function findSnapshot(dateKey: string) {
  return prisma.featuredPhotoDay.findUnique({
    where: { dateKey },
    select: {
      photos: {
        orderBy: { rank: "asc" },
        select: {
          rank: true,
          likesAtSelection: true,
          post: { select: FEATURED_POST_SELECT },
        },
      },
    },
  });
}

function isDateKeyConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// The first feed request after midnight creates the day's snapshot. Persisting
// it keeps the three photographs and their ranking stable for the full day.
export async function getDailyFeaturedPhotos() {
  const { dateKey, sourceStartsAt, sourceEndsAt } = getFeaturedWindow();
  let snapshot = await findSnapshot(dateKey);

  if (!snapshot) {
    const candidates = await prisma.post.findMany({
      where: { createdAt: { gte: sourceStartsAt, lt: sourceEndsAt } },
      orderBy: { createdAt: "desc" },
      select: {
        ...FEATURED_POST_SELECT,
        _count: {
          select: {
            likes: { where: { createdAt: { gte: sourceStartsAt, lt: sourceEndsAt } } },
            comments: true,
          },
        },
      },
    });
    const selectedCandidates = candidates
      .sort((first, second) => (
        second._count.likes - first._count.likes
        || second.createdAt.getTime() - first.createdAt.getTime()
        || first.id.localeCompare(second.id)
      ))
      .slice(0, 3);

    try {
      await prisma.featuredPhotoDay.create({
        data: {
          dateKey,
          sourceStartsAt,
          sourceEndsAt,
          photos: {
            create: selectedCandidates.map((post, index) => ({
              postId: post.id,
              rank: index + 1,
              likesAtSelection: post._count.likes,
            })),
          },
        },
      });
    } catch (error) {
      // A simultaneous feed request may have created the same daily snapshot.
      if (!isDateKeyConflict(error)) throw error;
    }

    snapshot = await findSnapshot(dateKey);
  }

  return (snapshot?.photos ?? []).map(({ post, rank, likesAtSelection }) => ({
    ...post,
    images: getPostImages(post),
    rank,
    likesAtSelection,
  }));
}
