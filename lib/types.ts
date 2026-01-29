export type LocalizedString = Record<string, string>;

export type RelationshipType =
  | "manga"
  | "chapter"
  | "cover_art"
  | "author"
  | "artist"
  | "scanlation_group"
  | "tag"
  | "user"
  | "custom_list";

export interface Relationship {
  id: string;
  type: RelationshipType;
  related?: string;
  attributes?: Record<string, any>;
}

export interface Tag {
  id: string;
  type: "tag";
  attributes: {
    name: LocalizedString;
    description: LocalizedString;
    group: string;
    version: number;
  };
}

export interface MangaAttributes {
  title: LocalizedString;
  altTitles: LocalizedString[];
  description: LocalizedString;
  isLocked: boolean;
  links: Record<string, string>;
  originalLanguage: string;
  lastVolume: string | null;
  lastChapter: string | null;
  publicationDemographic: "shounen" | "shoujo" | "josei" | "seinen" | null;
  status: "ongoing" | "completed" | "hiatus" | "cancelled";
  year: number | null;
  contentRating: "safe" | "suggestive" | "erotica" | "pornographic";
  tags: Tag[];
  state: "draft" | "submitted" | "published" | "rejected";
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string;
}

export interface Manga {
  id: string;
  type: "manga";
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface MangaResponse {
  result: "ok" | "error";
  response: string;
  data: Manga;
}

export interface MangaList {
  result: "ok" | "error";
  response: string;
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
}

export interface ChapterAttributes {
  title: string | null;
  volume: string | null;
  chapter: string | null;
  pages: number;
  translatedLanguage: string;
  uploader: string;
  externalUrl: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishAt: string;
  readableAt: string;
}

export interface Chapter {
  id: string;
  type: "chapter";
  attributes: ChapterAttributes;
  relationships: Relationship[];
}

export interface ChapterList {
  result: "ok" | "error";
  response: string;
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
  includes?: RelationshipType[];
}

export type ReadingStatus = "reading" | "completed" | "on_hold" | "dropped" | "plan_to_read";

export interface LibraryItem {
  mangaId: string;
  mangaTitle: string;
  coverArt: string;
  status: ReadingStatus;
  addedAt: string;
  lastReadAt?: string;
  lastChapterRead?: string;
  totalChapters?: number;
}

export interface HistoryItem {
  mangaId: string;
  mangaTitle: string;
  chapterId: string;
  chapterNumber: string;
  volumeNumber: string | null;
  pageNumber: number;
  timestamp: string;
}

export interface UserData {
  library: Record<string, LibraryItem>;
  history: HistoryItem[];
  user: {
    username: string;
    email: string;
  } | null;
}
