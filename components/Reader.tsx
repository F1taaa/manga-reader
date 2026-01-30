'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { getChapterPageUrl } from '@/lib/mangadex';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';

interface ReaderProps {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: string;
  volumeNumber: string | null;
  pages: string[];
  baseUrl: string;
  hash: string;
  nextChapterId?: string;
  prevChapterId?: string;
}

export function Reader({
  mangaId,
  mangaTitle,
  chapterId,
  chapterNumber,
  volumeNumber,
  pages,
  baseUrl,
  hash,
  nextChapterId,
  prevChapterId,
}: ReaderProps) {
  const [page, setPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { history, addToHistory } = useUser();

  const pageUrl = getChapterPageUrl(baseUrl, hash, pages[page]);

  // Load last page from history on mount
  useEffect(() => {
    const historyItem = history.find(h => h.chapterId === chapterId);
    if (historyItem && historyItem.page >= 0 && historyItem.page < pages.length) {
      setPage(historyItem.page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync with history
  useEffect(() => {
    if (mangaId && chapterId) {
      addToHistory({
        mangaId,
        mangaTitle,
        chapterId,
        chapterNumber,
        volumeNumber,
        coverArt: '', // Will be updated if manga is in library
      }, page, pages.length);
    }
  }, [page, chapterId, mangaId]);

  // Handle scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Reset loading state when page changes
  useEffect(() => {
    setLoading(true);
  }, [page]);

  const goToPrevious = () => {
    if (page > 0) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (prevChapterId) {
      router.push(`/manga/${mangaId}/chapter/${prevChapterId}`);
    }
  };

  const goToNext = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (nextChapterId) {
      router.push(`/manga/${mangaId}/chapter/${nextChapterId}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, pages.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 bg-black select-none"
    >
      {/* Reader Area */}
      <div className="relative flex-1 flex flex-col items-center justify-start min-h-[calc(100vh-64px)]">
        {/* Click zones for navigation */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-west-resize"
            onClick={goToPrevious}
            title="Previous Page (Left Arrow)"
          />
          <div
            className="w-1/3 h-full cursor-zoom-in"
            onClick={toggleFullscreen}
          />
          <div
            className="w-1/3 h-full cursor-east-resize"
            onClick={goToNext}
            title="Next Page (Right Arrow)"
          />
        </div>

        {/* The Image */}
        <div className="relative w-full max-w-4xl flex-1 flex flex-col items-center">
          <img
            src={pageUrl}
            alt={`Page ${page + 1}`}
            className={cn(
              "w-full h-auto object-contain transition-opacity duration-300",
              loading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setLoading(false)}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>
          )}
        </div>
      </div>

      {/* Persistent Bottom Controls */}
      <div className="sticky bottom-0 z-20 flex flex-col items-center gap-4 bg-black/90 p-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={page === 0}
            className="h-12 w-12 rounded-full text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">
              {page + 1} / {pages.length}
            </span>
            <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((page + 1) / pages.length) * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={page === pages.length - 1}
            className="h-12 w-12 rounded-full text-white hover:bg-white/10"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="text-xs text-gray-500 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="mr-2 h-4 w-4" /> : <Maximize2 className="mr-2 h-4 w-4" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} (F)
        </Button>
      </div>
    </div>
  );
}