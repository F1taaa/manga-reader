'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Manga } from '@/lib/types';
import { getCoverImageUrl, getLocalizedString, getRelationship } from '@/lib/mangadex';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar } from 'lucide-react';

interface MangaDetailProps {
  manga: Manga;
}

export function MangaDetail({ manga }: MangaDetailProps) {
  const coverArt = getRelationship(manga, 'cover_art');
  const author = getRelationship(manga, 'author');
  const artist = getRelationship(manga, 'artist');

  const coverFileName = coverArt?.attributes?.fileName;
  const coverUrl = coverFileName
    ? getCoverImageUrl(manga.id, coverFileName, 'medium')
    : '/placeholder.svg?height=400&width=300';

  const title = getLocalizedString(manga.attributes.title);
  const description = getLocalizedString(manga.attributes.description);

  const lastChapter = manga.attributes.lastChapter || 'N/A';

  const altTitles = manga.attributes.altTitles ?? [];
  const tags = manga.attributes.tags ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="relative aspect-3/4 overflow-hidden rounded-lg shadow-lg">
            <Image src={coverUrl} alt={title} fill className="object-cover" priority />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>

            {altTitles.length > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                {altTitles.slice(0, 2).map((alt, idx) => (
                  <p key={idx}>{getLocalizedString(alt)}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {manga.attributes.status && (
              <Badge variant="secondary" className="capitalize">
                {manga.attributes.status}
              </Badge>
            )}
            {manga.attributes.year && (
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {manga.attributes.year}
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            {author?.attributes?.name && (
              <p><span className="font-semibold">Author:</span> {author.attributes.name}</p>
            )}
            {artist?.attributes?.name && (
              <p><span className="font-semibold">Artist:</span> {artist.attributes.name}</p>
            )}
          </div>

          <div className="flex gap-6 py-4 border-y border-border">
            <div>
              <div className="text-xs text-muted-foreground">Chapters</div>
              <div className="font-semibold">{lastChapter}</div>
            </div>
          </div>

          <Link href={`/manga/${manga.id}/chapters`}>
            <Button size="lg" className="w-full md:w-auto">
              <BookOpen className="h-5 w-5 mr-2" />
              Start Reading
            </Button>
          </Link>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">About</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline">
                {getLocalizedString(tag.attributes.name)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
