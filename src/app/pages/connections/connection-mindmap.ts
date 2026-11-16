import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { chapterAt, spanLabel, type ChapterRef, type Neighbor, type Span } from '../../core/bible-connections';
import { Sheets } from '../../shared/sheets';
import { ConnectionPair } from './connection-pair';
import { ConnectionReferences, type PairsResult } from './connection-references';

type BookRef = ChapterRef['book'];

interface ChapterNode {
  index: number;
  label: string;
  refs: number;
}

interface BookNode {
  book: BookRef;
  refs: number;
  chapters: ChapterNode[];
}

interface ChapterState extends PairsResult {
  loading: boolean;
}

/** Quantos ramos aparecem de cada vez; “+ N” abre mais. Poucos por vez, para a pessoa entender sem se perder. */
const STEP = { books: 6, chapters: 6, pairs: 4 } as const;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * As ligações de uma passagem como um mapa mental: a passagem no centro, os livros ligados em volta, e dentro de cada livro os
 * capítulos e, por fim, os versículos dos dois lados. Cada ramo abre e fecha; o que não foi aberto não carrega.
 */
@Component({
  selector: 'app-connection-mindmap',
  imports: [ConnectionPair],
  template: `
    <div class="map" role="group" aria-label="Mapa mental das ligações">
      <p class="how">Toque em um ramo para abrir. Livro → capítulo → versículos dos dois lados.</p>
      <div class="scroller">
        <ul class="tree">
          <li class="top">
            <div class="row"><span class="node root"><strong>{{ sourceLabel() }}</strong><small>{{ plural(total(), 'capítulo ligado', 'capítulos ligados') }}</small></span></div>
            <ul class="kids">
              @for (b of shownBooks(); track b.book.id) {
                <li>
                  <div class="row">
                    <button type="button" class="node book" [attr.aria-expanded]="isOpen('b:' + b.book.id)" (click)="toggleBook(b)">
                      <span class="text"><strong>{{ b.book.name }}</strong><small>{{ plural(b.refs, 'ligação', 'ligações') }} · {{ plural(b.chapters.length, 'capítulo', 'capítulos') }}</small></span>
                      <span class="dot" aria-hidden="true">{{ isOpen('b:' + b.book.id) ? '‹' : '›' }}</span>
                    </button>
                  </div>
                  @if (isOpen('b:' + b.book.id)) {
                    <ul class="kids">
                      @for (c of b.chapters.slice(0, limit('b:' + b.book.id, STEP.chapters)); track c.index) {
                        <li>
                          <div class="row">
                            <button type="button" class="node chapter" [attr.aria-expanded]="isOpen('c:' + c.index)" (click)="toggleChapter(c.index)">
                              <span class="text"><strong>{{ c.label }}</strong><small>{{ plural(c.refs, 'ligação', 'ligações') }}</small></span>
                              <span class="dot" aria-hidden="true">{{ isOpen('c:' + c.index) ? '‹' : '›' }}</span>
                            </button>
                          </div>
                          @if (isOpen('c:' + c.index)) {
                            <ul class="kids">
                              @if (stateOf(c.index); as st) {
                                @if (st.loading) {
                                  <li><div class="row"><span class="node note">Buscando os versículos…</span></div></li>
                                } @else if (st.failed) {
                                  <li><div class="row"><span class="node note" role="alert">Os versículos desta ligação ainda não estão disponíveis neste aparelho.</span></div></li>
                                } @else {
                                  @for (p of st.pairs.slice(0, limit('c:' + c.index, STEP.pairs)); track p.key) {
                                    <li class="leaf">
                                      <div class="row">
                                        <button type="button" class="node pair" [attr.aria-label]="'Abrir os dois textos: ' + p.from + ' e ' + p.to" (click)="read(p.refs)">
                                          <app-connection-pair [pair]="p" [compact]="true" />
                                          <span class="open">Toque para ler os dois textos inteiros</span>
                                        </button>
                                      </div>
                                    </li>
                                  }
                                  @if (st.pairs.length > limit('c:' + c.index, STEP.pairs)) {
                                    <li><div class="row"><button type="button" class="node more" (click)="more('c:' + c.index, STEP.pairs)">+ {{ st.pairs.length - limit('c:' + c.index, STEP.pairs) }} {{ st.pairs.length - limit('c:' + c.index, STEP.pairs) === 1 ? 'par de versículos' : 'pares de versículos' }}</button></div></li>
                                  }
                                }
                              }
                            </ul>
                          }
                        </li>
                      }
                      @if (b.chapters.length > limit('b:' + b.book.id, STEP.chapters)) {
                        <li><div class="row"><button type="button" class="node more" (click)="more('b:' + b.book.id, STEP.chapters)">+ {{ b.chapters.length - limit('b:' + b.book.id, STEP.chapters) }} {{ b.chapters.length - limit('b:' + b.book.id, STEP.chapters) === 1 ? 'capítulo' : 'capítulos' }}</button></div></li>
                      }
                    </ul>
                  }
                </li>
              }
              @if (books().length > limit('books', STEP.books)) {
                <li><div class="row"><button type="button" class="node more" (click)="more('books', STEP.books)">+ {{ books().length - limit('books', STEP.books) }} {{ books().length - limit('books', STEP.books) === 1 ? 'livro' : 'livros' }}</button></div></li>
              }
            </ul>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .how { margin: 0 0 10px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .scroller { overflow-x: auto; padding: 4px 2px 12px; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { position: relative; }
    .row { display: flex; align-items: center; }
    .node { box-sizing: border-box; display: inline-flex; align-items: center; gap: 10px; min-height: 48px; max-width: 100%; padding: 8px 12px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 12px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface); font: 500 15px/1.35 Inter, sans-serif; text-align: left; }
    .text { display: grid; gap: 1px; min-width: 0; }
    strong { font-weight: 600; }
    small { font: 400 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .root { background: var(--mat-sys-primary); border-color: transparent; color: var(--mat-sys-on-primary); display: grid; gap: 1px; }
    .root small { color: var(--mat-sys-on-primary); opacity: .9; }
    button.node { cursor: pointer; }
    .book { background: var(--mat-sys-surface-container-high); }
    .chapter { background: var(--mat-sys-surface); }
    .dot { display: inline-grid; place-items: center; flex: none; width: 24px; height: 24px; border-radius: 50%; background: var(--mat-sys-surface-container-highest); font: 600 17px/1 Inter, sans-serif; }
    .note { background: transparent; border-style: dashed; color: var(--mat-sys-on-surface-variant); }
    .more { background: transparent; border-style: dashed; color: var(--mat-sys-primary); font-weight: 600; }
    .pair { display: grid; gap: 6px; padding: 8px; width: min(100%, 340px); background: var(--mat-sys-surface); }
    .open { padding: 0 4px 2px; font: 600 13px/1.4 Inter, sans-serif; color: var(--mat-sys-primary); }
    button:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 3px; }

    /* Celular: a árvore desce em degraus, sem rolar para o lado. */
    .kids { margin-left: 14px; padding-left: 16px; border-left: 2px solid var(--mat-sys-outline-variant); }
    .kids > li { padding: 5px 0; }
    .kids > li::before { content: ''; position: absolute; left: -16px; top: 29px; width: 14px; border-top: 2px solid var(--mat-sys-outline-variant); }
    .top > .kids { margin-top: 6px; }

    /* Tela larga: o mapa se abre para a direita, com as curvas dos ramos. */
    @media (min-width: 720px) {
      .scroller { padding-bottom: 16px; }
      li { display: flex; align-items: center; }
      li.top { display: flex; }
      .kids { position: relative; display: flex; flex-direction: column; justify-content: center; margin: 0; padding: 0 0 0 36px; border-left: 0; }
      .kids::before { content: ''; position: absolute; left: 0; top: 50%; width: 18px; border-top: 2px solid var(--mat-sys-outline); }
      .kids > li { padding: 6px 0 6px 0; }
      .kids > li::before { left: -18px; top: 50%; width: 18px; border-top: 2px solid var(--mat-sys-outline); }
      .kids > li::after { content: ''; position: absolute; left: -18px; top: 0; bottom: 0; border-left: 2px solid var(--mat-sys-outline); }
      .kids > li:first-child::after { top: 50%; border-top-left-radius: 14px; }
      .kids > li:last-child::after { bottom: 50%; border-bottom-left-radius: 14px; }
      .kids > li:only-child::after { display: none; }
      .kids > li:first-child:not(:only-child)::before, .kids > li:last-child:not(:only-child)::before { display: none; }
      .kids > li:first-child:not(:only-child)::after { width: 18px; border-top: 2px solid var(--mat-sys-outline); }
      .kids > li:last-child:not(:only-child)::after { width: 18px; border-bottom: 2px solid var(--mat-sys-outline); }
      .node { max-width: 300px; }
      .pair { width: 320px; }
    }
  `,
})
export class ConnectionMindmap {
  readonly selected = input.required<Span>();
  readonly links = input.required<Neighbor[]>();
  /** Capítulo que a pessoa escolheu em outro lugar da tela (os botões sob o desenho): o mapa abre o ramo dele. */
  readonly target = input<number | null>(null);

