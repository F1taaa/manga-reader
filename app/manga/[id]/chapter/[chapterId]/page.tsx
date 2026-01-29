import {
  getChapterPages,
  getMangaById,
  getLocalizedString,
  getMangaChapters,
  deduplicateChapters
} from '@/lib/mangadex';
import { Reader } from '@/components/Reader';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, ChevronRight, LayoutGrid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChapterReaderPageProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

export async function generateMetadata({ params }: ChapterReaderPageProps) {
  const { id, chapterId } = await params;
  try {
    const mangaResponse = await getMangaById(id);
    const title = mangaResponse.result === 'ok' ? getLocalizedString(mangaResponse.data.attributes.title) : 'Manga';
    return {
      title: `Reading | ${title} | Manga Reader`,
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
    const [pagesResponse, mangaResponse, chaptersResponse] = await Promise.all([
      getChapterPages(chapterId),
      getMangaById(id),
      getMangaChapters(id, 500, 0), // Get many chapters to ensure we find next/prev
    ]);

    if (pagesResponse.result !== 'ok' || mangaResponse.result !== 'ok') {
      notFound();
    }

    const { baseUrl, chapter: chapterData } = pagesResponse;
    const pages = chapterData.data;
    const manga = mangaResponse.data;
    const mangaTitle = getLocalizedString(manga.attributes.title);

    const allChapters = chaptersResponse.result === 'ok' ? deduplicateChapters(chaptersResponse.data) : [];

    // Sort chapters ascending to find next/prev
    const sortedChapters = [...allChapters].sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter || '0');
      const numB = parseFloat(b.attributes.chapter || '0');
      return numA - numB;
    });

    const currentIndex = sortedChapters.findIndex(c => c.id === chapterId);
    const currentChapter = sortedChapters[currentIndex];

    if (!currentChapter) {
        // Fallback if not found in the list (might be more than 500 chapters or just uploaded)
        notFound();
    }

    const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

    if (!pages || pages.length === 0) {
      notFound();
    }

    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Reader Header */}
        <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-white/5 bg-black/80 px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={`/manga/${id}`}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Back to Detail"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex flex-col min-w-0">
              <h1 className="text-xs font-bold text-gray-400 truncate max-w-[120px] sm:max-w-md uppercase tracking-widest">
                {mangaTitle}
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black truncate">
                  {currentChapter.attributes.volume ? `Vol. ${currentChapter.attributes.volume} ` : ''}
                  Ch. {currentChapter.attributes.chapter}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-white/10 rounded">
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-[60vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white">
                    {sortedChapters.slice().reverse().map((ch) => (
                      <DropdownMenuItem key={ch.id} asChild>
                        <Link
                          href={`/manga/${id}/chapter/${ch.id}`}
                          className={cn(
                            "flex items-center justify-between gap-4 w-full cursor-pointer",
                            ch.id === chapterId ? "text-primary font-bold" : "text-gray-300"
                          )}
                        >
                          <span>Ch. {ch.attributes.chapter}</span>
                          {ch.attributes.volume && <span className="text-[10px] opacity-50">Vol. {ch.attributes.volume}</span>}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Home"
            >
              <Home className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Reader Component */}
        <main className="flex-1 flex flex-col">
          <Reader
            mangaId={id}
            mangaTitle={mangaTitle}
            chapterId={chapterId}
            chapterNumber={currentChapter.attributes.chapter || '0'}
            volumeNumber={currentChapter.attributes.volume}
            baseUrl={baseUrl}
            hash={chapterData.hash}
            pages={pages}
            nextChapterId={nextChapter?.id}
            prevChapterId={prevChapter?.id}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    notFound();
  }
}
