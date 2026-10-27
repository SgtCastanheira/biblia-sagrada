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

/** Cor da barra do navegador em cada paleta (a do tema 'auto' vem da paleta que estiver valendo). */
const THEME_COLORS: Record<Exclude<ThemeMode, 'auto'>, string> = {
  light: '#faf8f5',
  sepia: '#f4ecdc',
  mist: '#eceee9',
  dark: '#161514',
  ember: '#1a1511',
  forest: '#14201a',
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
  /** Luz quente (0–100): um véu âmbar que tira o azul da tela, para ler à noite. */
  readonly warmth = signal<number>(load('warmth', 0));
  /** O aparelho está no modo escuro? (usado pelo tema 'auto') */
  private readonly systemDark = signal(typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches);
  /** A paleta que está valendo agora: o 'auto' vira claro ou escuro conforme o aparelho. */
  readonly activeTheme = computed<Exclude<ThemeMode, 'auto'>>(() => {
    const t = this.theme();
    return t === 'auto' ? (this.systemDark() ? 'dark' : 'light') : t;
  });
  readonly lastRead = signal<LastRead | null>(load('lastRead', null));
  /** A fitinha: o capítulo onde a pessoa parou. */
  readonly bookmark = signal<LastRead | null>(load('bookmark', null));
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
    effect(() => persist('bookmark', this.bookmark()));
    effect(() => persist('readChapters', this.readChapters()));
    effect(() => {
      const font = this.font();
      persist('font', font);
      document.documentElement.style.setProperty('--reading-font', FONT_FAMILIES[font]);
    });
    effect(() => persist('warmth', this.warmth()));
    if (typeof matchMedia !== 'undefined') {
      matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => this.systemDark.set(e.matches));
    }
    effect(() => {
      persist('theme', this.theme());
      const active = this.activeTheme();
      document.body.classList.remove('theme-light', 'theme-sepia', 'theme-mist', 'theme-dark', 'theme-ember', 'theme-forest');
      document.body.classList.add(`theme-${active}`);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[active]);
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
