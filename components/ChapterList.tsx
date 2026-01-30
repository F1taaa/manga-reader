'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Chapter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowUpDown,
  BookMarked,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const { history } = useUser();
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({});

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">No chapters available</p>
      </div>
    );
  }

  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseFloat(a.attributes.chapter || '0');
    const numB = parseFloat(b.attributes.chapter || '0');
    return sortOrder === 'desc' ? numB - numA : numA - numB;
  });

  // Group by volume
  const volumes: Record<string, Chapter[]> = {};
  sortedChapters.forEach(chapter => {
    const vol = chapter.attributes.volume || 'No Volume';
    if (!volumes[vol]) volumes[vol] = [];
    volumes[vol].push(chapter);
  });

  const toggleVolume = (vol: string) => {
    setExpandedVolumes(prev => ({
      ...prev,
      [vol]: !prev[vol]
    }));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown className="mr-2 h-3 w-3" />
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </Button>
      </div>

      <div className="space-y-3">
        {Object.entries(volumes).map(([volume, volChapters]) => (
          <div key={volume} className="space-y-2">
            {volume !== 'No Volume' && (
              <button
                onClick={() => toggleVolume(volume)}
                className="flex w-full items-center justify-between py-2 border-b border-border/50 hover:text-primary transition-colors"
              >
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Volume {volume}
                </span>
                {expandedVolumes[volume] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}

            <div className={cn(
              "grid gap-2",
              volume !== 'No Volume' && !expandedVolumes[volume] && expandedVolumes[volume] !== undefined ? "hidden" : "block"
            )}>
              {volChapters.map((chapter) => {
                const chapterNumber = chapter.attributes.chapter;
                const title = chapter.attributes.title;
                const publishDate = new Date(chapter.attributes.publishAt);
                const relativeDate = formatDistanceToNow(publishDate, { addSuffix: true });
                const isRead = history.some(h => h.chapterId === chapter.id);

                return (
                  <Link
                    key={chapter.id}
                    href={`/manga/${mangaId}/chapter/${chapter.id}`}
                    className="group"
                  >
                    <div className={cn(
                      "flex items-center justify-between rounded-md border p-4 transition-all hover:border-primary/50 hover:bg-muted/50",
                      isRead ? "bg-muted/30 border-border/50" : "border-border"
                    )}>
                      <div className="flex flex-1 items-center gap-4 min-w-0">
                        <div className={cn(
                          "flex h-8 w-12 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors",
                          isRead
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          {chapterNumber || 'Sp'}
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn(
                            "font-medium truncate transition-colors",
                            isRead ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {title || `Chapter ${chapterNumber}`}
                            {isRead && (
                              <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary/70">Read</span>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {relativeDate} • {chapter.attributes.pages} pages
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {chapter.attributes.externalUrl && (
                          <a
                            href={chapter.attributes.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}