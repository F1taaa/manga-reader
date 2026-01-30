import { getChapterPages, getLocalizedString, getChapterById, getMangaChapters, deduplicateChapters } from '@/lib/mangadex';
import { Reader } from '@/components/Reader';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

interface ChapterReaderPageProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

export async function generateMetadata({ params }: ChapterReaderPageProps) {
  const { chapterId } = await params;
  try {
    // We could fetch chapter info here for a better title, but for now:
    return {
      title: 'Reading Chapter | Manga Reader',
    };
  } catch (error) {
    return { title: 'Manga Reader' };
  }
}

export default async function ChapterReaderPage({
  params,
}: ChapterReaderPageProps) {
  const { id, chapterId } = await params;

  try {
    const [pagesResponse, chapterResponse, chaptersResponse] = await Promise.all([
      getChapterPages(chapterId),
      getChapterById(chapterId),
      getMangaChapters(id, 100)
    ]);

    if (pagesResponse.result !== 'ok' || chapterResponse.result !== 'ok') {
      notFound();
    }

    const chapter = chapterResponse.data;
    const { baseUrl, chapter: chapterData } = pagesResponse;
    const pages = chapterData.data;

    const mangaRelationship = chapter.relationships.find(r => r.type === 'manga');
    const mangaTitle = getLocalizedString(mangaRelationship?.attributes?.title);

    // Navigation logic
    const allChapters = chaptersResponse.result === 'ok' ? chaptersResponse.data : [];
    const chapters = deduplicateChapters(allChapters);
    const currentIndex = chapters.findIndex(c => c.id === chapterId);

    // Sort is descending, so next chapter is earlier in array
    const nextChapterId = currentIndex > 0 ? chapters[currentIndex - 1].id : undefined;
    const prevChapterId = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].id : undefined;

    if (!pages || pages.length === 0) {
      notFound();
    }

    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Minimalist Reader Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href={`/manga/${id}`}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Detail</span>
            </Link>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <h1 className="text-sm font-medium truncate max-w-50 sm:max-w-md">
              {mangaTitle}
            </h1>
          </div>

          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <Home className="h-5 w-5" />
          </Link>
        </header>

        {/* Reader Component */}
        <main className="flex-1 flex flex-col">
          <Reader
            baseUrl={baseUrl}
            hash={chapterData.hash}
            pages={pages}
            mangaId={id}
            mangaTitle={mangaTitle}
            chapterId={chapterId}
            chapterNumber={chapter.attributes.chapter || '0'}
            volumeNumber={chapter.attributes.volume}
            nextChapterId={nextChapterId}
            prevChapterId={prevChapterId}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    notFound();
  }
}
