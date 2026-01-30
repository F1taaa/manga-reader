'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter, ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRE_MAP: Record<string, string> = {
  'Action': '391b0423-d847-456f-aff0-8b0cfc03066b',
  'Adventure': '87cc87cd-a395-47af-b27a-93258283bbc6',
  'Comedy': '4d32cc48-9f00-4cca-9b5a-a839f0764984',
  'Drama': 'b9af3a63-f058-46de-a9a0-e0c13906197a',
  'Fantasy': 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
  'Horror': 'cdad7e68-1419-41dd-bdce-27753074a640',
  'Mystery': 'ee968100-4191-4968-93d3-f82d72be7e46',
  'Romance': '423e2eae-a7a2-4a8b-ac03-a8351462d71d',
  'Sci-Fi': '256c8bd9-4904-4360-bf4f-508a76d67183',
  'Slice of Life': 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',
};

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Latest Upload', value: 'latestUploadedChapter' },
  { label: 'Popularity', value: 'followedCount' },
  { label: 'Rating', value: 'rating' },
  { label: 'Creation Date', value: 'createdAt' },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'relevance';
  const currentTags = searchParams.get('includedTags')?.split(',').filter(Boolean) || [];

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    let newTags;
    if (currentTags.includes(tag)) {
      newTags = currentTags.filter(t => t !== tag);
    } else {
      newTags = [...currentTags, tag];
    }
    updateParams({ includedTags: newTags.length > 0 ? newTags.join(',') : null });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            <Filter className="h-4 w-4" />
            Genres {currentTags.length > 0 && `(${currentTags.length})`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.keys(GENRE_MAP).map((genre) => (
            <DropdownMenuCheckboxItem
              key={genre}
              checked={currentTags.includes(genre)}
              onCheckedChange={() => toggleTag(genre)}
            >
              {genre}
            </DropdownMenuCheckboxItem>
          ))}
          {currentTags.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive justify-center font-bold"
                onClick={() => updateParams({ includedTags: null })}
              >
                Clear All
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-xl font-bold gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Sort: {SORT_OPTIONS.find(o => o.value === currentSort)?.label || currentSort}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className="justify-between"
              onClick={() => updateParams({ sort: option.value })}
            >
              {option.label}
              {currentSort === option.value && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
