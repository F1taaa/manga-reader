import { getMangaById, getMangaChapters, getLocalizedString } from '@/lib/mangadex';
import { Navigation } from '@/components/Navigation';
import { ChapterList } from '@/components/ChapterList';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChaptersPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChaptersPage({ params }: ChaptersPageProps) {
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
    const chapters = chaptersResponse.result === 'ok' ? chaptersResponse.data : [];
    const title = getLocalizedString(manga.attributes.title);

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-8">
            {/* Back Button */}
            <Link href={`/manga/${id}`}>
              <button className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Manga
              </button>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Chapters</h1>
              <p className="text-muted-foreground">
                {title} • {chapters.length} chapters
              </p>
            </div>

            {/* Chapters */}
            <ChapterList chapters={chapters} mangaId={id} />
          </div>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error loading chapters:', error);
    notFound();
  }
}
