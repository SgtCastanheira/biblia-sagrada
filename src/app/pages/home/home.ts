import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../../core/bible.service';
import { BOOKS, findBook } from '../../core/books';
import { CuriositiesService } from '../../core/curiosities.service';
import { formatLong } from '../../core/dates';
import { DevotionalService } from '../../core/devotional.service';
import { EbdService } from '../../core/ebd.service';
import { FavoritesService } from '../../core/favorites.service';
import { SettingsService } from '../../core/settings.service';
import { findVersion, VERSIONS } from '../../core/versions';
import { Sheets } from '../../shared/sheets';

/** Versículos sorteados na tela inicial: um diferente a cada vez que ela é aberta. */
const HIGHLIGHTS = [
  { bookId: 'JHN', chapter: 3, verse: 16 },
  { bookId: 'PSA', chapter: 23, verse: 1 },
  { bookId: 'PHP', chapter: 4, verse: 13 },
  { bookId: 'ROM', chapter: 8, verse: 28 },
  { bookId: 'ISA', chapter: 41, verse: 10 },
  { bookId: 'PRO', chapter: 3, verse: 5 },
  { bookId: 'JER', chapter: 29, verse: 11 },
  { bookId: 'MAT', chapter: 11, verse: 28 },
  { bookId: 'JOS', chapter: 1, verse: 9 },
  { bookId: 'PSA', chapter: 46, verse: 1 },
  { bookId: 'PSA', chapter: 91, verse: 1 },
  { bookId: 'PSA', chapter: 121, verse: 1 },
  { bookId: 'PSA', chapter: 27, verse: 1 },
  { bookId: 'PSA', chapter: 37, verse: 5 },
  { bookId: 'PSA', chapter: 119, verse: 105 },
  { bookId: 'PSA', chapter: 34, verse: 8 },
  { bookId: 'PSA', chapter: 103, verse: 2 },
  { bookId: 'PSA', chapter: 139, verse: 14 },
  { bookId: 'PSA', chapter: 51, verse: 10 },
  { bookId: 'PSA', chapter: 30, verse: 5 },
  { bookId: 'PRO', chapter: 16, verse: 3 },
  { bookId: 'PRO', chapter: 18, verse: 10 },
  { bookId: 'ISA', chapter: 40, verse: 31 },
  { bookId: 'ISA', chapter: 43, verse: 2 },
  { bookId: 'ISA', chapter: 53, verse: 5 },
  { bookId: 'ISA', chapter: 26, verse: 3 },
  { bookId: 'LAM', chapter: 3, verse: 22 },
  { bookId: 'LAM', chapter: 3, verse: 23 },
  { bookId: 'NUM', chapter: 6, verse: 24 },
  { bookId: 'DEU', chapter: 31, verse: 6 },
  { bookId: 'MAT', chapter: 5, verse: 14 },
  { bookId: 'MAT', chapter: 6, verse: 33 },
  { bookId: 'MAT', chapter: 7, verse: 7 },
  { bookId: 'MAT', chapter: 28, verse: 20 },
  { bookId: 'MRK', chapter: 9, verse: 23 },
  { bookId: 'MRK', chapter: 11, verse: 24 },
  { bookId: 'LUK', chapter: 1, verse: 37 },
  { bookId: 'JHN', chapter: 8, verse: 32 },
  { bookId: 'JHN', chapter: 10, verse: 10 },
  { bookId: 'JHN', chapter: 14, verse: 6 },
  { bookId: 'JHN', chapter: 14, verse: 27 },
  { bookId: 'JHN', chapter: 15, verse: 5 },
  { bookId: 'JHN', chapter: 16, verse: 33 },
  { bookId: 'ACT', chapter: 1, verse: 8 },
  { bookId: 'ROM', chapter: 5, verse: 8 },
  { bookId: 'ROM', chapter: 8, verse: 1 },
  { bookId: 'ROM', chapter: 8, verse: 31 },
  { bookId: 'ROM', chapter: 10, verse: 9 },
  { bookId: 'ROM', chapter: 12, verse: 2 },
  { bookId: 'ROM', chapter: 15, verse: 13 },
  { bookId: '1CO', chapter: 10, verse: 13 },
  { bookId: '1CO', chapter: 13, verse: 4 },
  { bookId: '2CO', chapter: 5, verse: 17 },
  { bookId: '2CO', chapter: 12, verse: 9 },
  { bookId: 'GAL', chapter: 2, verse: 20 },
  { bookId: 'GAL', chapter: 6, verse: 9 },
  { bookId: 'EPH', chapter: 2, verse: 8 },
  { bookId: 'EPH', chapter: 3, verse: 20 },
  { bookId: 'EPH', chapter: 6, verse: 10 },
  { bookId: 'PHP', chapter: 4, verse: 6 },
  { bookId: 'PHP', chapter: 4, verse: 19 },
  { bookId: 'COL', chapter: 3, verse: 23 },
  { bookId: '2TI', chapter: 1, verse: 7 },
  { bookId: 'HEB', chapter: 4, verse: 16 },
  { bookId: 'HEB', chapter: 11, verse: 1 },
  { bookId: 'HEB', chapter: 13, verse: 8 },
  { bookId: 'JAS', chapter: 1, verse: 5 },
  { bookId: '1PE', chapter: 5, verse: 7 },
  { bookId: '1JN', chapter: 1, verse: 9 },
  { bookId: '1JN', chapter: 4, verse: 8 },
  { bookId: 'REV', chapter: 3, verse: 20 },
  { bookId: 'REV', chapter: 21, verse: 4 },
];

