import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { LangCode, GUEST_STRINGS } from '../core/guest-sermons';
import { parseReferences } from '../core/reference-parser';
import { Block, Inline, parseBlocks } from '../core/rich-text-parser';
import { spokenReference } from '../core/speech-ref';
import { Sheets } from './sheets';
import { VerseQuote } from './verse-quote';
import { VoiceArt } from './voice-art';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * O texto de um sermão de Novas Vozes da Palavra em estilo de jornal: colunas separadas por fio, letra capitular,
 * títulos com algarismo romano, frases em destaque, quadro lateral e ilustrações. Lê o mesmo Markdown dos estudos
 * (core/rich-text-parser.ts), com ":::versiculo" para citar a Bíblia por extenso na versão da língua da página.
 */
@Component({
  selector: 'app-news-text',
  imports: [NgTemplateOutlet, VerseQuote, VoiceArt],
  host: { '[attr.lang]': 'lang()' },
  template: `
    <ng-template #line let-parts>@for (p of parts; track $index) {@switch (p.t) {@case ('b') {<strong>{{ p.text }}</strong>}@case ('i') {<em>{{ p.text }}</em>}@case ('ref') {<button type="button" class="ref" [attr.data-say]="say(p)" (click)="open(p.href)">{{ p.text }}</button>}@default {{{ p.text }}}}}</ng-template>

    <div class="cols">
      @for (b of blocks(); track $index; let i = $index) {
        @switch (b.type) {
          @case ('h2') {
            <h2 [id]="b.anchor"><span class="num" aria-hidden="true">{{ roman(numbers()[i]) }}</span><span class="t"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></span></h2>
          }
          @case ('h3') { <h3><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h3> }
          @case ('verse') {
            @if (i === firstVerse()) {
              <section class="base"><span class="label">{{ strings().baseText }}</span><app-verse-quote [ref]="b.href!" [label]="b.label" [version]="version()" /></section>
            } @else {
              <app-verse-quote class="verse" [ref]="b.href!" [label]="b.label" [version]="version()" />
            }
          }
          @case ('pullquote') {
            <figure class="pull">
              <blockquote><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></blockquote>
              @if (b.cite) { <figcaption>— <ng-container *ngTemplateOutlet="line; context: { $implicit: b.cite }" /></figcaption> }
            </figure>
          }
          @case ('note') {
            <aside class="facts">
              @if (b.place) { <h3>{{ b.place }}</h3> }
              <ul>@for (item of b.items; track $index) { <li><ng-container *ngTemplateOutlet="line; context: { $implicit: item }" /></li> }</ul>
            </aside>
          }
          @case ('figure') {
            <figure class="art">
              <app-voice-art [id]="b.figure!" [lang]="lang()" />
              @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
            </figure>
          }
          @case ('ul') { <ul>@for (item of b.items; track $index) { <li><ng-container *ngTemplateOutlet="line; context: { $implicit: item }" /></li> }</ul> }
          @case ('ol') { <ol>@for (item of b.items; track $index) { <li><ng-container *ngTemplateOutlet="line; context: { $implicit: item }" /></li> }</ol> }
          @case ('p') { <p [class.lede]="i === firstParagraph()"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p> }
        }
      }
    </div>
  `,
  styleUrl: './news-text.scss',
})
export class NewsText {
  readonly source = input.required<string>();
  readonly lang = input<LangCode>('pt');
  /** Versão da Bíblia dos versículos tocados e das citações por extenso. */
  readonly version = input.required<string>();
  private readonly sheets = inject(Sheets);

  protected readonly strings = computed(() => GUEST_STRINGS[this.lang()]);
  protected readonly blocks = computed(() => parseBlocks(this.source()));
  /** Número de cada título de parte (I, II, III), pela posição do bloco. */
  protected readonly numbers = computed(() => {
    let n = 0;
    return this.blocks().map((b: Block) => (b.type === 'h2' ? ++n : 0));
  });
  protected readonly firstParagraph = computed(() => this.blocks().findIndex((b: Block) => b.type === 'p'));
  protected readonly firstVerse = computed(() => this.blocks().findIndex((b: Block) => b.type === 'verse'));

  protected roman(n: number): string {
    return ROMAN[n - 1] ?? String(n);
  }

  protected open(ref: string): void {
    this.sheets.passage(ref, this.version());
  }

  /** Como a referência soa em voz alta ("Provérbios capítulo 30, versículo 1"): o "Ouvir" lê este texto no lugar do que está na tela. */
  protected say(p: Inline): string {
    const label = this.lang() === 'pt' && p.text.trim() === p.href?.trim() ? (parseReferences(p.href!).refs[0]?.label ?? p.text) : p.text;
    return spokenReference(label, this.lang());
  }
}
