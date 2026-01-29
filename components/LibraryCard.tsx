'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { LibraryItem, ReadingStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useMounted } from '@/hooks/use-mounted';

interface LibraryCardProps {
  item: LibraryItem;
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  reading: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_read: 'Plan to Read',
};

export function LibraryCard({ item }: LibraryCardProps) {
  const mounted = useMounted();
  const relativeDate = !mounted ? '' : (item.lastReadAt
    ? formatDistanceToNow(new Date(item.lastReadAt), { addSuffix: true })
    : formatDistanceToNow(new Date(item.addedAt), { addSuffix: true }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <Link href={`/manga/${item.mangaId}`} className="block space-y-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          <Image
            src={item.coverArt}
            alt={item.mangaTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge className="bg-black/60 backdrop-blur-md border-none text-[10px] font-black uppercase tracking-wider">
              {STATUS_LABELS[item.status]}
            </Badge>
          </div>

          {item.lastChapterRead && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] font-bold text-white/90 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Last: Ch. {item.lastChapterRead}
              </p>
            </div>
          )}
        </div>

        <div className="px-1">
          <h3 className="line-clamp-1 text-sm font-black tracking-tight group-hover:text-primary transition-colors">
            {item.mangaTitle}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-tighter font-bold">
            <Calendar className="h-3 w-3" />
            {item.lastReadAt ? `Read ${relativeDate}` : `Added ${relativeDate}`}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