const LAST_VERSE_KEY = 'biblia.home.lastVerse';

function pickVerse(): (typeof HIGHLIGHTS)[number] {
  let last = -1;
  try {
    last = Number(sessionStorage.getItem(LAST_VERSE_KEY) ?? -1);
  } catch {
    // Sem armazenamento: só sorteia
  }
  let i = Math.floor(Math.random() * HIGHLIGHTS.length);
  if (i === last) i = (i + 1) % HIGHLIGHTS.length;
  try {
    sessionStorage.setItem(LAST_VERSE_KEY, String(i));
  } catch {
    // ignorado
  }
  return HIGHLIGHTS[i];
}

const POPULAR = [
  { bookId: 'GEN', chapter: 1, title: 'A Criação', icon: 'public' },
  { bookId: 'PSA', chapter: 23, title: 'O Bom Pastor', icon: 'grass' },
  { bookId: 'MAT', chapter: 5, title: 'Sermão do Monte', icon: 'landscape' },
  { bookId: 'JHN', chapter: 1, title: 'O Verbo se fez carne', icon: 'light_mode' },
  { bookId: '1CO', chapter: 13, title: 'O amor', icon: 'favorite' },
  { bookId: 'ROM', chapter: 8, title: 'Vida no Espírito', icon: 'air' },
  { bookId: 'PSA', chapter: 91, title: 'Proteção divina', icon: 'shield' },
  { bookId: 'REV', chapter: 21, title: 'Novo céu e nova terra', icon: 'wb_twilight' },
];

const STUDY = [
  { link: '/atlas', icon: 'public', name: 'Atlas histórico', description: 'Reinos e impérios, época por época' },
  { link: '/genealogia', icon: 'account_tree', name: 'Genealogia de Jesus', description: 'De Adão a Maria, com os reis' },
  { link: '/profecias', icon: 'visibility', name: 'Profecias', description: 'Do anúncio ao cumprimento' },
  { link: '/artigo/cativeiros-de-israel', icon: 'link_off', name: 'Os cativeiros de Israel', description: 'Para onde o povo foi levado — com mapa' },
  { link: '/memorial', icon: 'military_tech', name: 'Memorial da Fé', description: 'Heróis da fé, profetas, reis e nazireus' },
  { link: '/avivamento', icon: 'campaign', name: 'Sermões históricos', description: 'Wesley, Spurgeon, Moody, Seymour…' },
  { link: '/historia', icon: 'history_edu', name: 'História da Igreja', description: 'Das perseguições às reformas' },
  { link: '/dicionario', icon: 'translate', name: 'Dicionário bíblico', description: 'Hebraico, grego, aramaico e latim' },
];

const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomePage {
  protected readonly settings = inject(SettingsService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly curiosities = inject(CuriositiesService);
  protected readonly ebd = inject(EbdService);
  protected readonly devotional = inject(DevotionalService);
  protected readonly formatLong = formatLong;
  private readonly bible = inject(BibleService);
  private readonly sheets = inject(Sheets);

  protected readonly greeting = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  })();
  protected readonly today = (() => {
    const text = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return text.charAt(0).toUpperCase() + text.slice(1);
  })();

  /** Sorteado a cada vez que a tela abre (ou ao tocar em "Outro versículo"), sem repetir o anterior. */
  protected readonly highlightSignal = signal(pickVerse());
  protected get highlight() {
    return this.highlightSignal();
  }
  protected get highlightBook() {
    return findBook(this.highlight.bookId)!;
  }
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly versionsCount = VERSIONS.length;
  protected readonly totalChapters = TOTAL_CHAPTERS;
  protected readonly study: { link: string; queryParams?: Record<string, string>; icon: string; name: string; description: string }[] = STUDY;
  protected readonly popular = POPULAR.map((p) => ({ ...p, book: findBook(p.bookId)! }));

  protected readonly highlightText = toSignal(
    combineLatest([toObservable(this.settings.version), toObservable(this.highlightSignal)]).pipe(
      switchMap(([version]) =>
        this.bible.getChapter(version, this.highlight.bookId, this.highlight.chapter).pipe(
          map((verses) => ({ loading: false, text: verses.find((v) => v.verse === this.highlight.verse)?.text ?? null })),
          catchError(() => of({ loading: false, text: null })),
          startWith({ loading: true, text: null as string | null }),
        ),
      ),
    ),
    { initialValue: { loading: true, text: null } },
  );

  protected readonly lastRead = computed(() => {
    const last = this.settings.lastRead();
    const book = last && findBook(last.bookId);
    if (!book) return null;
    const read = this.settings.readCount(book.id);
    return { book, chapter: last.chapter, read, progress: Math.round((read / book.chapters) * 100) };
  });

  protected readonly overallProgress = computed(() =>
    ((this.settings.totalRead() / TOTAL_CHAPTERS) * 100).toFixed(1).replace('.', ','),
  );

  protected anotherVerse(): void {
    this.highlightSignal.set(pickVerse());
  }

  protected shareHighlight(): void {
    const text = this.highlightText().text;
    if (!text) return;
    this.sheets.verseActions({
      ref: { ...this.highlight, versionId: this.settings.version() },
      reference: `${this.highlightBook.name} ${this.highlight.chapter}:${this.highlight.verse}`,
      versionAbbrev: this.version()?.abbrev ?? '',
      text,
    });
  }
}
