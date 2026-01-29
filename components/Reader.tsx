'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ScrollText,
  Copy
} from 'lucide-react';
import { getChapterPageUrl } from '@/lib/mangadex';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>('continuous');
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToHistory, history } = useUser();
  const router = useRouter();

  // Load last page if returning to this chapter
  useEffect(() => {
    const lastPos = history.find(h => h.chapterId === chapterId);
    if (lastPos && viewMode === 'single') {
      setPage(lastPos.pageNumber);
    }
  }, [chapterId, viewMode]);

  // Track history
  useEffect(() => {
    addToHistory({
      mangaId,
      mangaTitle,
      chapterId,
      chapterNumber,
      volumeNumber,
      pageNumber: page,
    });
  }, [page, chapterId]);

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
      if (viewMode === 'single') {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }
      if (e.key === 'f') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, pages.length, viewMode, nextChapterId, prevChapterId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Intersection observer for continuous scroll
  useEffect(() => {
    if (viewMode !== 'continuous') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setPage(index);
          }
        });
      },
      { threshold: 0.2 }
    );

    const images = document.querySelectorAll('.chapter-page');
    images.forEach((img) => observer.observe(img));

    return () => observer.disconnect();
  }, [viewMode, pages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 bg-[#050505] select-none"
    >
      {/* Reader Area */}
      <div
        className={cn(
          "relative flex-1 flex flex-col items-center min-h-screen",
          viewMode === 'single' ? "justify-center" : "justify-start py-4"
        )}
      >
        {viewMode === 'single' && (
          <div className="absolute inset-0 z-10 flex">
            <div className="w-1/2 h-full cursor-west-resize" onClick={goToPrevious} />
            <div className="w-1/2 h-full cursor-east-resize" onClick={goToNext} />
          </div>
        )}

        <div className={cn(
          "relative w-full max-w-4xl flex flex-col items-center gap-4",
          viewMode === 'continuous' ? "px-2" : "px-0 flex-1"
        )}>
          {viewMode === 'single' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) goToPrevious();
                  else if (info.offset.x < -100) goToNext();
                }}
                className="relative w-full h-full flex items-center justify-center touch-none"
              >
                <img
                  src={getChapterPageUrl(baseUrl, hash, pages[page])}
                  alt={`Page ${page + 1}`}
                  className="max-h-[calc(100vh-140px)] w-auto object-contain pointer-events-none select-none"
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            pages.map((p, i) => (
              <div
                key={i}
                data-index={i}
                className="chapter-page relative w-full flex flex-col items-center"
              >
                <img
                  src={getChapterPageUrl(baseUrl, hash, p)}
                  alt={`Page ${i + 1}`}
                  className="w-full h-auto object-contain"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
                <div className="py-2 text-[10px] text-gray-600 font-mono">
                  PAGE {i + 1}
                </div>
              </div>
            ))
          )}

          {/* End of chapter buttons */}
          {(viewMode === 'continuous' || page === pages.length - 1) && (
            <div className="py-20 flex flex-col items-center gap-6 w-full">
              <div className="h-px w-full bg-white/10" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">End of Chapter {chapterNumber}</h3>
                <p className="text-sm text-gray-500">You've reached the end of this chapter.</p>
              </div>
              <div className="flex gap-4">
                {prevChapterId && (
                  <Button variant="outline" size="lg" asChild>
                    <Link href={`/manga/${mangaId}/chapter/${prevChapterId}`}>
                      <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                    </Link>
                  </Button>
                )}
                {nextChapterId ? (
                  <Button size="lg" className="px-12" asChild>
                    <Link href={`/manga/${mangaId}/chapter/${nextChapterId}`}>
                      Next Chapter <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" asChild>
                    <Link href={`/manga/${mangaId}`}>
                      Back to Detail
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reader Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-black/90 px-6 py-4 backdrop-blur-lg border-t border-white/5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(prev => prev === 'single' ? 'continuous' : 'single')}
            title={viewMode === 'single' ? "Continuous Scroll" : "Single Page"}
            className="text-gray-400 hover:text-white"
          >
            {viewMode === 'single' ? <ScrollText className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </Button>
          <div className="text-xs font-mono text-gray-500 hidden sm:block">
            PAGE {page + 1} / {pages.length}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={viewMode === 'continuous' && !prevChapterId}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
             <span className="text-sm font-black uppercase tracking-tighter">
               Ch. {chapterNumber}
             </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={viewMode === 'continuous' && !nextChapterId}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
