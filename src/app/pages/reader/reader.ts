import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, computed, effect, inject, Injector, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { BibleService, isRateLimit, LOCAL_VERSIONS } from '../../core/bible.service';
import { BOOKS, findBook } from '../../core/books';
import { ContentService } from '../../core/content.service';
import { DictionaryMatcher, TextPart } from '../../core/dictionary';
import { parseReferences } from '../../core/reference-parser';
import { FavoritesService } from '../../core/favorites.service';
import { Verse } from '../../core/models';
import { SettingsService } from '../../core/settings.service';
import { UiService } from '../../core/ui.service';
import { articlesFor } from '../../core/library';
import { mapsFor } from '../../core/maps';
import { TRIBE_CHAPTERS } from '../../core/tribes';
import { findVersion } from '../../core/versions';
import { Sheets } from '../../shared/sheets';

interface VerseRow {
  verse: number;
  text?: string;
  compareText?: string;
}

interface ChapterState {
  loading: boolean;
  error?: string;
  compareError?: string;
  rows: VerseRow[];
}

interface ChapterLink {
  bookId: string;
  chapter: number;
  label: string;
}

@Component({
  selector: 'app-reader',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule, MatTooltipModule],
  templateUrl: './reader.html',
  styleUrl: './reader.scss',
  host: {
    '(document:keydown.arrowleft)': 'goTo(previous())',
    '(document:keydown.arrowright)': 'goTo(next())',
  },
})
export class ReaderPage {
  readonly book = input.required<string>();
  readonly chapter = input.required<string>();

