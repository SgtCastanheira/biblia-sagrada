export type Testament = 'AT' | 'NT';
export type ThemeMode = 'light' | 'sepia' | 'dark';
export type ReadingFont = 'serif' | 'classic' | 'sans';
export type VerseLayout = 'lines' | 'paragraph';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface BookCategory {
  id: string;
  name: string;
  color: string;
}

export interface Book {
  id: string;
  name: string;
  abbrev: string;
  chapters: number;
  testament: Testament;
  category: BookCategory;
}

export interface BibleVersion {
  id: string;
  abbrev: string;
  name: string;
  language: string;
  flag: string;
  ntOnly?: boolean;
  /** Sigla curta para o círculo da lista de versões, quando a sigla não cabe ("ALM" para "ALM1911"). */
  badge?: string;
}

export interface Verse {
  verse: number;
  text: string;
}

export interface FavoriteVerse {
  bookId: string;
  chapter: number;
  verse: number;
  versionId: string;
  text: string;
  color: HighlightColor;
  savedAt: number;
}

export type VerseRef = Pick<FavoriteVerse, 'bookId' | 'chapter' | 'verse' | 'versionId'>;
