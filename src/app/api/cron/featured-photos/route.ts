import { NextResponse } from "next/server";
import { getDailyFeaturedPhotos } from "@/lib/daily-featured-photos";

export const dynamic = "force-dynamic";

// Vercel sends this header automatically when the project's CRON_SECRET is set.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const featuredPhotos = await getDailyFeaturedPhotos();
  return NextResponse.json({ featuredCount: featuredPhotos.length });
}
