export interface MangaAttribute {
  title?: string;
  altTitles?: Record<string, string>[];
  description?: string;
  isLocked?: boolean;
  links?: Record<string, string>;
  originalLanguage?: string;
  lastVolume?: string;
  lastChapter?: string;
  publicationDemographic?: string;
  status?: "ongoing" | "completed" | "hiatus" | "cancelled";
  year?: number;
  contentRating?: "safe" | "suggestive" | "erotica" | "pornographic";
  tags?: {
    id: string;
    attributes: {
      name: Record<string, string>;
    };
  }[];
  state?: string;
  chapterNumbersResetOnNewVolume?: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  availableTranslatedLanguages?: string[];
  latestUploadedChapter?: string;
}

export interface MangaRelationship {
  id: string;
  type: "author" | "artist" | "cover_art" | "manga";
  attributes?: Record<string, any>;
  related?: string;
  relatedManga?: string;
}

export interface Manga {
  id: string;
  type: string;
  attributes: MangaAttribute;
  relationships: MangaRelationship[];
}

export interface MangaResponse {
  result: "ok" | "error";
  data?: Manga;
  response?: string;
}

export interface MangaList {
  result: "ok" | "error";
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
  response?: string;
}

export interface CoverAttribute {
  volume?: string;
  fileName: string;
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoverArt {
  id: string;
  type: string;
  attributes: CoverAttribute;
  relationships: MangaRelationship[];
}

export interface Chapter {
  id: string;
  type: string;
  attributes: {
    title?: string;
    chapter?: string;
    pages: number;
    translatedLanguage: string;
    uploader?: string;
    externalUrl?: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    publishAt: string;
    readableAt: string;
  };
  relationships: MangaRelationship[];
}

export interface ChapterList {
  result: "ok" | "error";
  data: Chapter[];
  limit: number;
  offset: number;
  total: number;
}

export interface AtHomeServer {
  result: "ok" | "error";
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface SearchParams {
  title?: string;
  limit?: number;
  offset?: number;
  status?: string[];
  includedTags?: string[];
  excludedTags?: string[];
  contentRating?: string[];
  order?: Record<string, "asc" | "desc">;
  includes?: string[];
}
