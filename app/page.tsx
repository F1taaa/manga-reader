import { getPopularManga, getLatestManga } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { MangaCard } from '@/components/MangaCard';
import { Skeleton } from '@/components/ui/skeleton';

async function HomePage() {
  let popularManga = [];
  let latestManga = [];
  let error = null;

  try {
    const [popular, latest] = await Promise.all([
      getPopularManga(),
      getLatestManga(),
    ]);
    
    if (popular.result === 'ok') {
      popularManga = popular.data;
    }
    if (latest.result === 'ok') {
      latestManga = latest.data;
    }
  } catch (err) {
    error = 'Failed to load manga data';
    console.error('Error fetching manga:', err);
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {error && (
            <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p>{error}</p>
            </div>
          )}

          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Discover Manga
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Read thousands of manga online for free
            </p>
          </section>

          {/* Popular Manga Section */}
          <section className="mb-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Popular Right Now</h2>
              <p className="text-muted-foreground">Most followed manga on MangaDex</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {popularManga.length > 0 ? (
                popularManga.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))
              ) : (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-[3/4]" />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Latest Manga Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Latest Updates</h2>
              <p className="text-muted-foreground">Recently updated manga</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {latestManga.length > 0 ? (
                latestManga.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))
              ) : (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-[3/4]" />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default HomePage;
