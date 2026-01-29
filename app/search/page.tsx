'use client';

import React from "react"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { MangaCard } from '@/components/MangaCard';
import { searchManga } from '@/lib/mangadex';
import type { Manga } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import SearchLoading from './loading';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await searchManga({
          title: query,
          limit: 50,
          offset: 0,
          contentRating: ['safe', 'suggestive', 'erotica'],
        });

        if (response.result === 'ok') {
          setResults(response.data);
        } else {
          setError('No results found');
        }
      } catch (err) {
        setError('Failed to search manga');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(localQuery)}`;
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Search Form */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search manga..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button type="submit" variant="default">
                Search
              </Button>
            </form>
          </div>

          {/* Results */}
          {query && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Search Results for "{query}"
                </h2>
                <p className="text-muted-foreground">
                  {loading ? 'Searching...' : `Found ${results.length} results`}
                </p>
              </div>

              {error && (
                <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden">
                      <Skeleton className="aspect-[3/4]" />
                    </div>
                  ))
                ) : results.length > 0 ? (
                  results.map((manga) => (
                    <MangaCard key={manga.id} manga={manga} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No manga found matching your search</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!query && !loading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Enter a search query to find manga</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