  private readonly references = inject(ConnectionReferences);
  private readonly sheets = inject(Sheets);
  protected readonly STEP = STEP;
  protected readonly plural = plural;
  protected readonly open = signal<ReadonlySet<string>>(new Set());
  protected readonly limits = signal<Record<string, number>>({});
  private readonly states = signal<Record<number, ChapterState>>({});
  protected readonly sourceLabel = computed(() => spanLabel(this.selected()));
  protected readonly total = computed(() => this.links().length);

  /** Os livros ligados, do mais ligado ao menos; dentro de cada um, os capítulos também do mais ao menos ligado. */
  protected readonly books = computed<BookNode[]>(() => {
    const byBook = new Map<string, BookNode>();
    for (const link of this.links()) {
      const chapter = chapterAt(link.index);
      const node = byBook.get(chapter.book.id) ?? { book: chapter.book, refs: 0, chapters: [] };
      node.refs += link.refs;
      node.chapters.push({ index: link.index, label: chapter.label, refs: link.refs });
      byBook.set(chapter.book.id, node);
    }
    return [...byBook.values()]
      .map((node) => ({ ...node, chapters: node.chapters.sort((a, b) => b.refs - a.refs || a.index - b.index) }))
      .sort((a, b) => b.refs - a.refs);
  });
  protected readonly shownBooks = computed(() => this.books().slice(0, this.limit('books', STEP.books)));

