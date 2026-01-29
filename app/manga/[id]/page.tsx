import { getMangaById, getMangaChapters } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { MangaDetail } from '@/components/MangaDetail';
import { ChapterList } from '@/components/ChapterList';
import { notFound } from 'next/navigation';

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
      const title = response.data.attributes.title ||
        (typeof response.data.attributes.title === 'object'
          ? response.data.attributes.title.en
          : 'Manga');
      return {
        title: `${title} | Manga Reader`,
        description: response.data.attributes.description || 'Read manga online',
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
      getMangaChapters(id, 50, 0),
    ]);

    if (mangaResponse.result !== 'ok' || !mangaResponse.data) {
      notFound();
    }

    const manga = mangaResponse.data;
    const chapters = chaptersResponse.result === 'ok' ? chaptersResponse.data : [];

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <MangaDetail manga={manga} />

            {/* Chapters Section */}
            <div className="mt-16 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Chapters</h2>
                <p className="text-muted-foreground">
                  {chapters.length > 0 ? `${chapters.length} chapters available` : 'No chapters available'}
                </p>
              </div>
              <ChapterList chapters={chapters} mangaId={id} />
            </div>
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error loading manga:', error);
    notFound();
  }
}
