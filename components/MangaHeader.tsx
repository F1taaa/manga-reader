'use client';

import Image from 'next/image';
import type { Manga } from '@/lib/types';
import { getCoverImageUrl, getLocalizedString, getRelationship } from '@/lib/mangadex';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Share2, Heart, Plus, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useMounted } from '@/hooks/use-mounted';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReadingStatus } from '@/lib/types';

interface MangaHeaderProps {
  manga: Manga;
  firstChapterId?: string;
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_read: 'Plan to Read',
};

export function MangaHeader({ manga, firstChapterId }: MangaHeaderProps) {
  const mounted = useMounted();
  const { library, history, addToLibrary, removeFromLibrary, updateLibraryStatus } = useUser();
  const coverArt = getRelationship(manga, 'cover_art');
  const author = getRelationship(manga, 'author');

  const coverFileName = coverArt?.attributes?.fileName;
  const coverUrl = coverFileName
    ? getCoverImageUrl(manga.id, coverFileName)
    : '/placeholder.svg?height=600&width=400';

  const title = getLocalizedString(manga.attributes.title);
  const status = manga.attributes.status;
  const year = manga.attributes.year;
  const authorName = author?.attributes?.name || 'Unknown Author';

  const libraryItem = mounted ? library[manga.id] : null;
  const isInLibrary = !!libraryItem;

  const lastRead = mounted
    ? history.find(h => h.mangaId === manga.id)
    : null;

  const handleToggleLibrary = () => {
    if (isInLibrary) {
      removeFromLibrary(manga.id);
    } else {
      addToLibrary({
        mangaId: manga.id,
        mangaTitle: title,
        coverArt: coverUrl,
        status: 'plan_to_read',
      });
    }
  };

  const handleStatusChange = (status: ReadingStatus) => {
    if (!isInLibrary) {
      addToLibrary({
        mangaId: manga.id,
        mangaTitle: title,
        coverArt: coverUrl,
        status,
      });
    } else {
      updateLibraryStatus(manga.id, status);
    }
  };

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

            <p className="text-lg text-muted-foreground">
              {authorName}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 md:justify-start">
              {lastRead ? (
                <Button size="lg" className="px-8" asChild>
                  <Link href={`/manga/${manga.id}/chapter/${lastRead.chapterId}`}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Continue Ch. {lastRead.chapterNumber}
                  </Link>
                </Button>
              ) : firstChapterId ? (
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

              <div className="flex items-center gap-1">
                <Button
                  size="lg"
                  variant={isInLibrary ? "secondary" : "outline"}
                  onClick={handleToggleLibrary}
                  className="rounded-r-none border-r-0"
                >
                  {isInLibrary ? (
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <Plus className="mr-2 h-5 w-5" />
                  )}
                  {isInLibrary ? STATUS_LABELS[libraryItem.status] : 'Add to Library'}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="lg"
                      variant={isInLibrary ? "secondary" : "outline"}
                      className="rounded-l-none px-2"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.entries(STATUS_LABELS) as [ReadingStatus, string][]).map(([status, label]) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="flex items-center justify-between"
                      >
                        {label}
                        {isInLibrary && libraryItem.status === status && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    ))}
                    {isInLibrary && (
                      <DropdownMenuItem
                        onClick={() => removeFromLibrary(manga.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Remove from Library
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
