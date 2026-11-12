import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CLASSIC_SERMONS, findArticle } from '../core/library';
import { FIGURE_INFO } from '../core/figure-info';
import { Block, markBlockQuotes, parseBlocks, sectionLabels } from '../core/rich-text-parser';
import { foldRanges, locateTopic, readingFraction, topicSections, visibleBlocks } from '../core/topic-sections';
import { CompactFigure } from './compact-figure';
import { DialogTurns } from './dialog-turns';
import { Figure } from './figure';
import { PhotoViewer, ViewedPhoto } from './photo-viewer';
import { EraMap } from './era-map';
import { SendChain } from './send-chain';
import { Sheets } from './sheets';
import { FoldHead, TopicHead, TopicNext } from './topic-head';

/**
 * Mostra texto de estudo formatado. Referências bíblicas abrem o texto num painel.
 * No modo história (story), o texto vira uma narrativa: capítulos numerados, letra capitular,
 * fotos como retratos de época, cenas, frases em destaque e blocos que aparecem ao rolar.
 */
@Component({
  selector: 'app-rich-text',
  imports: [NgTemplateOutlet, RouterLink, MatIconModule, Figure, CompactFigure, DialogTurns, SendChain, EraMap, PhotoViewer, TopicHead, TopicNext, FoldHead],
  host: { '[class.story]': 'story()', '[class.compact]': 'compactFigures()' },
  template: `
    <ng-template #line let-parts>@for (p of parts; track $index) {@switch (p.t) {@case ('b') {<strong>{{ p.text }}</strong>}@case ('i') {<em>{{ p.text }}</em>}@case ('q') {<span class="quoted">{{ p.text }}</span>}@case ('ref') {<button type="button" class="ref" (click)="openRef(p.href)">{{ p.text }}</button>}@case ('link') {<a class="link" [routerLink]="p.href">{{ p.text }}</a>}@case ('ext') {<a class="link" [href]="p.href" target="_blank" rel="noopener noreferrer">{{ p.text }}</a>}@default {{{ p.text }}}}}</ng-template>

    @for (b of blocks(); track $index; let i = $index) {
      @if (visible(i)) {
      @switch (b.type) {
        @case ('h2') {
          @if (story() && labels()[i]) { <span class="chapter" aria-hidden="true">{{ labels()[i] }}</span> }
          @if (topicOf(i); as t) {
            <h2 [id]="b.anchor" [style.scroll-margin-top.px]="84"><app-topic-head [title]="t.title" [minutes]="t.minutes" [open]="isOpen(t.index)" (toggled)="toggleTopic(t.index)" /></h2>
          } @else {
            <h2 [id]="b.anchor"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h2>
          }
        }
        @case ('h3') {
          @if (foldOf(i); as f) {
            <h3 class="fold-h"><app-fold-head [title]="f.title" [open]="isFoldOpen(i)" (toggled)="toggleFold(i)" /></h3>
          } @else {
            <h3><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h3>
          }
        }
        @case ('fold') { }
        @case ('quote') { <blockquote><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></blockquote> }
        @case ('note') {
          @if (b.place === 'Medicina') {
            @if (folding()) { <app-fold-head title="A medicina explica" [open]="isFoldOpen(i)" (toggled)="toggleFold(i)" /> }
            @if (!folding() || isFoldOpen(i)) {
              <aside class="note med" aria-label="A medicina explica"><span class="med-label" aria-hidden="true">A medicina explica</span><p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p></aside>
            }
          } @else {
            <aside class="note"><mat-icon>lightbulb</mat-icon><p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p></aside>
          }
        }
        @case ('dialog') { <app-dialog-turns [title]="b.place" [turns]="b.turns ?? []" [line]="line" /> }
        @case ('when') { <p class="when"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p> }
        @case ('scene') {
          <section class="scene">
            @if (b.place) { <span class="place"><mat-icon>location_on</mat-icon>{{ b.place }}</span> }
            <p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p>
          </section>
        }
        @case ('pullquote') {
          <figure class="pullquote">
            <blockquote><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></blockquote>
            @if (b.cite) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.cite }" /></figcaption> }
          </figure>
        }
        @case ('people') {
          <ul class="people" aria-label="Personagens desta história">
            @for (p of b.people; track p.name) {
              <li>
                @if (p.src) { <img [src]="'conteudo/' + p.src" [alt]="p.name" loading="lazy" /> }
                @else { <span class="initials" aria-hidden="true">{{ initials(p.name) }}</span> }
                <strong>{{ p.name }}</strong>
                <span class="role">{{ p.role }}</span>
              </li>
            }
          </ul>
        }
        @case ('buy') {
          <a class="read buy" [href]="b.href" target="_blank" rel="noopener">
            <span class="read-icon"><mat-icon>shopping_bag</mat-icon></span>
            <span class="read-texts">
              <span class="read-over">Onde comprar</span>
              <span class="read-title">{{ b.label ?? 'Ver na loja' }}</span>
              @if (b.inlines) { <span class="read-desc"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></span> }
            </span>
            <mat-icon class="read-go">open_in_new</mat-icon>
          </a>
        }
        @case ('read') {
          @if (articleOf(b.article); as a) {
            <a class="read" [routerLink]="['/artigo', a.id]">
              <span class="read-icon"><mat-icon>{{ a.icon }}</mat-icon></span>
              <span class="read-texts">
                <span class="read-over">{{ b.mode === 'continua' ? 'A história continua' : b.mode === 'apoio' ? 'Para entender o cenário' : 'História completa' }}@if (a.period) { · {{ a.period }} }</span>
                <span class="read-title">{{ a.title }}</span>
                <span class="read-desc">@if (b.inlines) {<ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" />} @else {{{ a.subtitle }}}</span>
              </span>
              <mat-icon class="read-go">arrow_forward</mat-icon>
            </a>
          }
        }
        @case ('facts') {
          <section class="facts">
            @if (b.place) { <h3 class="facts-title"><mat-icon>fact_check</mat-icon>{{ b.place }}</h3> }
            <dl>
              @for (f of b.facts; track f.label) {
                <div><dt>{{ f.label }}</dt><dd><ng-container *ngTemplateOutlet="line; context: { $implicit: f.text }" /></dd></div>
              }
            </dl>
          </section>
        }
        @case ('eramap') { <app-era-map [ids]="b.eras!" /> }
        @case ('sends') { <app-send-chain [title]="b.place" [sends]="b.sends!" /> }
        @case ('sermon') {
          @if (sermonOf(b.sermon); as s) {
            <a class="read sermon-card" [routerLink]="['/avivamento', s.id]">
              <span class="read-icon"><mat-icon>campaign</mat-icon></span>
              <span class="read-texts">
                <span class="read-over">Sermão da época · {{ s.year }}</span>
                <span class="read-title">{{ s.title }}</span>
                <span class="read-desc">@if (b.inlines) {<ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" />} @else {{{ s.preacher }} — {{ s.text }}}</span>
              </span>
              <mat-icon class="read-go">arrow_forward</mat-icon>
            </a>
          }
        }
        @case ('ul') {
          <ul>@for (item of b.items; track $index) { <li><ng-container *ngTemplateOutlet="line; context: { $implicit: item }" /></li> }</ul>
        }
        @case ('ol') {
          <ol>@for (item of b.items; track $index) { <li><ng-container *ngTemplateOutlet="line; context: { $implicit: item }" /></li> }</ol>
        }
        @case ('timeline') {
          <ol class="timeline">
            @for (e of b.events; track $index) {
              <li>
                <span class="marker"></span>
                <span class="date">{{ e.date }}</span>
                <span class="card-text">
                  <span class="title">{{ e.title }}</span>
                  <span class="text"><ng-container *ngTemplateOutlet="line; context: { $implicit: e.text }" /></span>
                </span>
              </li>
            }
          </ol>
        }
        @case ('table') {
          <div class="table-wrap">
            <table>
              <thead><tr>@for (h of b.head; track $index) { <th><ng-container *ngTemplateOutlet="line; context: { $implicit: h }" /></th> }</tr></thead>
              <tbody>
                @for (r of b.rows; track $index) {
                  <tr>@for (c of r; track $index) { <td><ng-container *ngTemplateOutlet="line; context: { $implicit: c }" /></td> }</tr>
                }
              </tbody>
            </table>
          </div>
        }
        @case ('image') {
          <figure class="photo" [class.wide]="b.wide">
            <!-- Pelo teclado, o botão Ampliar ao lado faz o mesmo -->
            <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
            <img [src]="'conteudo/' + b.src" [alt]="b.alt" loading="lazy" (click)="view(b)" />
            <button type="button" class="zoom" (click)="view(b)" aria-label="Ampliar a imagem"><mat-icon>zoom_out_map</mat-icon></button>
            @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
          </figure>
        }
        @case ('figure') {
          @if (compactFigures() && !inlineFigure(b.figure!)) {
            <!-- Modo compacto: uma faixa pequena, colada ao parágrafo; a figura inteira só aparece (e só carrega) ao abrir -->
            <app-compact-figure [id]="b.figure!">
              @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
            </app-compact-figure>
          } @else {
            <figure class="diagram" [class.inline]="inlineFigure(b.figure!)">
              <app-figure [id]="b.figure!" />
              @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
            </figure>
          }
        }
        @default { <p [class.opening]="i === opening()"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p> }
      }
      }
      @if (nextTopic(i); as nx) { <app-topic-next [title]="nx.title" (advanced)="goTo(nx.index)" /> }
    }
    <app-photo-viewer [photo]="viewing()" (closed)="viewing.set(null)" />
  `,
  styleUrl: './rich-text.scss',
})
export class RichText {
  protected inlineFigure(id: string): boolean {
    return FIGURE_INFO[id]?.inline ?? false;
  }

