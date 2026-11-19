import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { BOOK_TIME, bookPlaces, bookShifts, shiftSummary, TIME_KINDS, type TimeKind, timeMarksOf, writtenYear } from '../../core/book-time';
import { CHRONO_CHAPTERS, CHRONO_GROUPS, chronoBooks, type ChronoBook, PHASE_COLORS } from '../../core/bible-chronological';
import { type BookIntro, ContentService } from '../../core/content.service';
import { SettingsService } from '../../core/settings.service';
import { TIME_WORDS } from '../../core/time-words';
import { Sheets } from '../../shared/sheets';

type Order = 'fatos' | 'escrita';
const KINDS = Object.keys(TIME_KINDS) as TimeKind[];

/** “Os livros em ordem cronológica”: os 66 livros em blocos, pela ordem dos fatos ou pelo ano em que foram escritos, e como cada um marca o tempo. */
@Component({
  selector: 'app-books-order',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <section class="books" aria-labelledby="bk-title">
      <h2 id="bk-title">Os Livros em Ordem Cronológica</h2>
      <p class="hint">
        Os 66 livros da Bíblia, um bloco para cada. Toque num livro para ver por onde ele passa na história, quando foi escrito e como ele marca o tempo.
      </p>

      <div class="seg" role="group" aria-label="Ordem dos livros">
        <button type="button" matRipple [class.on]="order() === 'fatos'" [attr.aria-pressed]="order() === 'fatos'" (click)="setOrder('fatos')">Pelos fatos que contam</button>
        <button type="button" matRipple [class.on]="order() === 'escrita'" [attr.aria-pressed]="order() === 'escrita'" (click)="setOrder('escrita')">Pelo ano em que foram escritos</button>
      </div>
      <p class="rule">{{ rule() }}</p>

      @if (switched()) {
        <div class="changed" role="status" aria-live="polite">
          <p class="ch-title">
            Você trocou a ordem: antes, <strong>{{ label(other()) }}</strong>; agora, <strong>{{ label(order()) }}</strong>.
          </p>
          <p class="ch-sum">
            <strong>{{ summary().moved }}</strong> de {{ list().length }} livros mudaram de lugar ({{ summary().up }} subiram, {{ summary().down }} desceram) e
            {{ summary().same }} ficaram onde estavam.
          </p>
          @if (summary().top.length) {
            <p class="ch-top">
              Os que mais mudaram:
              @for (t of summary().top; track t.id; let last = $last) { <strong>{{ nameOf(t.id) }}</strong> ({{ t.was }}.º → {{ t.now }}.º){{ last ? '.' : '; ' }} }
            </p>
          }
          <p class="ch-key">
            <span class="shift up" aria-hidden="true">▲ 5</span> subiu cinco lugares ·
            <span class="shift down" aria-hidden="true">▼ 5</span> desceu cinco · “era o 7.º” é o lugar do livro na ordem de antes.
          </p>
          <div class="ch-actions">
            <button type="button" class="chip" matRipple [class.on]="showChanges()" [attr.aria-pressed]="showChanges()" (click)="showChanges.set(!showChanges())">Destacar o que mudou</button>
            <button type="button" class="chip" matRipple [class.on]="onlyMoved()" [attr.aria-pressed]="onlyMoved()" (click)="toggleOnlyMoved()">Só os que mudaram de lugar ({{ summary().moved }})</button>
          </div>
        </div>
      }

      <div class="kinds" role="group" aria-label="Filtrar pela maneira de marcar o tempo">
        <button type="button" class="chip" matRipple [class.on]="kind() === 'todos'" [attr.aria-pressed]="kind() === 'todos'" (click)="setKind('todos')">Todos os livros ({{ list().length }})</button>
        @for (k of kinds; track k) {
          <button type="button" class="chip" matRipple [class.on]="kind() === k" [attr.aria-pressed]="kind() === k" [attr.title]="kindHint(k)" (click)="setKind(k)">
            {{ kindLabel(k) }} ({{ countOf(k) }})
          </button>
        }
      </div>

      <ol class="grid" [class.flash]="flash()">
        @for (b of visible(); track b.id) {
          <li [class.open]="opened() === b.id" [class.done]="isDone(b)" [class.moved]="marked() && b.delta !== 0">
            <button type="button" class="book" matRipple [style.--c]="color(b)" [attr.aria-expanded]="opened() === b.id" (click)="toggle(b.id)">
              <span class="top">
                <span class="n">{{ b.num }}</span>
                @if (marked() && b.delta !== 0) {
                  <span class="shift" [class.up]="b.delta > 0" [class.down]="b.delta < 0" [attr.aria-label]="shiftLabel(b)">{{ b.delta > 0 ? '▲' : '▼' }} {{ abs(b.delta) }}</span>
                }
                @if (isDone(b)) { <mat-icon class="ok" aria-label="Livro lido">check_circle</mat-icon> }
              </span>
              <strong>{{ b.name }}</strong>
              <small>{{ order() === 'fatos' ? factsLine(b) : writtenLine(b) }}</small>
              @if (marked()) { <em class="was">{{ b.delta === 0 ? 'mesmo lugar' : 'era o ' + b.was + '.º' }}</em> }
            </button>
          </li>
          @if (opened() === b.id) {
            <li class="detail" [style.--c]="color(b)">
              <header>
                <h3>{{ b.name }}</h3>
                <span class="where">n.º {{ b.position }} na ordem dos fatos</span>
              </header>

              <h4>Na história</h4>
              <p>
                Começa em {{ b.abbrev }} {{ b.first.chapter }} (capítulo n.º {{ fmt(b.first.index + 1) }} de {{ fmt(total) }} da leitura cronológica) e termina em
                {{ b.abbrev }} {{ b.last.chapter }} (n.º {{ fmt(b.last.index + 1) }}).
                @if (b.phases.length > 1) { Os capítulos se espalham por {{ b.phases.length }} fases: }
                @else { O livro fica numa fase só: }
              </p>
              <p class="phases">
                @for (p of b.phases; track p) { <span class="ph" [style.--c]="phaseColor(p)">{{ phaseName(p) }}</span> }
              </p>

              <h4>Quando foi escrito</h4>
              <p>{{ writtenText(b) }}</p>

              <h4>Como o livro marca o tempo</h4>
              @if (marks(b).length) {
                <ul class="marks">
                  @for (m of marks(b); track m.ref) {
                    <li>
                      <span class="kind">{{ kindLabel(m.kind) }}</span>
                      <span class="said">“{{ m.almeida }}”</span>
                      <span class="note">{{ m.note }}</span>
                      <span class="foot">
                        <button type="button" class="ref" matRipple (click)="open(m.ref)">{{ m.ref }}</button>
                        @for (w of m.words ?? []; track w) { <span class="word">{{ wordLabel(w) }}</span> }
                      </span>
                    </li>
                  }
                </ul>
              } @else {
                <p class="none">O app ainda não registrou uma marca de tempo para este livro.</p>
              }

              <p class="actions">
                <a class="go" matRipple [routerLink]="['/ler', b.id, b.first.chapter]" [queryParams]="chrono">Ler na ordem cronológica</a>
                <a class="go alt" matRipple [routerLink]="['/livro', b.id]">Sobre o livro</a>
              </p>
            </li>
          }
        }
      </ol>
      @if (!visible().length) { <p class="empty">Nenhum livro com essa marca.</p> }
    </section>
  `,
  styles: `
    :host { display: block; scroll-margin-top: 72px; }
    .books { margin-top: 22px; padding: 16px 16px 14px; border-radius: 20px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); }
    h2 { margin: 0 0 2px; font: 600 20px/1.25 var(--heading-font); }
    .hint { margin: 0 0 12px; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .rule { margin: 8px 0 10px; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .seg { display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; border-radius: 24px; background: var(--mat-sys-surface-container); }
    .seg button { position: relative; overflow: hidden; min-height: 40px; padding: 0 16px; border-radius: 20px; border: 0; background: none; color: var(--mat-sys-on-surface); cursor: pointer; font: 500 14px Inter, sans-serif; }
    .seg button.on { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .kinds { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .chip {
      position: relative; overflow: hidden; min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 13px Inter, sans-serif; text-align: left;
    }
    .chip.on { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-color: var(--mat-sys-primary); }

    /* No celular os dois botões de ordem ficam lado a lado e os filtros viram uma fileira que desliza, para os livros aparecerem logo. */
    @media (max-width: 599px) {
      .seg { display: grid; grid-template-columns: 1fr 1fr; width: 100%; box-sizing: border-box; }
      .seg button { padding: 4px 8px; line-height: 1.25; font-size: 13px; }
      .kinds { flex-wrap: nowrap; overflow-x: auto; margin-inline: -16px; padding: 2px 16px 4px; scrollbar-width: none; }
      .kinds::-webkit-scrollbar { display: none; }
      .chip { flex: none; white-space: nowrap; }
    }
    .grid { list-style: none; margin: 0; padding: 0; display: grid; grid-auto-flow: row dense; grid-template-columns: repeat(auto-fill, minmax(min(100%, 128px), 1fr)); gap: 8px; }
    @media (min-width: 600px) { .grid { grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); } }
    .grid li:not(.detail) { display: flex; min-width: 0; }
    .book {
      position: relative; overflow: hidden; flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 8px 12px 10px; text-align: left; cursor: pointer;
      border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); border-top: 4px solid var(--c); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: inherit;
    }
    li.open .book { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-color: var(--mat-sys-primary); border-top-color: var(--c); }
    li.done:not(.open) .book { background: color-mix(in srgb, var(--mat-sys-primary-container) 45%, var(--mat-sys-surface)); }
    .top { display: flex; align-items: center; gap: 6px; width: 100%; min-height: 24px; }
    .n { display: grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 13px; border: 1px solid var(--mat-sys-outline-variant); font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    li.open .n { color: var(--mat-sys-on-primary-container); border-color: currentcolor; }
    .ok { color: var(--mat-sys-primary); margin-left: auto; }

    /* O que mudou ao trocar a ordem: um aviso com os números e, em cada livro que mudou de lugar, a seta, quantos lugares e o lugar de antes. */
    .changed { margin: 0 0 12px; padding: 12px 14px; border-radius: 14px; background: color-mix(in srgb, var(--mat-sys-primary) 9%, var(--mat-sys-surface)); border: 1px solid var(--mat-sys-primary); }
    .changed p { margin: 0 0 6px; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .changed strong { font-weight: 600; }
    .ch-key { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-size: 13px !important; color: var(--mat-sys-on-surface-variant) !important; }
    .ch-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .shift { display: inline-flex; align-items: center; padding: 1px 8px; border-radius: 12px; font: 700 13px Inter, sans-serif; white-space: nowrap; }
    .shift.up { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .shift.down { background: var(--mat-sys-surface); color: var(--mat-sys-primary); border: 1.5px solid var(--mat-sys-primary); padding: 0 7px; }
    li.moved:not(.open) .book { background: color-mix(in srgb, var(--mat-sys-primary) 9%, var(--mat-sys-surface)); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--mat-sys-primary) 55%, transparent); }
    .was { font: italic 400 13px/1.3 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    li.open .was { color: var(--mat-sys-on-primary-container); }
    .grid.flash li.moved .book { animation: shifted 1.3s ease-out 1; }
    @keyframes shifted { 0% { box-shadow: inset 0 0 0 2px var(--mat-sys-primary), 0 0 0 0 color-mix(in srgb, var(--mat-sys-primary) 70%, transparent); } 100% { box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--mat-sys-primary) 55%, transparent), 0 0 0 12px transparent; } }
    @media (prefers-reduced-motion: reduce) { .grid.flash li.moved .book { animation: none; } }
    .book strong { font: 600 15px/1.25 var(--heading-font); }
    @media (max-width: 419px) { .book { padding: 8px 10px 10px; } .book strong { font-size: 14px; } }
    .book small { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    li.open .book small { color: var(--mat-sys-on-primary-container); }

    .detail { grid-column: 1 / -1; padding: 14px 16px 12px; border-radius: 16px; background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); border-left: 5px solid var(--c); }
    .detail header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; }
    .detail h3 { margin: 0; font: 600 20px/1.25 var(--heading-font); }
    .where { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .detail h4 { margin: 14px 0 4px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--mat-sys-on-surface-variant); }
    .detail p { margin: 0; font: 400 14px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .phases { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px !important; }
    .ph { padding: 4px 10px; border-radius: 12px; border: 1px solid var(--c); border-left-width: 5px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .marks { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 8px; }
    .marks li { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 14px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    .kind { font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .said { font: italic 400 15px/1.45 var(--reading-font); color: var(--mat-sys-on-surface); }
    .note { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .foot { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; }
    .ref {
      position: relative; overflow: hidden; min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container); color: var(--accent-gold); font: 600 13px Inter, sans-serif;
    }
    .word { padding: 3px 10px; border-radius: 12px; background: var(--mat-sys-surface-container-high); font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .none { color: var(--mat-sys-on-surface-variant) !important; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px !important; }
    .go { position: relative; overflow: hidden; display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 22px; text-decoration: none; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 14px Inter, sans-serif; }
    .go.alt { background: none; color: var(--mat-sys-primary); border: 1px solid var(--mat-sys-outline-variant); }
    .empty { margin: 10px 0 0; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class BooksOrder {
  private readonly sheets = inject(Sheets);
  private readonly settings = inject(SettingsService);
  private readonly intros = toSignal(inject(ContentService).bookIntros, { initialValue: {} as Record<string, BookIntro> });

  protected readonly kinds = KINDS;
  protected readonly total = CHRONO_CHAPTERS.length;
  protected readonly chrono = { ordem: 'cronologica' };
  private readonly books = chronoBooks();

  protected readonly order = signal<Order>('fatos');
  protected readonly kind = signal<TimeKind | 'todos'>('todos');
  protected readonly opened = signal<string | null>(null);

  /** Já trocou de ordem alguma vez? Só então o aviso e as marcas do que mudou aparecem (a primeira vista fica limpa). */
  protected readonly switched = signal(false);
  protected readonly showChanges = signal(true);
  protected readonly onlyMoved = signal(false);
  /** Pisca uma vez os livros que mudaram, logo depois da troca. */
  protected readonly flash = signal(false);
  private flashTimer: ReturnType<typeof setTimeout> | undefined;

  private readonly years = computed(() => {
    const intros = this.intros();
    return Object.fromEntries(this.books.map((b) => [b.id, intros[b.id] ? writtenYear(intros[b.id].date) : null]));
  });
  private readonly places = computed(() => ({
    fatos: bookPlaces(this.books, this.years(), 'fatos'),
    escrita: bookPlaces(this.books, this.years(), 'escrita'),
  }));
  protected readonly other = computed<Order>(() => (this.order() === 'fatos' ? 'escrita' : 'fatos'));
  /** O que mudou em relação à outra ordem, livro a livro. */
  private readonly shifts = computed(() => bookShifts(this.places()[this.order()], this.places()[this.other()]));
  protected readonly summary = computed(() => shiftSummary(this.shifts()));
  protected readonly marked = computed(() => this.switched() && this.showChanges());

  /** Os livros na ordem escolhida; `num` é o número do livro nessa ordem (não muda com o filtro), `was` o da outra e `delta` quanto subiu (+) ou desceu (−). */
  protected readonly list = computed(() => {
    const now = this.places()[this.order()];
    const shifts = new Map(this.shifts().map((x) => [x.id, x]));
    const years = this.years();
    return [...this.books]
      .sort((a, b) => now[a.id] - now[b.id])
      .map((b) => ({ ...b, num: now[b.id], was: shifts.get(b.id)!.was, delta: shifts.get(b.id)!.delta, year: years[b.id] }));
  });
  protected readonly visible = computed(() => {
    const k = this.kind();
    const byKind = k === 'todos' ? this.list() : this.list().filter((b) => timeMarksOf(b.id).some((m) => m.kind === k));
    return this.switched() && this.onlyMoved() ? byKind.filter((b) => b.delta !== 0) : byKind;
  });
  protected readonly rule = computed(() =>
    this.order() === 'fatos'
      ? 'Cada livro entra no lugar do seu primeiro capítulo na leitura cronológica. Salmos aparece cedo, por exemplo, porque o salmo de Moisés (Sl 90) vem logo depois de Deuteronômio, mas o livro continua até a volta do exílio.'
      : 'Pelo ano de escrita que o app dá a cada livro (a posição tradicional; onde há debate, o texto do livro avisa). Os que só dizem o que relatam, ou cuja data é incerta, ficam no fim, sem ano.',
  );

  protected color = (b: ChronoBook): string => PHASE_COLORS[b.phases[0]];
  protected phaseColor = (id: string): string => PHASE_COLORS[id];
  protected phaseName = (id: string): string => CHRONO_GROUPS.find((g) => g.id === id)?.name ?? id;
  protected kindLabel = (k: TimeKind): string => TIME_KINDS[k].label;
  protected kindHint = (k: TimeKind): string => TIME_KINDS[k].hint;
  protected countOf = (k: TimeKind): number => new Set(BOOK_TIME.filter((m) => m.kind === k).map((m) => m.book)).size;
  protected fmt = (n: number): string => n.toLocaleString('pt-BR');
  protected marks = (b: ChronoBook) => timeMarksOf(b.id);
  protected wordLabel = (id: string): string => TIME_WORDS.find((w) => w.id === id)?.translit ?? id;

  protected factsLine(b: ChronoBook): string {
    return b.phases.length > 1 ? `${b.chapters} cap. · ${b.phases.length} fases` : `${b.chapters} cap.`;
  }
  protected writtenLine(b: { year: number | null }): string {
    if (b.year === null) return 'sem ano no app';
    return b.year < 0 ? `c. ${-b.year} a.C.` : `c. ${b.year} d.C.`;
  }
  protected writtenText(b: ChronoBook): string {
    const intro = this.intros()[b.id];
    return intro ? intro.date : 'Carregando…';
  }
  protected isDone(b: ChronoBook): boolean {
    return (this.settings.readChapters()[b.id]?.length ?? 0) >= b.chapters;
  }

  protected setOrder(o: Order): void {
    if (o === this.order()) return;
    this.order.set(o);
    this.opened.set(null);
    this.switched.set(true);
    this.showChanges.set(true);
    // os livros que mudaram piscam uma vez, para o olho achar para onde foram (quem pediu menos movimento fica só com a marca parada)
    this.flash.set(true);
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.flash.set(false), 1400);
  }
  protected toggleOnlyMoved(): void {
    this.onlyMoved.set(!this.onlyMoved());
    this.opened.set(null);
  }
  protected label = (o: Order): string => (o === 'fatos' ? 'pelos fatos que contam' : 'pelo ano em que foram escritos');
  protected nameOf = (id: string): string => this.books.find((b) => b.id === id)?.name ?? id;
  protected abs = (n: number): number => Math.abs(n);
  protected shiftLabel(b: { delta: number; was: number; num: number }): string {
    const n = Math.abs(b.delta);
    return `${b.delta > 0 ? 'subiu' : 'desceu'} ${n} ${n === 1 ? 'lugar' : 'lugares'}: era o ${b.was}.º e agora é o ${b.num}.º`;
  }
  protected setKind(k: TimeKind | 'todos'): void {
    this.kind.set(k);
    this.opened.set(null);
  }
  protected toggle(id: string): void {
    this.opened.update((cur) => (cur === id ? null : id));
  }
  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}
