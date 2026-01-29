'use client';

import React from "react"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookMarked, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg flex-shrink-0">
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">MangaHub</span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="flex w-full sm:flex-1 sm:max-w-sm gap-2"
          >
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button type="submit" size="sm" variant="default" className="flex-shrink-0">
              <span className="hidden sm:inline">Search</span>
              <span className="sm:hidden">Go</span>
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
