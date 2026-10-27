import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CLASSIC_SERMONS, findArticle } from '../core/library';
import { Block, parseBlocks, sectionLabels } from '../core/rich-text-parser';
import { Figure } from './figure';
import { SendChain } from './send-chain';
import { Sheets } from './sheets';

/**
 * Mostra texto de estudo formatado. Referências bíblicas abrem o texto num painel.
 * No modo história (story), o texto vira uma narrativa: capítulos numerados, letra capitular,
 * fotos como retratos de época, cenas, frases em destaque e blocos que aparecem ao rolar.
 */
@Component({
  selector: 'app-rich-text',
  imports: [NgTemplateOutlet, RouterLink, MatIconModule, Figure, SendChain],
  host: { '[class.story]': 'story()' },
  template: `
    <ng-template #line let-parts>@for (p of parts; track $index) {@switch (p.t) {@case ('b') {<strong>{{ p.text }}</strong>}@case ('i') {<em>{{ p.text }}</em>}@case ('ref') {<button type="button" class="ref" (click)="openRef(p.href)">{{ p.text }}</button>}@case ('link') {<a class="link" [routerLink]="p.href">{{ p.text }}</a>}@default {{{ p.text }}}}}</ng-template>

    @for (b of blocks(); track $index; let i = $index) {
      @switch (b.type) {
        @case ('h2') {
          @if (story()) { <span class="chapter" aria-hidden="true">{{ labels()[i] }}</span> }
          <h2 [id]="b.anchor"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h2>
        }
        @case ('h3') { <h3><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h3> }
        @case ('quote') { <blockquote><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></blockquote> }
        @case ('note') {
          <aside class="note"><mat-icon>lightbulb</mat-icon><p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p></aside>
        }
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
        @case ('read') {
          @if (articleOf(b.article); as a) {
            <a class="read" [routerLink]="['/artigo', a.id]">
              <span class="read-icon"><mat-icon>{{ a.icon }}</mat-icon></span>
              <span class="read-texts">
                <span class="read-over">História completa · {{ a.period }}</span>
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
          <figure class="photo" [class.left]="photoSide()[i]">
            <img [src]="'conteudo/' + b.src" [alt]="b.alt" loading="lazy" />
            @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
          </figure>
        }
        @case ('figure') {
          <figure class="diagram">
            <app-figure [id]="b.figure!" />
            @if (b.caption) { <figcaption><ng-container *ngTemplateOutlet="line; context: { $implicit: b.caption }" /></figcaption> }
          </figure>
        }
        @default { <p [class.opening]="i === opening()"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p> }
      }
    }
  `,
  styleUrl: './rich-text.scss',
})
export class RichText {
  readonly source = input.required<string>();
  /** Modo história: capítulos, letra capitular, retratos e animações ao rolar. */
  readonly story = input(false);
  private readonly sheets = inject(Sheets);
  protected readonly blocks = computed(() => parseBlocks(this.source()));

  /** Rótulo de cada título de seção: "Capítulo 1", "Capítulo 2"… ou um nome especial. */
  protected readonly labels = computed(() => sectionLabels(this.blocks()));

  /** O primeiro parágrafo ganha a letra capitular. */
  protected readonly opening = computed(() => (this.story() ? this.blocks().findIndex((b: Block) => b.type === 'p') : -1));

  /** As fotos alternam de lado no computador, como numa revista. */
  protected readonly photoSide = computed(() => {
    let n = 0;
    return this.blocks().map((b) => b.type === 'image' && n++ % 2 === 1);
  });

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