  readonly source = input.required<string>();
  /** Modo história: capítulos, letra capitular, retratos e animações ao rolar. */
  readonly story = input(false);
  /** Grifa de leve o que está entre “aspas” (usado nos estudos privados, a pedido do dono). */
  readonly markQuotes = input(false);
  /** Figuras em faixas pequenas, coladas ao texto, que abrem ao toque; fotos pequenas ao lado do texto (estudos privados). */
  readonly compactFigures = input(false);
  /** Tópicos da capa: os títulos que são tópicos ganham o rótulo "Tópico 1 de 5". */
  readonly topics = input<string[]>([]);
  /** Sanfona por tópico (estudos longos, privados): cada título abre e fecha o seu trecho; começa com o primeiro aberto. */
  readonly accordion = input(false);
  /**
   * Linhas “Saiba mais” sem a sanfona por tópico (estudos privados curtos): as notas de medicina e as seções `###` marcadas com
   * `:::dobra` começam fechadas e abrem ao toque. Com a sanfona ligada isso já vale.
   */
  readonly foldable = input(false);
  /** Com o “Ouvir” ligado nada fecha: a narração segue por trechos que a pessoa precisa ver (um toque no título só leva até ele). */
  readonly keepOpen = input(false);
  private readonly sheets = inject(Sheets);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly blocks = computed(() => {
    const blocks = parseBlocks(this.source());
    return this.markQuotes() ? markBlockQuotes(blocks) : blocks;
  });

