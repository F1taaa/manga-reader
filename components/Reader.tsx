'use client';

import React from "react"

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReaderProps {
  pages: string[];
  baseUrl: string;
  hash: string;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function Reader({
  pages,
  baseUrl,
  hash,
  currentPage = 0,
  onPageChange,
}: ReaderProps) {
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const pageUrl = `${baseUrl}/data/${hash}/${pages[page]}`;

  useEffect(() => {
    if (onPageChange) {
      onPageChange(page);
    }
  }, [page, onPageChange]);

  const goToPrevious = () => {
    if (page > 0) {
      setPage(page - 1);
      setLoading(true);
    }
  };

  const goToNext = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
      setLoading(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left = next page, swipe right = previous page
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrevious();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page, pages.length]);

  return (
    <div
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'bg-background'}`}
    >
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="text-sm font-medium text-muted-foreground">
          Page {page + 1} of {pages.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-2"
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={readerRef}
        className={`flex-1 flex items-center justify-center overflow-hidden ${isFullscreen ? 'bg-black' : 'bg-muted'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">
          <Image
            src={pageUrl || "/placeholder.svg"}
            alt={`Page ${page + 1}`}
            fill
            className="object-contain select-none"
            onLoadingComplete={() => setLoading(false)}
            priority
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4">
        <Button
          variant="outline"
          size="lg"
          onClick={goToPrevious}
          disabled={page === 0}
          className="gap-2 bg-transparent"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="text-sm font-medium">
          {page + 1} / {pages.length}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={goToNext}
          disabled={page === pages.length - 1}
          className="gap-2 bg-transparent"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
