import type {
  MangaList,
  MangaResponse,
  Chapter,
  ChapterList,
  AtHomeServer,
  SearchParams,
  LocalizedString,
  Manga,
  Relationship,
} from './types';
import { MOCK_MANGA, MOCK_CHAPTERS, MOCK_PAGES } from './mock-data';

/**
 * Utility for fetching (Mocked)
 */
async function fetchMangaDex<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Static mock implementation
  return {} as T;
}

/**
 * Get a localized string from a LocalizedString object
 */
export function getLocalizedString(
  localized: LocalizedString | undefined,
  fallback: string = 'en'
): string {
  if (!localized) return 'Unknown';
  if (typeof localized === 'string') return localized; // Handle cases where it might already be a string
  return localized[fallback] || localized['en'] || Object.values(localized)[0] || 'Unknown';
}

/**
 * Extract a relationship of a specific type from a Manga or Chapter object
 */
export function getRelationship<T = any>(
  entity: { relationships: Relationship[] },
  type: string
): (Relationship & { attributes?: T }) | undefined {
  return entity.relationships.find((r) => r.type === type) as (Relationship & { attributes?: T }) | undefined;
}

/**
 * Search for manga (Mocked)
 */
export async function searchManga(params: SearchParams): Promise<MangaList> {
  let data = MOCK_MANGA;
  if (params.title) {
    data = data.filter(m =>
      getLocalizedString(m.attributes.title).toLowerCase().includes(params.title!.toLowerCase())
    );
  }
  return {
    result: 'ok',
    response: 'collection',
    data: data,
    limit: params.limit || 10,
    offset: params.offset || 0,
    total: data.length
  };
}

/**
 * Get a single manga by its ID (Mocked)
 */
export async function getMangaById(id: string): Promise<MangaResponse> {
  const manga = MOCK_MANGA.find(m => m.id === id) || MOCK_MANGA[0];
  return {
    result: 'ok',
    response: 'entity',
    data: manga
  };
}

/**
 * Get chapters for a specific manga (Mocked)
 */
export async function getMangaChapters(
  mangaId: string,
  limit: number = 100,
  offset: number = 0,
  translatedLanguage: string = 'en'
): Promise<ChapterList> {
  const chapters = MOCK_CHAPTERS[mangaId] || [];
  return {
    result: 'ok',
    response: 'collection',
    data: chapters,
    limit,
    offset,
    total: chapters.length
  };
}

/**
 * Get chapter pages (Mocked)
 */
export async function getChapterPages(chapterId: string): Promise<AtHomeServer> {
  return MOCK_PAGES[chapterId] || MOCK_PAGES['c1'];
}

/**
 * Get the full URL for a manga cover image (Mocked - returning placeholder or static image)
 */
export function getCoverImageUrl(mangaId: string, filename: string, size: 'small' | 'medium' = 'small'): string {
  // For UI only, we can use unsplash or placeholder
  return `https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=400&auto=format&fit=crop`;
}

/**
 * Get the full URL for a chapter page image (Mocked)
 */
export function getChapterPageUrl(baseUrl: string, hash: string, fileName: string): string {
  return `https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop`;
}

/**
 * Get a single chapter by its ID (Mocked)
 */
export async function getChapterById(id: string): Promise<{ result: string, data: Chapter }> {
  const allChapters = Object.values(MOCK_CHAPTERS).flat();
  const chapter = allChapters.find(c => c.id === id) || allChapters[0];
  return {
    result: 'ok',
    data: chapter
  };
}

/**
 * Deduplicate and sort chapters
 */
export function deduplicateChapters(chapters: Chapter[]): Chapter[] {
  const seen = new Map<string, Chapter>();

  chapters.forEach(chapter => {
    const chapterNum = chapter.attributes.chapter || '0';
    const lang = chapter.attributes.translatedLanguage;
    const key = `${chapterNum}-${lang}`;

    const existing = seen.get(key);
    if (!existing || chapter.attributes.pages > existing.attributes.pages) {
      seen.set(key, chapter);
    }
  });

  return Array.from(seen.values()).sort((a, b) => {
    const numA = parseFloat(a.attributes.chapter || '0');
    const numB = parseFloat(b.attributes.chapter || '0');
    return numB - numA; // Default descending
  });
}

/**
 * Get popular manga (shortcut)
 */
export async function getPopularManga(p0: number): Promise<MangaList> {
  return searchManga({
    limit: 20,
    offset: 0,
    contentRating: ['safe', 'suggestive', 'erotica'],
    order: { followedCount: 'desc' },
  });
}

/**
 * Get latest manga updates (shortcut)
 */
export async function getLatestManga(p0: number): Promise<MangaList> {
  return searchManga({
    limit: 20,
    offset: 0,
    contentRating: ['safe', 'suggestive', 'erotica'],
    order: { latestUploadedChapter: 'desc' },
  });
}
