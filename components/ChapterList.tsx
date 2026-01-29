'use client';

import Link from 'next/link';
import type { Chapter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, BookMarked } from 'lucide-react';

interface ChapterListProps {
  chapters: Chapter[];
  mangaId: string;
}

export function ChapterList({ chapters, mangaId }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No chapters available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => {
        const chapterNumber = chapter.attributes.chapter || 'Special';
        const title = chapter.attributes.title || `Chapter ${chapterNumber}`;
        const publishDate = new Date(chapter.attributes.publishAt);
        const formattedDate = publishDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <Link
            key={chapter.id}
            href={`/manga/${mangaId}/chapter/${chapter.id}`}
          >
            <div className="group flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <BookMarked className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-foreground truncate">
                    {title}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </div>
                  <div>{chapter.attributes.pages} pages</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 ml-4 flex-shrink-0 group-hover:bg-primary/10"
              >
                Read
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
