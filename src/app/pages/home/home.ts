import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
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
];

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

  protected readonly highlight = HIGHLIGHTS[Math.floor(Date.now() / 86_400_000) % HIGHLIGHTS.length];
  protected readonly highlightBook = findBook(this.highlight.bookId)!;
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly versionsCount = VERSIONS.length;
  protected readonly totalChapters = TOTAL_CHAPTERS;
  protected readonly study: { link: string; queryParams?: Record<string, string>; icon: string; name: string; description: string }[] = STUDY;
  protected readonly popular = POPULAR.map((p) => ({ ...p, book: findBook(p.bookId)! }));

  protected readonly highlightText = toSignal(
    toObservable(this.settings.version).pipe(
      switchMap((version) =>
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