  /** Rótulo de cada título de seção: "Capítulo 1", "Capítulo 2"… ou um nome especial. */
  protected readonly labels = computed(() => sectionLabels(this.blocks(), this.topics()));

  /** O primeiro parágrafo (fora das seções dobráveis, que começam fechadas) ganha a letra capitular. */
  protected readonly opening = computed(() => {
    if (!this.story()) return -1;
    const folds = this.folds();
    return this.blocks().findIndex((b: Block, i: number) => b.type === 'p' && !folds.some((f) => i >= f.first && i <= f.last));
  });

  /** Os tópicos da sanfona (vazio quando ela está desligada). */
  protected readonly sections = computed(() => (this.accordion() ? topicSections(this.blocks()) : []));
  /** Quais tópicos estão abertos. */
  private readonly open = signal<ReadonlySet<number>>(new Set([0]));
  /** As seções “Saiba mais” (`###` seguido de `:::dobra`) e quais estão abertas (pela posição do título, ou da nota de medicina). */
  protected readonly folding = computed(() => this.accordion() || this.foldable());
  private readonly folds = computed(() => (this.folding() ? foldRanges(this.blocks()) : []));
  private readonly foldsOpen = signal<ReadonlySet<number>>(new Set());
  private readonly shown = computed(() => {
    if (this.accordion()) return visibleBlocks(this.sections(), this.blocks().length, this.open(), this.folds(), this.foldsOpen());
    return this.folding() ? visibleBlocks([], this.blocks().length, new Set(), this.folds(), this.foldsOpen()) : null;
  });

  /** A seção dobrável cujo título está neste bloco. */
  protected foldOf(i: number) {
    return this.folds().find((f) => f.head === i) ?? null;
  }

  protected isFoldOpen(i: number): boolean {
    return this.foldsOpen().has(i);
  }

  protected toggleFold(i: number): void {
    if (this.keepOpen() && this.foldsOpen().has(i)) return;
    this.settle();
    this.foldsOpen.update((all) => {
      const next = new Set(all);
      if (!next.delete(i)) next.add(i);
      return next;
    });
  }

  /**
   * Verdadeiro por um instante depois de abrir ou fechar algo: a página muda de altura de uma vez e a rolagem leva um momento
   * para se acertar (por um quadro a posição fica além do fim do texto). Quem mede o progresso não deve gravar nesse intervalo.
   */
  readonly settling = signal(false);
  private settleTimer: ReturnType<typeof setTimeout> | undefined;

