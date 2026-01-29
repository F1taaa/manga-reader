'use client';

import { useUser } from '@/context/UserContext';
import { useMounted } from '@/hooks/use-mounted';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { History, Trash2, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function HistoryPage() {
  const mounted = useMounted();
  const { history, clearHistory, removeFromHistory } = useUser();

  const historyItems = mounted ? history : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <History className="h-5 w-5" />
              <span className="text-sm font-black uppercase tracking-widest">Recent Activity</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Reading History</h1>
          </div>

          {historyItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </header>

        {!mounted || historyItems.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-border rounded-3xl">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No history yet</h2>
            <p className="text-muted-foreground mb-8">Chapters you read will appear here.</p>
            <Button size="lg" className="rounded-xl font-bold" asChild>
              <Link href="/">Explore Manga</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item, index) => {
              const relativeDate = mounted
                ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                : '';

              return (
                <div
                  key={`${item.chapterId}-${index}`}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <Link href={`/manga/${item.mangaId}`} className="hover:text-primary transition-colors">
                        <h3 className="font-bold text-lg truncate leading-tight">
                          {item.mangaTitle}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-sm font-black text-foreground">
                          {item.volumeNumber ? `Vol. ${item.volumeNumber} ` : ''}
                          Ch. {item.chapterNumber}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {relativeDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10 hover:text-primary">
                       <Link href={`/manga/${item.mangaId}/chapter/${item.chapterId}`}>
                         <ChevronRight className="h-5 w-5" />
                       </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromHistory(item.chapterId)}
                      className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
