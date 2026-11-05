import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../../core/bible.service';
import { findBook } from '../../core/books';
import { CURIOSITIES_IN_ORDER, findCuriosity, VerseRange } from '../../core/curiosities';
import { CuriositiesService } from '../../core/curiosities.service';
import { findArticle } from '../../core/library';
import { SettingsService } from '../../core/settings.service';
import { findVersion } from '../../core/versions';
import { epochOfCuriosity } from '../../core/epochs';
import { EraChip } from '../../shared/era-chip';
import { SourcesBox } from '../../shared/sources-box';
import { ShareImageButton } from '../../shared/share-image-button';
import { curiosityCard } from '../../core/share-card';

interface Passage {
  range: VerseRange;
  reference: string;
  verses: { verse: number; text: string }[] | null;
}

@Component({
  selector: 'app-curiosity',
  imports: [BackButton, EraChip, ShareImageButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, SourcesBox],
  templateUrl: './curiosity.html',
  styleUrl: './curiosity.scss',
})
export class CuriosityPage {
  readonly id = input.required<string>();

  private readonly bible = inject(BibleService);
  private readonly settings = inject(SettingsService);
  private readonly service = inject(CuriositiesService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly curiosity = computed(() => findCuriosity(this.id()));
  protected readonly shareCard = computed(() => (this.curiosity() ? curiosityCard(this.curiosity()!) : null));
  /** O estudo que aprofunda esta curiosidade, quando há. */
  protected readonly study = computed(() => {
    const id = this.curiosity()?.study;
    return id ? findArticle(id) : undefined;
  });
  protected readonly epoch = computed(() => (this.curiosity() ? epochOfCuriosity(this.curiosity()!) : null));
  protected readonly version = computed(() => findVersion(this.settings.version()));

  protected readonly next = computed(() => {
    const index = CURIOSITIES_IN_ORDER.findIndex((c) => c.id === this.id());
    return CURIOSITIES_IN_ORDER[(index + 1) % CURIOSITIES_IN_ORDER.length];
  });

  protected readonly passages = toSignal(
    toObservable(computed(() => ({ curiosity: this.curiosity(), version: this.settings.version() }))).pipe(
      switchMap(({ curiosity, version }) => {
        if (!curiosity) return of({ loading: false, items: [] as Passage[] });
        const requests = curiosity.refs.map((range) =>
          this.bible.getChapter(version, range.bookId, range.chapter).pipe(
            map((verses) => verses.filter((v) => v.verse >= range.from && v.verse <= (range.to ?? range.from))),
            catchError(() => of(null)),
            map((verses): Passage => ({ range, reference: this.reference(range), verses })),
          ),
        );
        return combineLatest(requests).pipe(
          map((items) => ({ loading: false, items })),
          startWith({ loading: true, items: [] as Passage[] }),
        );
      }),
    ),
    { initialValue: { loading: true, items: [] as Passage[] } },
  );

  constructor() {
    const title = inject(Title);
    effect(() => {
      const curiosity = this.curiosity();
      if (curiosity) {
        title.setTitle('Você sabia? · Bíblia Sagrada');
        this.service.markRead(curiosity.id);
      }
    });
  }

  private reference(range: VerseRange): string {
    const verses = range.to ? `${range.from}-${range.to}` : `${range.from}`;
    return `${findBook(range.bookId)?.name} ${range.chapter}:${verses}`;
  }
}
