import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../core/bible.service';
import { Verse } from '../core/models';
import { parseReferences } from '../core/reference-parser';
import { findVersion } from '../core/versions';

/** O texto bíblico por extenso, na versão da língua da página (":::versiculo" dos jornais de Novas Vozes). */
@Component({
  selector: 'app-verse-quote',
  template: `
    <figure>
      @if (state().loading) {
        <div class="skeleton" aria-hidden="true"><span></span><span class="short"></span></div>
      } @else if (state().verses.length) {
        <blockquote>@for (v of state().verses; track $index) { <sup>{{ v.verse }}</sup>{{ v.text }} }</blockquote>
      } @else {
        <blockquote class="missing">Trecho não disponível agora.</blockquote>
      }
      <figcaption>{{ label() || state().label }} <span class="abbrev">· {{ abbrev() }}</span></figcaption>
    </figure>
  `,
  styles: `
    :host { display: block; }
    figure { margin: 0; }
    blockquote { margin: 0; font: italic 400 1.08em/1.65 var(--reading-font); color: var(--mat-sys-on-surface); }
    blockquote.missing { font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    sup { font: 600 .62em Inter, sans-serif; font-style: normal; color: var(--accent-gold); margin: 0 3px 0 2px; }
    figcaption { margin-top: 8px; font: 600 13px Inter, sans-serif; letter-spacing: .4px; color: var(--mat-sys-on-surface-variant); }
    .abbrev { font-weight: 500; }
    .skeleton { display: flex; flex-direction: column; gap: 10px; }
    .skeleton span { height: 14px; border-radius: 7px; background: var(--mat-sys-surface-container); animation: pulse 1.2s ease-in-out infinite; }
    .skeleton .short { width: 60%; }
    @keyframes pulse { 50% { opacity: .5; } }
    @media (prefers-reduced-motion: reduce) { .skeleton span { animation: none; } }
  `,
})
export class VerseQuote {
  readonly ref = input.required<string>();
  /** Nome da referência na língua da página ("Santiago 1:14-15"); vazio = o nome em português. */
  readonly label = input<string | undefined>();
  readonly version = input.required<string>();
  private readonly bible = inject(BibleService);

  protected readonly abbrev = computed(() => findVersion(this.version())?.abbrev ?? this.version().toUpperCase());

  protected readonly state = toSignal(
    toObservable(computed(() => ({ ref: this.ref(), version: this.version() }))).pipe(
      switchMap(({ ref, version }) => {
        const { refs } = parseReferences(ref);
        if (!refs.length) return of({ loading: false, verses: [] as Verse[], label: ref });
        return combineLatest(
          refs.map((r) =>
            this.bible.getChapter(version, r.bookId, r.chapter).pipe(
              map((verses) => (r.from === undefined ? verses : verses.filter((v) => v.verse >= r.from! && v.verse <= (r.to ?? r.from!)))),
              catchError(() => of([] as Verse[])),
            ),
          ),
        ).pipe(
          map((lists) => ({ loading: false, verses: lists.flat(), label: refs[0].label })),
          startWith({ loading: true, verses: [] as Verse[], label: refs[0].label }),
        );
      }),
    ),
    { initialValue: { loading: true, verses: [] as Verse[], label: '' } },
  );
}
