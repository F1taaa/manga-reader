"use client";

import Image from "next/image";
import Link from "next/link";
import type { Manga } from "@/lib/types";
import { getCoverImageUrl } from "@/lib/mangadex";
import { BookOpen } from "lucide-react";

interface MangaCardProps {
  manga: Manga;
}

// ✅ Handles BOTH string and localized object
function getLocalizedString(
  value: string | Record<string, string> | undefined,
  fallback = "en",
): string {
  if (!value) return "Unknown";
  if (typeof value === "string") return value;
  return value[fallback] || Object.values(value)[0] || "Unknown";
}

export function MangaCard({ manga }: MangaCardProps) {
  const coverArt = manga.relationships.find((r) => r.type === "cover_art");
  const coverFileName = coverArt?.attributes?.fileName;

  const title = getLocalizedString(manga.attributes.title);

  const lastChapter =
    typeof manga.attributes.lastChapter === "string"
      ? manga.attributes.lastChapter
      : "N/A";

  const coverUrl = coverFileName
    ? getCoverImageUrl(coverFileName, "medium")
    : "/placeholder.svg?height=300&width=200";

  return (
    <Link href={`/manga/${manga.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-lg bg-card shadow-sm transition-all hover:shadow-lg active:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105 group-active:scale-95"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="p-2 sm:p-3">
          <h3 className="line-clamp-2 font-medium text-xs sm:text-sm leading-tight text-card-foreground">
            {title}
          </h3>

          <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{lastChapter}</span>
          </div>

          {manga.attributes.status && (
            <div className="mt-1.5 sm:mt-2">
              <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                {manga.attributes.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
