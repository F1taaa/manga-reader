'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useMounted } from '@/hooks/use-mounted';
import { Navigation } from '@/components/Navigation';
import { LibraryCard } from '@/components/LibraryCard';
import { Button } from '@/components/ui/button';
import { BookMarked, Search } from 'lucide-react';
import type { ReadingStatus } from '@/lib/types';
import Link from 'next/link';

const STATUS_FILTERS: (ReadingStatus | 'all')[] = ['all', 'reading', 'plan_to_read', 'completed', 'on_hold', 'dropped'];

const STATUS_LABELS: Record<ReadingStatus | 'all', string> = {
  all: 'All',
  reading: 'Reading',
  plan_to_read: 'Plan to Read',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
};

export default function LibraryPage() {
  const mounted = useMounted();
  const { library } = useUser();
  const [filter, setFilter] = useState<ReadingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const libraryItems = mounted ? Object.values(library) : [];

  const filteredItems = libraryItems
    .filter(item => filter === 'all' || item.status === filter)
    .filter(item => item.mangaTitle.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const timeA = new Date(a.lastReadAt || a.addedAt).getTime();
      const timeB = new Date(b.lastReadAt || b.addedAt).getTime();
      return timeB - timeA;
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-12">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <BookMarked className="h-5 w-5" />
                <span className="text-sm font-black uppercase tracking-widest">My Library</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">Collections</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search library..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-muted rounded-xl border-none focus:ring-2 focus:ring-primary w-full sm:w-64 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s}
                variant={filter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(s)}
                className="rounded-full px-6 font-bold shrink-0"
              >
                {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        </header>

        {!mounted || libraryItems.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-border rounded-3xl">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6">
              <BookMarked className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your library is empty</h2>
            <p className="text-muted-foreground mb-8">Start exploring and add some manga to your collection!</p>
            <Button size="lg" className="rounded-xl font-bold" asChild>
              <Link href="/">Browse Manga</Link>
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted-foreground">No manga found matching your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredItems.map((item) => (
              <LibraryCard key={item.mangaId} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
