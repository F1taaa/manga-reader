import { getMangaById, getMangaChapters, getLocalizedString, deduplicateChapters } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { MangaHeader } from '@/components/MangaHeader';
import { ChapterList } from '@/components/ChapterList';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface MangaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MangaPageProps) {
  const { id } = await params;
  try {
    const response = await getMangaById(id);
    if (response.result === 'ok' && response.data) {
      const title = getLocalizedString(response.data.attributes.title);
      const description = getLocalizedString(response.data.attributes.description);

      return {
        title: `${title} | Manga Reader`,
        description: description.slice(0, 160) || 'Read manga online',
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  return {
    title: 'Manga | Manga Reader',
  };
}


export default async function MangaPage({ params }: MangaPageProps) {
  const { id } = await params;

  try {
    const [mangaResponse, chaptersResponse] = await Promise.all([
      getMangaById(id),
      getMangaChapters(id, 100, 0),
    ]);

    if (mangaResponse.result !== 'ok' || !mangaResponse.data) {
      notFound();
    }

    const manga = mangaResponse.data;
    const allChapters = chaptersResponse.result === 'ok' ? chaptersResponse.data : [];

    // Filter and deduplicate
    const chapters = deduplicateChapters(allChapters);

    // Find the first chapter (lowest number)
    const sortedChapters = [...chapters].sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter || '0');
      const numB = parseFloat(b.attributes.chapter || '0');
      return numA - numB;
    });

    // Prioritize internal chapters (with pages > 0)
    const firstInternal = sortedChapters.find(ch => !ch.attributes.externalUrl && ch.attributes.pages > 0);
    const firstChapter = firstInternal || sortedChapters[0];

    const description = getLocalizedString(manga.attributes.description);
    const tags = manga.attributes.tags ?? [];

    return (
      <div className="min-h-screen bg-background pb-20">
        <Navigation />

        <MangaHeader
          manga={manga}
          firstChapterId={firstChapter?.id}
          externalUrl={firstChapter?.attributes.externalUrl ?? undefined}
        />

        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">About</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description || 'No description available.'}
                  </p>
                </div>
              </section>

              {/* Chapters */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Chapters</h2>
                  <Badge variant="outline">{chapters.length} Chapters</Badge>
                </div>
                <ChapterList chapters={chapters} mangaId={id} />
              </section>
            </div>

            {/* Sidebar Metadata */}
            <div className="space-y-8 lg:border-l lg:border-border lg:pl-8">
              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Information</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Original Language</dt>
                    <dd className="mt-1 font-medium uppercase">{manga.attributes.originalLanguage}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Content Rating</dt>
                    <dd className="mt-1 font-medium capitalize">{manga.attributes.contentRating}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-1 font-medium capitalize">{manga.attributes.status}</dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="font-normal">
                      {getLocalizedString(tag.attributes.name)}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading manga:', error);
    notFound();
  }
}