  protected readonly settings = inject(SettingsService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly ui = inject(UiService);
  private readonly bible = inject(BibleService);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly injector = inject(Injector);
  private readonly content = inject(ContentService);

  protected readonly fragment = toSignal(inject(ActivatedRoute).fragment);
  protected readonly bookInfo = computed(() => findBook(this.book()));
  protected readonly chapterNum = computed(() => Number(this.chapter()));
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly compare = computed(() => findVersion(this.settings.compareVersion() ?? ''));

  protected readonly maps = computed(() => mapsFor(this.book(), this.chapterNum()));
  protected readonly lessons = computed(() => articlesFor(this.book(), this.chapterNum()));
  protected readonly previous = computed(() => this.neighbour(-1));
  protected readonly next = computed(() => this.neighbour(1));

  private readonly retry = signal(0);
  private readonly request = computed(() => ({
    bookId: this.book(),
    chapter: this.chapterNum(),
    version: this.settings.version(),
    compare: this.settings.compareVersion(),
    retry: this.retry(),
  }));

  protected readonly state = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ bookId, chapter, version, compare }) => {
        const main$ = this.load(version, bookId, chapter);
        const compare$ = compare ? this.load(compare, bookId, chapter) : of(null);
        return combineLatest([main$, compare$]).pipe(
          map(([main, other]): ChapterState => {
            if (main.error) {
              return { loading: false, error: main.error, rows: [] };
            }
            const rows = new Map<number, VerseRow>();
            main.verses.forEach((v) => rows.set(v.verse, { verse: v.verse, text: v.text }));
            other?.verses.forEach((v) => {
              const row = rows.get(v.verse) ?? { verse: v.verse };
              rows.set(v.verse, { ...row, compareText: v.text });
            });
            return {
              loading: false,
              compareError: other?.error,
              rows: [...rows.values()].sort((a, b) => a.verse - b.verse),
            };
          }),
          startWith<ChapterState>({ loading: true, rows: [] }),
        );
      }),
    ),
    { initialValue: { loading: true, rows: [] } as ChapterState },
  );

  protected readonly comparing = computed(() => !!this.compare() && !this.state().compareError);

  // Estudo: palavras do dicionário marcadas no texto, contexto do livro e notas do capítulo
  private readonly matcher = toSignal(this.content.dictionary.pipe(map((entries) => new DictionaryMatcher(entries))));
  protected readonly intro = toSignal(toObservable(this.book).pipe(switchMap((id) => this.content.intro(id))));
  protected readonly notes = toSignal(
    toObservable(computed(() => ({ book: this.book(), chapter: this.chapterNum() }))).pipe(
      switchMap(({ book, chapter }) => this.content.notes(book, chapter)),
    ),
    { initialValue: [] },
  );
  protected readonly studyOpen = signal(false);

  /** Profecias dadas neste capítulo ou que se cumprem nele. */
  private readonly prophecies = toSignal(
    toObservable(computed(() => ({ book: this.book(), chapter: this.chapterNum() }))).pipe(
      switchMap(({ book, chapter }) =>
        this.content.prophecies.pipe(
          map((list) => {
            const here = (text: string) => parseReferences(text).refs.some((r) => r.bookId === book && r.chapter === chapter);
            return list
              .filter((p) => here(p.ref) || p.fulfillment.some((f) => here(f.ref)))
              .map((p) => ({ ...p, given: here(p.ref) }));
          }),
        ),
      ),
    ),
    { initialValue: [] },
  );

  /** Aulas, mapas e profecias do capítulo — sempre com os mesmos ícones e nesta ordem. */
  protected readonly links = computed(() => [
    ...this.lessons().map((a) => ({ icon: 'school', kind: a.collection === 'contexto' ? 'Aula de contexto' : 'Estudo', title: a.title, link: `/artigo/${a.id}` })),
    ...(TRIBE_CHAPTERS.includes(`${this.book()} ${this.chapterNum()}`) ? [{ icon: 'school', kind: 'Estudo', title: 'As doze tribos de Israel', link: '/tribos' }] : []),
    ...this.maps().map((m) => ({ icon: 'map', kind: 'Mapa', title: m.title, link: `/mapas/${m.id}` })),
    ...this.prophecies().map((p) => ({ icon: 'visibility', kind: p.given ? 'Profecia' : 'Cumprimento de profecia', title: p.title, link: `/profecias/${p.id}` })),
  ]);

  protected readonly studyItems = computed(() => [
    ...(this.intro() ? ['contexto'] : []),
    ...(this.notes().length ? ['notas'] : []),
    ...this.links().map((l) => l.icon),
  ]);

  protected readonly studySummary = computed(() => {
    const parts: string[] = [];
    if (this.intro()) parts.push('Contexto');
    const n = this.notes().length;
    if (n) parts.push(`${n} ${n === 1 ? 'nota' : 'notas'}`);
    const count = (icon: string, one: string, many: string) => {
      const k = this.links().filter((l) => l.icon === icon).length;
      if (k) parts.push(`${k} ${k === 1 ? one : many}`);
    };
    count('school', 'aula', 'aulas');
    count('map', 'mapa', 'mapas');
    count('visibility', 'profecia', 'profecias');
    return parts.join(' · ');
  });

  /** Partes de cada versículo; cada termo do dicionário é marcado só na primeira vez no capítulo. */
  private readonly wordParts = computed(() => {
    const matcher = this.matcher();
    const parts = new Map<number, TextPart[]>();
    if (!matcher || !this.settings.studyWords() || this.comparing()) return parts;
    const seen = new Set<string>();
    for (const row of this.state().rows) {
      if (row.text) parts.set(row.verse, matcher.split(row.text, seen));
    }
    return parts;
  });

  private touchStart: { x: number; y: number } | null = null;

  constructor() {
    const title = inject(Title);
    effect(() => {
      const book = this.bookInfo();
      if (book) {
        title.setTitle(`${book.name} ${this.chapterNum()} · Bíblia Sagrada`);
        this.settings.markRead(book.id, this.chapterNum());
      }
    });

    effect(() => {
      this.chapterNum();
      this.studyOpen.set(false);
    });

    // Rola até o versículo indicado na URL (#v16) depois que o capítulo carregar.
    effect(() => {
      const fragment = this.fragment();
      if (!this.state().loading && fragment) {
        afterNextRender(() => document.getElementById(fragment)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), {
          injector: this.injector,
        });
      }
    });
  }

  protected partsOf(row: VerseRow): TextPart[] {
    return this.wordParts().get(row.verse) ?? [{ text: row.text ?? '' }];
  }

  protected openWord(event: Event, entryId: string, verse: number): void {
    event.stopPropagation();
    this.sheets.dictionary(entryId, { bookId: this.book(), chapter: this.chapterNum(), verse });
  }

  protected openChapters(): void {
    this.sheets.chapters({ bookId: this.book(), chapter: this.chapterNum() });
  }

  protected openSettings(): void {
    this.sheets.readingSettings();
  }

  protected async changeVersion(): Promise<void> {
    const id = await this.sheets.pickVersion({ title: 'Versão principal', current: this.settings.version() });
    if (id) this.settings.version.set(id);
  }

  protected async changeCompare(): Promise<void> {
    const id = await this.sheets.pickVersion({ title: 'Comparar com', current: this.settings.compareVersion() });
    if (id) this.settings.compareVersion.set(id);
  }

  protected stopCompare(): void {
    this.settings.compareVersion.set(null);
  }

  protected readonly isLocal = computed(() => LOCAL_VERSIONS.has(this.settings.version()));

  protected readAlmeida(): void {
    this.settings.version.set('almeida');
  }

  protected reload(): void {
    this.retry.update((n) => n + 1);
  }

  protected goTo(target: ChapterLink | null): void {
    if (target) {
      this.router.navigate(['/ler', target.bookId, target.chapter]);
    }
  }

  protected highlightOf(verse: number): string | null {
    const fav = this.favorites.get({ ...this.verseRef(verse) });
    return fav ? `var(--hl-${fav.color})` : null;
  }

  protected openVerse(row: VerseRow): void {
    if (!row.text) return;
    this.sheets.verseActions({
      ref: this.verseRef(row.verse),
      reference: `${this.bookInfo()?.name} ${this.chapterNum()}:${row.verse}`,
      versionAbbrev: this.version()?.abbrev ?? '',
      text: row.text,
    });
  }

  // Deslizar para os lados troca de capítulo (celular)
  protected onTouchStart(e: TouchEvent): void {
    const t = e.changedTouches[0];
    this.touchStart = { x: t.clientX, y: t.clientY };
  }

  protected onTouchEnd(e: TouchEvent): void {
    if (!this.touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - this.touchStart.x;
    const dy = t.clientY - this.touchStart.y;
    this.touchStart = null;
    if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy) * 2) {
      this.goTo(dx < 0 ? this.next() : this.previous());
    }
  }

  private verseRef(verse: number) {
    return { bookId: this.book(), chapter: this.chapterNum(), verse, versionId: this.settings.version() };
  }

  private neighbour(direction: 1 | -1): ChapterLink | null {
    const book = this.bookInfo();
    if (!book) return null;
    const chapter = this.chapterNum() + direction;
    if (chapter >= 1 && chapter <= book.chapters) {
      return { bookId: book.id, chapter, label: `${book.name} ${chapter}` };
    }
    const other = BOOKS[BOOKS.indexOf(book) + direction];
    if (!other) return null;
    const otherChapter = direction === 1 ? 1 : other.chapters;
    return { bookId: other.id, chapter: otherChapter, label: `${other.name} ${otherChapter}` };
  }

  private load(version: string, bookId: string, chapter: number): Observable<{ verses: Verse[]; error?: string }> {
    return this.bible.getChapter(version, bookId, chapter).pipe(
      map((verses) => ({ verses })),
      catchError((err: HttpErrorResponse) => of({ verses: [], error: this.errorMessage(err, version) })),
    );
  }

  private errorMessage(err: HttpErrorResponse, versionId: string): string {
    const version = findVersion(versionId);
    if (err.status === 404) {
      return version?.ntOnly && this.bookInfo()?.testament === 'AT'
        ? `A versão ${version.name} contém apenas o Novo Testamento.`
        : `Este capítulo não está disponível na versão ${version?.name ?? versionId}.`;
    }
    if (!navigator.onLine) {
      return 'Você está offline e este capítulo ainda não foi aberto neste aparelho. Ele ficará disponível offline depois da primeira leitura com internet.';
    }
    if (isRateLimit(err)) {
      return `A fonte da versão ${version?.name ?? versionId} limitou as leituras por alguns minutos. Tente de novo daqui a pouco — ou leia na Almeida, que funciona sem limite e sem internet.`;
    }
    return 'Não foi possível carregar o capítulo. Verifique sua conexão com a internet.';
  }
}
