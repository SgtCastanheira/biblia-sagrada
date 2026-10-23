import { computed, effect, Injectable, signal } from '@angular/core';
import { ReadingFont, ThemeMode, VerseLayout } from './models';

interface LastRead {
  bookId: string;
  chapter: number;
}

const STORAGE_KEY = 'biblia.settings';

const FONT_FAMILIES: Record<ReadingFont, string> = {
  serif: "'Source Serif 4', Georgia, serif",
  classic: "'Lora', Georgia, serif",
  sans: "'Inter', Roboto, sans-serif",
};

const THEME_COLORS: Record<ThemeMode, string> = {
  light: '#faf8f5',
  sepia: '#f4ecdc',
  dark: '#161514',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}.${key}`, JSON.stringify(value));
  } catch {
    // armazenamento indisponível (modo privado etc.)
  }
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly version = signal(load('version', 'almeida'));
  readonly compareVersion = signal<string | null>(load('compareVersion', null));
  readonly fontSize = signal(load('fontSize', 19));
  readonly lineHeight = signal(load('lineHeight', 1.85));
  readonly font = signal<ReadingFont>(load('font', 'serif'));
  /** Um versículo por linha (padrão) ou texto corrido. */
  readonly verseLayout = signal<VerseLayout>(load('verseLayout', 'lines'));
  /** Sublinha no texto as palavras que estão no dicionário bíblico. */
  readonly studyWords = signal<boolean>(load('studyWords', true));
  /** Mostra o contexto histórico e as notas de estudo no início do capítulo. */
  readonly studyNotes = signal<boolean>(load('studyNotes', true));
  /** Camadas dos mapas: lugares ao redor, reinos da época e países de hoje. */
  readonly mapLayers = signal<{ nearby: boolean; era: boolean; modern: boolean }>(load('mapLayers', { nearby: true, era: true, modern: false }));
  readonly theme = signal<ThemeMode>(load('theme', load('darkMode', false) ? 'dark' : 'light'));
  readonly lastRead = signal<LastRead | null>(load('lastRead', null));
  /** Capítulos já abertos, por livro. */
  readonly readChapters = signal<Record<string, number[]>>(load('readChapters', {}));

  readonly totalRead = computed(() => Object.values(this.readChapters()).reduce((sum, c) => sum + c.length, 0));

  constructor() {
    effect(() => persist('version', this.version()));
    effect(() => persist('compareVersion', this.compareVersion()));
    effect(() => persist('fontSize', this.fontSize()));
    effect(() => persist('lineHeight', this.lineHeight()));
    effect(() => persist('verseLayout', this.verseLayout()));
    effect(() => persist('studyWords', this.studyWords()));
    effect(() => persist('studyNotes', this.studyNotes()));
    effect(() => persist('mapLayers', this.mapLayers()));
    effect(() => persist('lastRead', this.lastRead()));
    effect(() => persist('readChapters', this.readChapters()));
    effect(() => {
      const font = this.font();
      persist('font', font);
      document.documentElement.style.setProperty('--reading-font', FONT_FAMILIES[font]);
    });
    effect(() => {
      const theme = this.theme();
      persist('theme', theme);
      document.body.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
      document.body.classList.add(`theme-${theme}`);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
    });
  }

  changeFontSize(delta: number): void {
    this.fontSize.update((size) => Math.min(34, Math.max(13, size + delta)));
  }

  markRead(bookId: string, chapter: number): void {
    this.lastRead.set({ bookId, chapter });
    const current = this.readChapters()[bookId] ?? [];
    if (!current.includes(chapter)) {
      this.readChapters.update((all) => ({ ...all, [bookId]: [...current, chapter] }));
    }
  }

  isRead(bookId: string, chapter: number): boolean {
    return this.readChapters()[bookId]?.includes(chapter) ?? false;
  }

  readCount(bookId: string): number {
    return this.readChapters()[bookId]?.length ?? 0;
  }

  resetProgress(): void {
    this.readChapters.set({});
    this.lastRead.set(null);
  }
}
