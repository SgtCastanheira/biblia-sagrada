import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { chapterAt, isChapter, spanLabel, type ChapterRef, type Neighbor, type Span } from '../../core/bible-connections';
import { Sheets } from '../../shared/sheets';
import { ConnectionMindmap } from './connection-mindmap';
import { ConnectionPair } from './connection-pair';
import { ConnectionReferences, type PairsResult } from './connection-references';

/** Quantos pares aparecem de cara, e quantos entram a cada “mostrar mais”: poucos, para dar para ler um a um. */
const STEP = 4;

type ReadingChoice = ChapterRef & { refs: number };

/** Os dois lados de uma ligação: carrega apenas os livros necessários e abre os textos no leitor de passagens do app. */
@Component({
  selector: 'app-connection-readings',
  imports: [ConnectionPair, ConnectionMindmap],
  template: `
    <section class="reading-connections" aria-labelledby="connection-reading-title" [attr.aria-busy]="state().key !== selectionKey() || state().loading">
      <h3 #heading id="connection-reading-title" tabindex="-1">Leia as passagens conectadas</h3>
      <p class="intro">Escolha um capítulo que se liga a {{ sourceLabel() }} e leia, lado a lado, os versículos que a Bíblia liga entre si.</p>
      <div class="views" role="group" aria-label="Como ver as ligações">
        <button type="button" [attr.aria-pressed]="mode() === 'cartoes'" (click)="mode.set('cartoes')">Cartões lado a lado</button>
        <button type="button" [attr.aria-pressed]="mode() === 'mapa'" (click)="mode.set('mapa')">Mapa mental</button>
      </div>
      @if (mode() === 'mapa') {
        <app-connection-mindmap [selected]="selected()" [links]="links()" [target]="target()" />
      } @else {
      <label class="destination">
        <span>Comparar {{ sourceLabel() }} com</span>
        <select aria-label="Passagem conectada" [value]="active()?.index ?? ''" (change)="select($any($event.target).value)">
          @for (choice of choices(); track choice.index) {
            <option [value]="choice.index">{{ choice.label }} · {{ choice.refs }} {{ choice.refs === 1 ? 'ligação' : 'ligações' }}</option>
          }
        </select>
      </label>
      @if (active(); as target) {
        <div class="chapter-pair">
          <strong>{{ sourceLabel() }}</strong><span aria-hidden="true">↔</span><strong>{{ target.label }}</strong>
        </div>
        <p class="hint">Cada cartão traz um versículo de {{ sourceLabel() }} e o versículo que se liga a ele. O botão abre os dois textos inteiros, sem sair desta tela.</p>
        @if (state().key !== selectionKey() || state().loading) {
          <p class="message">Buscando os versículos desta ligação…</p>
        } @else if (state().failed) {
          <p class="message" role="alert">Os versículos desta ligação ainda não estão disponíveis neste aparelho. Você pode abrir o capítulo para ler.</p>
          <button type="button" class="retry" (click)="retry.update(increment)">Tentar carregar os versículos de novo</button>
        } @else if (state().pairs.length) {
          <div class="pairs">
            @for (pair of state().pairs.slice(0, visible()); track pair.key) {
              <article class="connection-pair">
                <app-connection-pair [pair]="pair" />
                <button type="button" [attr.aria-label]="'Ler as duas passagens: ' + pair.from + ' e ' + pair.to" (click)="open(pair.refs)">Ler os dois textos inteiros</button>
              </article>
            }
          </div>
          @if (state().pairs.length > visible()) {
            <button type="button" class="more" (click)="visible.set(visible() + step)">Mostrar mais pares de versículos ({{ state().pairs.length - visible() }} restantes)</button>
          }
        } @else {
          <p class="message">Não foi possível detalhar os versículos deste par. Você pode ler os capítulos completos.</p>
        }
        <button type="button" class="whole" (click)="open(wholeRefs())">{{ wholeLabel() }}</button>
      }
      }
    </section>
  `,
  styles: `
    :host { display: block; margin-top: 22px; scroll-margin-top: 90px; }
    section { padding: 20px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; background: var(--mat-sys-surface-container-low); }
    h3 { margin: 0; font: 600 23px/1.25 var(--heading-font); letter-spacing: -.3px; scroll-margin-top: 90px; }
    p { font: 400 14px/1.6 Inter, sans-serif; }
    .intro { margin: 8px 0 16px; color: var(--mat-sys-on-surface-variant); }
    .views { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 16px; }
    .views button { border-radius: 999px; }
    .views button[aria-pressed='true'] { background: var(--mat-sys-primary); border-color: transparent; color: var(--mat-sys-on-primary); }
    .destination { display: grid; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    select { width: 100%; min-width: 0; min-height: 46px; padding: 8px; border: 1px solid var(--mat-sys-outline); border-radius: 12px; background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 16px Inter, sans-serif; }
    .chapter-pair { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 18px 0 8px; font: 600 19px/1.4 var(--heading-font); }
    .chapter-pair span { color: var(--accent-gold); }
    .hint, .message { margin: 8px 0 14px; color: var(--mat-sys-on-surface-variant); }
    .pairs { display: grid; gap: 12px; }
    article { display: grid; gap: 12px; min-width: 0; padding: 14px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 14px; background: var(--mat-sys-surface); }
    article button { justify-self: start; }
    button { min-height: 44px; min-width: 40px; max-width: 100%; padding: 10px 14px; border: 1px solid var(--mat-sys-outline); border-radius: 12px; background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 600 14px/1.4 Inter, sans-serif; cursor: pointer; }
    article button { background: var(--mat-sys-primary); border-color: transparent; color: var(--mat-sys-on-primary); }
    .whole, .more, .retry { margin-top: 12px; }
    .whole { display: block; }
    button:focus-visible, select:focus-visible, h3:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 3px; }
    @media (max-width: 480px) { section { padding: 16px; } article button { justify-self: stretch; } }
  `,
})
export class ConnectionReadings {
  readonly selected = input.required<Span>();
  readonly links = input.required<Neighbor[]>();
  readonly target = input<number | null>(null);
  readonly targetChosen = output<number>();
  private readonly references = inject(ConnectionReferences);
  private readonly sheets = inject(Sheets);
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  protected readonly mode = signal<'cartoes' | 'mapa'>('cartoes');
  protected readonly step = STEP;
  protected readonly visible = signal(STEP);
  protected readonly retry = signal(0);
  protected readonly increment = (value: number): number => value + 1;
  protected readonly sourceLabel = computed(() => spanLabel(this.selected()));
  protected readonly choices = computed<ReadingChoice[]>(() => this.links().map((link) => ({ ...chapterAt(link.index), refs: link.refs })));
  protected readonly active = computed(() => this.choices().find((choice) => choice.index === this.target()) ?? this.choices()[0] ?? null);
  protected readonly selectionKey = computed(() => `${this.selected().from}-${this.selected().to}-${this.active()?.index}`);
  protected readonly wholeRefs = computed(() => {
    const target = this.active()?.label ?? '';
    return isChapter(this.selected()) ? `${this.sourceLabel()}; ${target}` : target;
  });
  protected readonly wholeLabel = computed(() => isChapter(this.selected()) ? 'Ler os dois capítulos completos' : `Ler ${this.active()?.label ?? ''}`);
  protected readonly state = toSignal(
    toObservable(computed(() => ({ span: this.selected(), target: this.active(), key: this.selectionKey(), retry: this.retry() }))).pipe(
      debounceTime(120),
      switchMap(({ span, target, key }) => {
        const blank = { key, loading: false, failed: false, pairs: [] as PairsResult['pairs'] };
        if (!target) return of(blank);
        return this.references.pairs(span, target.index).pipe(
          map((result) => ({ key, loading: false, ...result })),
          startWith({ ...blank, loading: true }),
        );
      }),
    ),
    { initialValue: { key: '', loading: true, failed: false, pairs: [] as PairsResult['pairs'] } },
  );

  constructor() {
    effect(() => {
      this.selectionKey();
      this.visible.set(STEP);
    });
  }

  protected select(value: string): void {
    this.visible.set(STEP);
    this.targetChosen.emit(Number(value));
  }

  protected open(refs: string): void {
    this.sheets.passage(refs);
  }

  /** Leva a pessoa da lista de capítulos diretamente aos textos da ligação, sem trocar o capítulo em foco. */
  focus(): void {
    const element = this.heading().nativeElement;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
