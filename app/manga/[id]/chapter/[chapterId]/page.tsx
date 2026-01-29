import { getChapterPages } from '@/lib/mangadex';
import { Reader } from '@/components/Reader';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ChapterReaderPageProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

export async function generateMetadata({ params }: ChapterReaderPageProps) {
  return {
    title: 'Reading Manga | Manga Reader',
  };
}

export default async function ChapterReaderPage({
  params,
}: ChapterReaderPageProps) {
  const { id, chapterId } = await params;

  try {
    const response = await getChapterPages(chapterId);

    if (response.result !== 'ok') {
      notFound();
    }

    const { baseUrl, chapter } = response;
    const pages = chapter.data;

    if (!pages || pages.length === 0) {
      notFound();
    }

    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header with Navigation */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
          <Link href={`/manga/${id}/chapters`}>
            <button className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Chapters
            </button>
          </Link>
        </div>

        {/* Reader */}
        <Reader baseUrl={baseUrl} hash={chapter.hash} pages={pages} />
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    notFound();
  }
}
