import { searchManga } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { MangaCard } from '@/components/MangaCard';
import { Search } from 'lucide-react';
import { SearchFilters } from '@/components/SearchFilters';

const GENRE_MAP: Record<string, string> = {
  'action': '391b0423-d847-456f-aff0-8b0cfc03066b',
  'adventure': '87cc87cd-a395-47af-b27a-93258283bbc6',
  'comedy': '4d32cc48-9f00-4cca-9b5a-a839f0764984',
  'drama': 'b9af3a63-f058-46de-a9a0-e0c13906197a',
  'fantasy': 'cdc58593-87dd-415e-bbc0-2ec27bf404cc',
  'horror': 'cdad7e68-1419-41dd-bdce-27753074a640',
  'mystery': 'ee968100-4191-4968-93d3-f82d72be7e46',
  'romance': '423e2eae-a7a2-4a8b-ac03-a8351462d71d',
  'sci-fi': '256c8bd9-4904-4360-bf4f-508a76d67183',
  'slice of life': 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    includedTags?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const includedTagsRaw = params.includedTags || '';
  const sort = params.sort || 'relevance';

  // Map genre names to IDs
  const includedTags = includedTagsRaw
    .split(',')
    .map(tag => GENRE_MAP[tag.trim().toLowerCase()] || tag)
    .filter(tag => tag.length > 0);

  let order: Record<string, 'asc' | 'desc'> = { relevance: 'desc' };
  if (sort === 'followedCount') order = { followedCount: 'desc' };
  if (sort === 'latestUploadedChapter') order = { latestUploadedChapter: 'desc' };
  if (sort === 'rating') order = { rating: 'desc' };
  if (sort === 'createdAt') order = { createdAt: 'desc' };

  // If no query, relevance might not work well, fallback to followedCount if requested but default to relevance if query exists
  if (!query && sort === 'relevance') {
    order = { followedCount: 'desc' };
  }

  let mangaResults: any[] = [];
  let error: string | null = null;

  try {
    const results = await searchManga({
      title: query,
      includedTags: includedTags,
      order: order,
      limit: 30,
      contentRating: ['safe', 'suggestive', 'erotica'],
    });

    if (results.result === 'ok') {
      mangaResults = results.data;
    }
  } catch (err) {
    console.error('Search error:', err);
    error = 'Failed to fetch search results. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Search className="h-5 w-5" />
                <span className="text-sm font-black uppercase tracking-widest">Search Results</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">
                {query ? `Results for "${query}"` : includedTagsRaw ? `Genre: ${includedTagsRaw}` : 'All Manga'}
              </h1>
            </div>

            <SearchFilters />
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-bold">{error}</p>
          </div>
        ) : mangaResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {mangaResults.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </main>
    </div>
  );
}