  private settle(): void {
    this.settling.set(true);
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.settling.set(false), 900);
  }

  protected visible(i: number): boolean {
    return this.shown()?.[i] ?? true;
  }

  protected isOpen(n: number): boolean {
    return this.open().has(n);
  }

  /** O tópico que começa neste bloco (só com a sanfona ligada). */
  protected topicOf(i: number) {
    const index = this.sections().findIndex((s) => s.head === i);
    return index < 0 ? null : { index, title: this.sections()[index].title, minutes: this.sections()[index].minutes };
  }

  /** No fim do tópico aberto (sozinho), o próximo, para o botão "Próximo tópico". */
  protected nextTopic(i: number) {
    const sections = this.sections();
    const [n] = this.open().size === 1 ? [...this.open()] : [-1];
    return n >= 0 && sections[n]?.last === i && sections[n + 1] ? { index: n + 1, title: sections[n + 1].title } : null;
  }

  /** Abre o tópico (e fecha os outros) ou fecha o que está aberto. */
  protected toggleTopic(n: number): void {
    this.settle();
    if (this.keepOpen()) {
      this.open.update((all) => new Set(all).add(n));
      this.scrollToTopic(n);
      return;
    }
    if (this.open().has(n)) {
      this.open.update((all) => new Set([...all].filter((k) => k !== n)));
      return;
    }
    this.goTo(n);
  }

  /** Abre só este tópico e leva o título dele ao alto da tela (os de cima fecharam e empurraram o texto). */
  protected goTo(n: number): void {
    this.settle();
    this.open.set(new Set([n]));
    this.scrollToTopic(n);
  }

  private scrollToTopic(n: number): void {
    const anchor = this.sections()[n]?.anchor;
    if (!anchor) return;
    this.afterRender(() => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  private afterRender(action: () => void): void {
    requestAnimationFrame(() => requestAnimationFrame(action));
  }

  /** Abre todos os tópicos (o "Ouvir" lê o texto inteiro). Resolve quando o texto já está na tela. */
  openAll(): Promise<void> {
    this.settle();
    this.open.set(new Set(this.sections().map((_, n) => n)));
    const medicina = this.blocks().flatMap((b, i) => (b.type === 'note' && b.place === 'Medicina' ? [i] : []));
    this.foldsOpen.set(new Set([...this.folds().map((f) => f.head), ...medicina]));
    return new Promise((resolve) => this.afterRender(resolve));
  }

  /**
   * Progresso de leitura (0 a 1) pelo conteúdo, não pela altura da página (que muda quando os tópicos abrem e fecham);
   * `line` é a altura da tela que conta como "onde a pessoa está lendo". Sem sanfona, devolve `null`.
   */
  progress(line: number, viewportBottom: number): number | null {
    const sections = this.sections();
    if (!sections.length) return null;
    const heads = sections.map((s) => document.getElementById(s.anchor ?? ''));
    let n = -1;
    while (n + 1 < sections.length && (heads[n + 1]?.getBoundingClientRect().top ?? Infinity) <= line) n++;
    if (n < 0) return 0;
    const end = this.host.nativeElement.getBoundingClientRect().bottom;
    const top = heads[n]!.getBoundingClientRect().top;
    const bottom = heads[n + 1]?.getBoundingClientRect().top ?? end;
    // Tópico fechado, ou aberto agora mas ainda sem o texto desenhado (só o título): conta como não lido. Sem isso, abrir o
    // último tópico deixava o fim da página logo abaixo do título e a história era marcada como lida sem ninguém ler.
    if (!this.open().has(n) || bottom - top < 120) return readingFraction(sections, n, 0);
    if (n === sections.length - 1 && end <= viewportBottom) return 1;
    return readingFraction(sections, n, (line - top) / (bottom - top));
  }

  /** Leva ao ponto do texto que corresponde a este progresso: abre o tópico dele e rola até o lugar. */
  reveal(fraction: number): void {
    const sections = this.sections();
    if (!sections.length) return;
    const { topic, within } = locateTopic(sections, fraction);
    this.settle();
    this.open.set(new Set([topic]));
    this.afterRender(() => {
      const head = document.getElementById(sections[topic].anchor ?? '');
      if (!head) return;
      const next = document.getElementById(sections[topic + 1]?.anchor ?? '');
      const top = head.getBoundingClientRect().top + scrollY;
      const bottom = (next ? next.getBoundingClientRect().top : this.host.nativeElement.getBoundingClientRect().bottom) + scrollY;
      scrollTo({ top: top + within * (bottom - top) - innerHeight * 0.5, behavior: 'smooth' });
    });
  }

  /** Foto aberta em tela cheia (um toque na imagem). */
  protected readonly viewing = signal<ViewedPhoto | null>(null);

  protected view(b: Block): void {
    this.viewing.set({ src: b.src!, alt: b.alt ?? '', caption: (b.caption ?? []).map((x) => x.text).join('') });
  }

  protected sermonOf(id: string | undefined) {
    return CLASSIC_SERMONS.find((s) => s.id === id);
  }

  protected articleOf(id: string | undefined) {
    return id ? findArticle(id) : undefined;
  }

  protected initials(name: string): string {
    const words = name.split(/\s+/).filter((w) => /^[A-ZÀ-Ú]/.test(w));
    return (words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '');
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
