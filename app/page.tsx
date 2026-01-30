import { getPopularManga, getLatestManga } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { MangaCard } from '@/components/MangaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { HeroCarousel } from '@/components/HeroCarousel';
import Link from 'next/link';
import { Info, Sparkles, Zap, Filter } from 'lucide-react';

async function HomePage() {
  let popularManga: any[] = [];
  let latestManga: any[] = [];
  let error = null;

  try {
    const [popular, latest] = await Promise.all([
      getPopularManga(20),
      getLatestManga(12),
    ]);
    
    if (popular.result === 'ok') {
      popularManga = popular.data;
    }
    if (latest.result === 'ok') {
      latestManga = latest.data;
    }
  } catch (err) {
    error = 'Failed to load manga data from MangaDex';
    console.error('Error fetching manga:', err);
  }

  const featuredManga = popularManga.slice(0, 6);

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy",
    "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pb-20">
        {error && (
          <div className="container mx-auto px-4 mt-8">
            <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4 text-destructive flex items-center gap-3">
              <Info className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <HeroCarousel mangaList={featuredManga} />

        {/* Genre Pills */}
        <section className="mt-12 container mx-auto px-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest">Popular Genres</h3>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex-wrap">
            {genres.map((genre) => (
              <Link key={genre} href={`/search?includedTags=${genre.toLowerCase()}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-5 py-5 border-border/50 bg-muted/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all font-bold"
                >
                  {genre}
                </Button>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Section */}
        <section className="mt-16 container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Trending Now</h2>
                <p className="text-muted-foreground font-semibold text-sm">Most followed manga this week</p>
              </div>
            </div>
            <Link href="/search?sort=followedCount">
              <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-full px-6">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {popularManga.length > 0 ? (
              popularManga.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))
            ) : (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-3/4 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Latest Updates Section */}
        <section className="mt-28 container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Latest Updates</h2>
                <p className="text-muted-foreground font-semibold text-sm">Freshly translated chapters</p>
              </div>
            </div>
            <Link href="/search?sort=latestUploadedChapter">
              <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-full px-6">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {latestManga.length > 0 ? (
              latestManga.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))
            ) : (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-3/4 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 pt-20 pb-10 bg-muted/20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Info className="h-5 w-5" />
                </div>
                <span className="font-black text-2xl tracking-tighter">MANGA<span className="text-primary">HUB</span></span>
              </div>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Your ultimate destination for reading high-quality manga online. Discover thousands of titles across all genres.
              </p>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-foreground/50">Explore</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/search" className="hover:text-primary transition-colors">Browse</Link></li>
                <li><Link href="/search?sort=followedCount" className="hover:text-primary transition-colors">Popular</Link></li>
                <li><Link href="/search?sort=latestUploadedChapter" className="hover:text-primary transition-colors">Latest</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-foreground/50">Community</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="#" className="hover:text-primary transition-colors">Discord</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Reddit</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-foreground/50">Support</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} MangaHub UI Template.</p>
            <div className="flex gap-8">
              <span>English</span>
              <span>Dark Mode</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;