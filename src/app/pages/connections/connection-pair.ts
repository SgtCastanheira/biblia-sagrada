import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../../core/bible.service';
import { parseReferences } from '../../core/reference-parser';
import { SettingsService } from '../../core/settings.service';
import type { ConnectionPassage } from './connection-passages';

/** Quantos caracteres de cada versículo aparecem de cara (cartão e nó compacto do mapa); o botão abre o texto inteiro. */
const EXCERPT = 240;
const EXCERPT_COMPACT = 110;

interface PairTexts {
  loading: boolean;
  from: string | null;
  to: string | null;
}

const LOADING: PairTexts = { loading: true, from: null, to: null };

/**
 * Os dois versículos de uma ligação, lado a lado e em linguagem simples: “esta passagem” e “liga com”.
 * Quem lê não precisa saber o que é referência cruzada: vê as duas frases e compara.
 */
@Component({
  selector: 'app-connection-pair',
  host: { '[class.stacked]': 'stacked()', '[class.compact]': 'compact()' },
  template: `
    <div class="sides">
      <div class="side">
        <span class="tag">Esta passagem</span>
        <strong class="ref">{{ pair().from }}</strong>
        <blockquote class="reading-font">{{ texts().loading ? '…' : texts().from ?? unavailable }}</blockquote>
      </div>
      <span class="mid" aria-hidden="true">↔</span>
      <div class="side to">
        <span class="tag">Liga com</span>
        <strong class="ref">{{ pair().to }}</strong>
        <blockquote class="reading-font">{{ texts().loading ? '…' : texts().to ?? unavailable }}</blockquote>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .sides { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
    .side { min-width: 0; padding: 12px 14px; border-radius: 12px; background: var(--mat-sys-surface-container-low); border-left: 3px solid var(--accent-gold); }
    .side.to { border-left-color: var(--mat-sys-primary); }
    .tag { display: block; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .ref { display: block; margin: 2px 0 6px; font: 600 16px/1.4 var(--heading-font); color: var(--mat-sys-on-surface); }
    blockquote { margin: 0; font-size: 16px; line-height: 1.6; color: var(--mat-sys-on-surface); overflow-wrap: anywhere; }
    .mid { justify-self: center; font: 600 20px/1 Inter, sans-serif; color: var(--mat-sys-primary); transform: rotate(90deg); }
    @media (min-width: 640px) {
      .sides { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: stretch; }
      .mid { align-self: center; transform: none; }
    }
    :host(.stacked) .sides { grid-template-columns: minmax(0, 1fr); }
    :host(.stacked) .mid { align-self: auto; transform: rotate(90deg); }
    /* Nó do mapa mental: só as duas referências e um trecho curto de cada, como as pontas dos ramos. */
    :host(.compact) .sides { grid-template-columns: minmax(0, 1fr); gap: 6px; }
    :host(.compact) .side { padding: 6px 10px; }
    :host(.compact) .tag, :host(.compact) .mid { display: none; }
    :host(.compact) .ref { margin: 0 0 2px; font-size: 15px; }
    :host(.compact) .to .ref::before { content: '↔ '; color: var(--mat-sys-primary); }
    :host(.compact) blockquote { font-size: 14px; line-height: 1.45; }
  `,
})
export class ConnectionPair {
  readonly pair = input.required<ConnectionPassage>();
  /** Um texto embaixo do outro, mesmo em tela larga (os ramos do mapa mental são estreitos). */
  readonly stacked = input(false);
  /** Versão enxuta para as pontas do mapa mental. */
  readonly compact = input(false);
  private readonly bible = inject(BibleService);
  private readonly settings = inject(SettingsService);
  protected readonly unavailable = 'Texto não disponível nesta versão da Bíblia.';
  protected readonly texts = toSignal(
    toObservable(computed(() => ({ refs: this.pair().refs, version: this.settings.version(), max: this.compact() ? EXCERPT_COMPACT : EXCERPT }))).pipe(
      switchMap(({ refs, version, max }) => {
        const { refs: parsed } = parseReferences(refs);
        if (parsed.length < 2) return of<PairTexts>({ loading: false, from: null, to: null });
        const load = (ref: (typeof parsed)[number]) =>
          this.bible.getChapter(version, ref.bookId, ref.chapter).pipe(
            map((verses) => verses.filter((v) => ref.from === undefined || (v.verse >= ref.from && v.verse <= (ref.to ?? ref.from)))),
            map((verses) => excerpt(verses.map((v) => v.text).join(' '), max)),
            catchError(() => of(null)),
          );
        return combineLatest([load(parsed[0]), load(parsed[1])]).pipe(
          map(([from, to]): PairTexts => ({ loading: false, from, to })),
          startWith(LOADING),
        );
      }),
    ),
    { initialValue: LOADING },
  );
}

/** Corta no fim de uma palavra para o cartão não virar uma parede de texto. */
function excerpt(text: string, max: number): string | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > max / 2 ? space : max).replace(/[\s,;:.]+$/, '')}…`;
}
