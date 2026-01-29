import type {
  MangaList,
  MangaResponse,
  ChapterList,
  AtHomeServer,
  SearchParams,
  LocalizedString,
  Manga,
  Relationship,
} from './types';

const API_BASE = 'https://api.mangadex.org';

/**
 * Utility for fetching from MangaDex API with error handling
 */
async function fetchMangaDex<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `MangaDex API error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].detail || errorMessage;
      }
    } catch (e) {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
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
 * Search for manga with given parameters
 */
export async function searchManga(params: SearchParams): Promise<MangaList> {
  const query = new URLSearchParams();

  if (params.title) query.append('title', params.title);
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.offset) query.append('offset', params.offset.toString());

  params.status?.forEach((s) => query.append('status[]', s));
  params.contentRating?.forEach((cr) => query.append('contentRating[]', cr));
  params.includedTags?.forEach((t) => query.append('includedTags[]', t));
  params.excludedTags?.forEach((t) => query.append('excludedTags[]', t));

  const includes = params.includes || ['cover_art', 'author', 'artist'];
  includes.forEach((inc) => query.append('includes[]', inc));

  if (params.order) {
    Object.entries(params.order).forEach(([key, value]) => {
      query.append(`order[${key}]`, value);
    });
  }

  return fetchMangaDex<MangaList>(`/manga?${query.toString()}`, {
    next: { revalidate: 3600 },
  });
}

/**
 * Get a single manga by its ID
 */
export async function getMangaById(id: string): Promise<MangaResponse> {
  const query = new URLSearchParams();
  ['cover_art', 'author', 'artist'].forEach((inc) => query.append('includes[]', inc));

  return fetchMangaDex<MangaResponse>(`/manga/${id}?${query.toString()}`, {
    next: { revalidate: 3600 },
  });
}

/**
 * Get chapters for a specific manga
 */
export async function getMangaChapters(
  mangaId: string,
  limit: number = 50,
  offset: number = 0,
  translatedLanguage: string = 'en'
): Promise<ChapterList> {
  const query = new URLSearchParams();
  query.append('manga', mangaId);
  query.append('translatedLanguage[]', translatedLanguage);
  query.append('limit', limit.toString());
  query.append('offset', offset.toString());
  query.append('order[chapter]', 'desc');
  query.append('includes[]', 'scanlation_group');

  return fetchMangaDex<ChapterList>(`/chapter?${query.toString()}`, {
    next: { revalidate: 1800 },
  });
}

/**
 * Get chapter pages via MangaDex At-Home
 */
export async function getChapterPages(chapterId: string): Promise<AtHomeServer> {
  return fetchMangaDex<AtHomeServer>(`/at-home/server/${chapterId}`, {
    next: { revalidate: 3600 },
  });
}

/**
 * Get the full URL for a manga cover image
 */
export function getCoverImageUrl(mangaId: string, filename: string, size: 'small' | 'medium' = 'small'): string {
  if (!filename) return '/placeholder.svg';
  const suffix = size === 'small' ? '.256.jpg' : '.512.jpg';
  return `https://uploads.mangadex.org/covers/${mangaId}/${filename}${suffix}`;
}

/**
 * Get the full URL for a chapter page image
 */
export function getChapterPageUrl(baseUrl: string, hash: string, fileName: string): string {
  return `${baseUrl}/data/${hash}/${fileName}`;
}

/**
 * Get popular manga (shortcut)
 */
export async function getPopularManga(): Promise<MangaList> {
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
export async function getLatestManga(): Promise<MangaList> {
  return searchManga({
    limit: 20,
    offset: 0,
    contentRating: ['safe', 'suggestive', 'erotica'],
    order: { latestUploadedChapter: 'desc' },
  });
}
