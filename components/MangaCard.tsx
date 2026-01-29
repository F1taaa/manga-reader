"use client";

import Image from "next/image";
import Link from "next/link";
import type { Manga } from "@/lib/types";
import { getCoverImageUrl, getLocalizedString, getRelationship } from "@/lib/mangadex";
import { BookOpen, Star, Info, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MangaCardProps {
  manga: Manga;
}

export function MangaCard({ manga }: MangaCardProps) {
  const coverArt = getRelationship(manga, "cover_art");
  const coverFileName = coverArt?.attributes?.fileName;

  const title = getLocalizedString(manga.attributes.title);
  const lastChapter = manga.attributes.lastChapter || "N/A";

  const coverUrl = coverFileName
    ? getCoverImageUrl(manga.id, coverFileName, "medium")
    : "/placeholder.svg?height=300&width=200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="manga-card"
      data-testid="manga-card"
    >
      <Link href={`/manga/${manga.id}`} className="group block h-full">
        <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-1">
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex gap-2">
                <Button size="icon-sm" className="rounded-full h-8 w-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="glass" size="icon-sm" className="rounded-full h-8 w-8 backdrop-blur-md border-white/20 text-white">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {manga.attributes.status === 'ongoing' && (
              <Badge variant="success" className="shadow-lg backdrop-blur-md font-black">
                Ongoing
              </Badge>
            )}
            {manga.attributes.status === 'completed' && (
              <Badge variant="secondary" className="shadow-lg backdrop-blur-md font-black">
                Completed
              </Badge>
            )}
            {manga.attributes.contentRating === 'suggestive' && (
              <Badge variant="warning" className="shadow-lg backdrop-blur-md font-black">
                15+
              </Badge>
            )}
          </div>

          {/* Rating/Score if we had it, but MangaDex rating is separate API.
              Let's put a fake rating for aesthetic if it's popular or just omit. */}
        </div>

        <div className="mt-4 space-y-1.5 px-1">
          <h3 className="line-clamp-2 font-black text-sm leading-tight transition-colors group-hover:text-primary tracking-tight">
            {title}
          </h3>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="p-1 rounded-md bg-muted shrink-0">
                <BookOpen className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">Ch. {lastChapter}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-[11px] font-black italic">NEW</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
