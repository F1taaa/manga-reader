"use client";

import Image from "next/image";
import type { Manga } from "@/lib/types";
import {
  getCoverImageUrl,
  getLocalizedString,
  getRelationship,
} from "@/lib/mangadex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Share2, Heart } from "lucide-react";
import Link from "next/link";

interface MangaHeaderProps {
  manga: Manga;
  firstChapterId?: string;
}

export function MangaHeader({ manga, firstChapterId }: MangaHeaderProps) {
  const coverArt = getRelationship(manga, "cover_art");
  const author = getRelationship(manga, "author");

  const coverFileName = coverArt?.attributes?.fileName;
  const coverUrl = coverFileName
    ? getCoverImageUrl(manga.id, coverFileName)
    : "/placeholder.svg?height=600&width=400";

  const title = getLocalizedString(manga.attributes.title);
  const status = manga.attributes.status;
  const year = manga.attributes.year;
  const authorName = author?.attributes?.name || "Unknown Author";

  return (
    <div className="relative w-full border-b border-border bg-background py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Cover Image */}
          <div className="mx-auto w-48 flex-shrink-0 overflow-hidden rounded-lg shadow-sm md:mx-0 md:w-64">
            <div className="aspect-[3/4] relative">
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-grow flex-col space-y-4 text-center md:text-left">
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {status && (
                <Badge variant="secondary" className="capitalize">
                  {status}
                </Badge>
              )}
              {year && (
                <Badge variant="outline">
                  <Calendar className="mr-1 h-3 w-3" />
                  {year}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">
                {manga.attributes.contentRating}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>

            <p className="text-lg text-muted-foreground">{authorName}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 md:justify-start">
              {firstChapterId ? (
                <Button size="lg" className="px-8" asChild>
                  <Link href={`/manga/${manga.id}/chapter/${firstChapterId}`}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Read Now
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="px-8" disabled>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Read Now
                </Button>
              )}
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-5 w-5" />
                Add to Library
              </Button>
              <Button size="icon" variant="ghost">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
