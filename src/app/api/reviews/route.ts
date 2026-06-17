import { NextResponse } from "next/server";
import { company } from "@/data/company";

const PLACES_API_BASE = "https://places.googleapis.com/v1/places";
const FIELD_MASK =
  "id,rating,userRatingCount,reviews.text,reviews.rating,reviews.publishTime,reviews.relativePublishTimeDescription,reviews.authorAttribution,reviews.googleMapsUri";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours — reviews don't change minute-by-minute

export interface PublicReview {
  text: string;
  rating: number;
  author: string;
  authorPhoto: string | null;
  authorUri: string | null;
  publishTime: string;
  relativeTime: string;
  googleMapsUri: string | null;
}

export interface ReviewsResponse {
  rating: number | null;
  total: number | null;
  reviews: PublicReview[];
  cached_at: string;
  source: "places_api" | "fallback";
}

interface CacheEntry {
  data: ReviewsResponse;
  cached_at: number;
}

let cache: CacheEntry | null = null;

function fromCache(): ReviewsResponse | null {
  if (!cache) return null;
  if (Date.now() - cache.cached_at > CACHE_TTL_MS) {
    cache = null;
    return null;
  }
  return cache.data;
}

export async function GET(): Promise<NextResponse> {
  const cached = fromCache();
  if (cached) return NextResponse.json(cached);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { rating: null, total: null, reviews: [], cached_at: new Date().toISOString(), source: "fallback" },
      { status: 200 },
    );
  }

  try {
    const res = await fetch(`${PLACES_API_BASE}/${company.googlePlaceId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      // Use 1hr edge cache as a second safety net in case the in-memory cache is cold
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Places API failed:", res.status, await res.text());
      return NextResponse.json(
        { rating: null, total: null, reviews: [], cached_at: new Date().toISOString(), source: "fallback" },
        { status: 200 },
      );
    }

    const data = await res.json();
    const reviews: PublicReview[] = (data.reviews ?? [])
      .map((r: Record<string, unknown>) => {
        const text = r.text as { text?: string } | undefined;
        const author = r.authorAttribution as
          | { displayName?: string; photoUri?: string; uri?: string }
          | undefined;
        return {
          text: text?.text ?? "",
          rating: (r.rating as number) ?? 5,
          author: author?.displayName ?? "Google reviewer",
          authorPhoto: author?.photoUri ?? null,
          authorUri: author?.uri ?? null,
          publishTime: (r.publishTime as string) ?? "",
          relativeTime: (r.relativePublishTimeDescription as string) ?? "",
          googleMapsUri: (r.googleMapsUri as string) ?? null,
        };
      })
      // 5-star only + newest first (Justin's preference; Places API otherwise
      // returns reviews in its own "most relevant" order).
      .filter((r: PublicReview) => r.rating === 5)
      .sort((a: PublicReview, b: PublicReview) => b.publishTime.localeCompare(a.publishTime));

    const response: ReviewsResponse = {
      rating: (data.rating as number) ?? null,
      total: (data.userRatingCount as number) ?? null,
      reviews,
      cached_at: new Date().toISOString(),
      source: "places_api",
    };

    cache = { data: response, cached_at: Date.now() };
    return NextResponse.json(response);
  } catch (err) {
    console.error("Places fetch error:", err);
    return NextResponse.json(
      { rating: null, total: null, reviews: [], cached_at: new Date().toISOString(), source: "fallback" },
      { status: 200 },
    );
  }
}
