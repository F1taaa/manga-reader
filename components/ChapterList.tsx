'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Chapter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Languages,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRelationship } from '@/lib/mangadex';
import { useMounted } from '@/hooks/use-mounted';
import { useUser } from '@/context/UserContext';

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedVolumes, setExpandedVolumes] = useState<Record<string, boolean>>({});
  const mounted = useMounted();
  const { history } = useUser();

  const processedVolumes = useMemo(() => {
    // Group by volume
    const volumes: Record<string, Chapter[]> = {};

    // Sort chapters initially for grouping
    const sorted = [...chapters].sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter || '0');
      const numB = parseFloat(b.attributes.chapter || '0');
      return numB - numA; // Default desc
    });

    sorted.forEach(chapter => {
      let vol = chapter.attributes.volume;
      if (!vol) {
        vol = chapter.attributes.chapter && parseFloat(chapter.attributes.chapter) === 0 ? 'Oneshots' : 'No Volume';
      }
      if (!volumes[vol]) volumes[vol] = [];
      volumes[vol].push(chapter);
    });

    // Sort volumes
    const volumeKeys = Object.keys(volumes).sort((a, b) => {
      if (a === 'No Volume' || a === 'Oneshots') return 1;
      if (b === 'No Volume' || b === 'Oneshots') return -1;
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      return sortOrder === 'desc' ? numB - numA : numA - numB;
    });

    return volumeKeys.map(key => ({
      name: key,
      chapters: volumes[key].sort((a, b) => {
        const numA = parseFloat(a.attributes.chapter || '0');
        const numB = parseFloat(b.attributes.chapter || '0');
        return sortOrder === 'desc' ? numB - numA : numA - numB;
      })
    }));
  }, [chapters, sortOrder]);

  const toggleVolume = (vol: string) => {
    setExpandedVolumes(prev => ({
      ...prev,
      [vol]: !prev[vol]
    }));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">No chapters available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.length >= 100 && (
        <div className="px-4 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground border border-border/50">
          Showing the latest 100 chapters. Older chapters may be available but are not listed here.
        </div>
      )}
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

      <div className="space-y-4">
        {processedVolumes.map((vol) => {
          const isNoVol = vol.name === 'No Volume' || vol.name === 'Oneshots';
          const isExpanded = expandedVolumes[vol.name] !== false; // Default expanded

          return (
            <div key={vol.name} className="space-y-2">
              <button
                onClick={() => toggleVolume(vol.name)}
                className="flex w-full items-center justify-between py-2 border-b border-border/50 hover:text-primary transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-foreground">
                    {isNoVol ? vol.name : `Volume ${vol.name}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({vol.chapters.length} chapters)
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <div className={cn(
                "grid gap-2 overflow-hidden transition-all",
                !isExpanded ? "max-h-0" : "max-h-[2000px]"
              )}>
                {vol.chapters.map((chapter) => {
                  const chapterNumber = chapter.attributes.chapter;
                  const title = chapter.attributes.title;
                  const publishDate = new Date(chapter.attributes.publishAt);
                  const relativeDate = mounted
                    ? formatDistanceToNow(publishDate, { addSuffix: true })
                    : '';
                  const scanGroup = getRelationship(chapter, 'scanlation_group');
                  const groupName = scanGroup?.attributes?.name || 'Unknown Group';

                  const isRead = mounted && history.some(h => h.chapterId === chapter.id);
                  const isExternalOnly = chapter.attributes.pages === 0 && !!chapter.attributes.externalUrl;

                  return (
                    <div
                      key={chapter.id}
                      className={cn(
                        "group flex items-center justify-between rounded-lg border transition-all overflow-hidden",
                        isRead
                          ? "border-primary/20 bg-primary/5 opacity-80"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <Link
                        href={isExternalOnly ? chapter.attributes.externalUrl! : `/manga/${mangaId}/chapter/${chapter.id}`}
                        target={isExternalOnly ? "_blank" : undefined}
                        className="flex flex-1 items-center gap-4 p-4 min-w-0"
                      >
                        <div className={cn(
                          "flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded text-[10px] font-black leading-none uppercase",
                          isRead
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <span className="mb-1 text-xs">{chapterNumber || 'Sp'}</span>
                          <span className="opacity-70">Ch.</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={cn(
                            "font-bold text-sm truncate",
                            isRead ? "text-primary/90" : "text-foreground"
                          )}>
                            {title || `Chapter ${chapterNumber}`}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-[10px] text-muted-foreground flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {groupName}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center">
                              <Languages className="h-3 w-3 mr-1 uppercase" />
                              {chapter.attributes.translatedLanguage}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {relativeDate}
                            </span>
                          </div>
                        </div>
                        {!isExternalOnly && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        )}
                      </Link>

                      {chapter.attributes.externalUrl && !isExternalOnly && (
                        <div className="px-4 py-2 border-l border-border/50">
                          <a
                            href={chapter.attributes.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary transition-colors block"
                            title="Read on external site"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}

                      {isExternalOnly && (
                        <div className="px-4 py-2 text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