  constructor() {
    // Mudou a passagem em foco: recomeça fechado, mas já com o ramo mais forte aberto, para a pessoa ver de cara o que é um par.
    effect(() => {
      this.selected();
      const books = this.books();
      untracked(() => {
        this.open.set(new Set());
        this.limits.set({});
        this.states.set({});
        const first = books[0];
        if (first?.chapters[0]) this.expand(first, first.chapters[0].index);
      });
    });
    // A pessoa tocou num capítulo sob o desenho: abre o livro e o capítulo dele.
    effect(() => {
      const target = this.target();
      if (target === null) return;
      const book = this.books().find((b) => b.chapters.some((c) => c.index === target));
      if (book) untracked(() => this.expand(book, target));
    });
  }

  protected isOpen(id: string): boolean {
    return this.open().has(id);
  }

  protected limit(key: string, initial: number): number {
    return this.limits()[key] ?? initial;
  }

  protected more(key: string, step: number): void {
    this.limits.update((all) => ({ ...all, [key]: (all[key] ?? step) + step }));
  }

  protected stateOf(index: number): ChapterState | undefined {
    return this.states()[index];
  }

  protected toggleBook(node: BookNode): void {
    this.flip(`b:${node.book.id}`);
  }

  protected toggleChapter(index: number): void {
    const id = `c:${index}`;
    this.flip(id);
    if (this.isOpen(id)) this.load(index);
  }

  protected read(refs: string): void {
    this.sheets.passage(refs);
  }

  private flip(id: string): void {
    this.open.update((all) => {
      const next = new Set(all);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  /** Abre o livro e o capítulo (sem fechar nada que já estava aberto) e busca os versículos do capítulo. */
  private expand(book: BookNode, index: number): void {
    this.open.update((all) => new Set([...all, `b:${book.book.id}`, `c:${index}`]));
    const position = book.chapters.findIndex((c) => c.index === index);
    if (position >= this.limit(`b:${book.book.id}`, STEP.chapters)) this.limits.update((all) => ({ ...all, [`b:${book.book.id}`]: position + 1 }));
    this.load(index);
  }

  private load(index: number): void {
    const current = this.states()[index];
    if (current && !current.failed) return;
    const span = this.selected();
    this.states.update((all) => ({ ...all, [index]: { loading: true, failed: false, pairs: [] } }));
    this.references.pairs(span, index).subscribe((result) => {
      // Se a pessoa já trocou de passagem, esta resposta é de outra e não vale.
      if (this.selected() !== span) return;
      this.states.update((all) => ({ ...all, [index]: { loading: false, ...result } }));
    });
  }
}
