'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { Manga } from '@/lib/types';
import { getLocalizedString, getCoverImageUrl, getRelationship } from '@/lib/mangadex';

interface HeroCarouselProps {
  mangaList: Manga[];
}

export function HeroCarousel({ mangaList }: HeroCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true }}
      plugins={[plugin.current]}
    >
      <CarouselContent>
        {mangaList.map((manga) => {
          const title = getLocalizedString(manga.attributes.title);
          const description = getLocalizedString(manga.attributes.description);
          const coverArt = getRelationship(manga, 'cover_art');
          const coverUrl = coverArt?.attributes?.fileName
            ? getCoverImageUrl(manga.id, coverArt.attributes.fileName, 'original')
            : '/placeholder.svg';

          return (
            <CarouselItem key={manga.id}>
              <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden group">
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                  <Image
                    src={coverUrl}
                    alt=""
                    fill
                    className="object-cover opacity-20 dark:opacity-30 blur-2xl scale-110"
                    priority
                  />
                </div>

                {/* Main Content Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden md:block" />

                <div className="container mx-auto h-full px-4 relative flex items-center">
                  <div className="grid md:grid-cols-12 gap-8 items-center w-full">
                    {/* Cover art on desktop */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="hidden md:block md:col-span-4 lg:col-span-3"
                    >
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
                        <Image
                          src={coverUrl}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="col-span-12 md:col-span-8 lg:col-span-7 space-y-4 md:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-wrap gap-2"
                      >
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Featured</span>
                        {manga.attributes.status && (
                          <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {manga.attributes.status}
                          </span>
                        )}
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.05] drop-shadow-sm"
                      >
                        {title}
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-muted-foreground line-clamp-2 md:line-clamp-3 text-sm md:text-xl max-w-2xl font-medium leading-relaxed"
                      >
                        {description}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap gap-4 pt-4"
                      >
                        <Link href={`/manga/${manga.id}`}>
                          <Button size="lg" className="rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-primary/20">
                            <Play className="h-5 w-5 mr-2 fill-current" />
                            Read Now
                          </Button>
                        </Link>
                        <Link href={`/manga/${manga.id}`}>
                          <Button size="lg" variant="glass" className="rounded-full px-8 h-14 text-base font-bold backdrop-blur-md border-white/10">
                            <Info className="h-5 w-5 mr-2" />
                            Details
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="absolute bottom-10 right-10 hidden md:flex gap-3 z-20">
        <CarouselPrevious className="static translate-y-0 h-14 w-14 bg-background/20 backdrop-blur-xl border-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300" />
        <CarouselNext className="static translate-y-0 h-14 w-14 bg-background/20 backdrop-blur-xl border-white/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300" />
      </div>
    </Carousel>
  );
}
