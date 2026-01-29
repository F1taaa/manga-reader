import type {
  MangaList,
  MangaResponse,
  ChapterList,
  AtHomeServer,
  SearchParams,
} from './types';

const API_BASE = 'https://api.mangadex.org';

export async function searchManga(params: SearchParams): Promise<MangaList> {
  const searchParams = new URLSearchParams();

  if (params.title) searchParams.append('title', params.title);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());
  if (params.status) {
    params.status.forEach((s) => searchParams.append('status[]', s));
  }
  if (params.contentRating) {
    params.contentRating.forEach((cr) => searchParams.append('contentRating[]', cr));
  }
  if (params.includes) {
    params.includes.forEach((inc) => searchParams.append('includes[]', inc));
  }
  if (params.order) {
    Object.entries(params.order).forEach(([key, value]) => {
      searchParams.append(`order[${key}]`, value);
    });
  }

  // Always include cover art and author info
  searchParams.append('includes[]', 'cover_art');
  searchParams.append('includes[]', 'author');
  searchParams.append('includes[]', 'artist');

  const url = `${API_BASE}/manga?${searchParams.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Failed to search manga: ${response.statusText}`);
  }

  return response.json();
}

export async function getMangaById(id: string): Promise<MangaResponse> {
  const params = new URLSearchParams();
  params.append('includes[]', 'cover_art');
  params.append('includes[]', 'author');
  params.append('includes[]', 'artist');

  const url = `${API_BASE}/manga/${id}?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch manga: ${response.statusText}`);
  }

  return response.json();
}

export async function getMangaChapters(
  mangaId: string,
  limit: number = 50,
  offset: number = 0,
  translatedLanguage: string = 'en'
): Promise<ChapterList> {
  const params = new URLSearchParams();
  params.append('manga', mangaId);
  params.append('translatedLanguage[]', translatedLanguage);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());
  params.append('order[chapter]', 'desc');
  params.append('includes[]', 'scanlation_group');

  const url = `${API_BASE}/chapter?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 1800 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch chapters: ${response.statusText}`);
  }

  return response.json();
}

export async function getChapterPages(chapterId: string): Promise<AtHomeServer> {
  const url = `${API_BASE}/at-home/server/${chapterId}`;
  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`Failed to fetch chapter pages: ${response.statusText}`);
  }

  return response.json();
}

export function getCoverImageUrl(filename: string, size: 'small' | 'medium' = 'small'): string {
  const endpoint = size === 'small' ? '256' : '512';
  return `https://uploads.mangadex.org/covers/${filename}.${endpoint}.jpg`;
}

export function getChapterPageUrl(baseUrl: string, hash: string, fileName: string): string {
  return `${baseUrl}/data/${hash}/${fileName}`;
}

export async function getPopularManga(): Promise<MangaList> {
  return searchManga({
    limit: 20,
    offset: 0,
    contentRating: ['safe', 'suggestive', 'erotica'],
    order: { followedCount: 'desc' },
  });
}

export async function getLatestManga(): Promise<MangaList> {
  return searchManga({
    limit: 20,
    offset: 0,
    contentRating: ['safe', 'suggestive', 'erotica'],
    order: { latestUploadedChapter: 'desc' },
  });
}
