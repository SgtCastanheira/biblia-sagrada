import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { parseBlocks } from '../core/rich-text-parser';
import { Sheets } from './sheets';

/** Mostra texto de estudo formatado. Referências bíblicas abrem o texto num painel. */
@Component({
  selector: 'app-rich-text',
  imports: [NgTemplateOutlet, RouterLink, MatIconModule],
  template: `
    <ng-template #line let-parts>@for (p of parts; track $index) {@switch (p.t) {@case ('b') {<strong>{{ p.text }}</strong>}@case ('i') {<em>{{ p.text }}</em>}@case ('ref') {<button type="button" class="ref" (click)="openRef(p.href)">{{ p.text }}</button>}@case ('link') {<a class="link" [routerLink]="p.href">{{ p.text }}</a>}@default {{{ p.text }}}}}</ng-template>

    @for (b of blocks(); track $index) {
      @switch (b.type) {
        @case ('h2') { <h2 [id]="b.anchor"><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h2> }
        @case ('h3') { <h3><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></h3> }
        @case ('quote') { <blockquote><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></blockquote> }
        @case ('note') {
          <aside class="note"><mat-icon>lightbulb</mat-icon><p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p></aside>
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
                <span class="title">{{ e.title }}</span>
                <span class="text"><ng-container *ngTemplateOutlet="line; context: { $implicit: e.text }" /></span>
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
        @default { <p><ng-container *ngTemplateOutlet="line; context: { $implicit: b.inlines }" /></p> }
      }
    }
  `,
  styles: `
    :host { display: block; font: 400 17px/1.75 var(--reading-font); }
    p { margin: 0 0 16px; }
    h2 { font: 600 22px/1.3 var(--heading-font); margin: 30px 0 10px; letter-spacing: -.2px; scroll-margin-top: 72px; }
    h3 { font: 600 18px/1.35 var(--heading-font); margin: 22px 0 8px; color: var(--mat-sys-primary); }
    strong { font-weight: 600; }
    blockquote {
      margin: 0 0 18px; padding: 4px 0 4px 18px; border-left: 3px solid var(--accent-gold);
      font-style: italic; color: var(--mat-sys-on-surface);
    }
    ul, ol { margin: 0 0 16px; padding-left: 22px; }
    li { margin-bottom: 6px; }
    li::marker { color: var(--accent-gold); font-weight: 600; }
    .ref {
      display: inline; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; font-weight: 600;
      color: var(--mat-sys-primary); text-decoration: underline; text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
      text-underline-offset: 3px;
    }
    .link { color: var(--mat-sys-primary); font-weight: 600; text-underline-offset: 3px; }
    .note {
      display: flex; gap: 12px; margin: 4px 0 20px; padding: 14px 16px; border-radius: 16px;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .note mat-icon { flex: none; color: var(--accent-gold); }
    .note p { margin: 0; font: 400 16px/1.6 var(--reading-font); }
    .table-wrap { overflow-x: auto; margin: 4px 0 20px; border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); }
    table { width: 100%; border-collapse: collapse; font: 400 15px/1.45 var(--reading-font); }
    th { text-align: left; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); background: var(--mat-sys-surface-container); padding: 10px 12px; }
    td { padding: 10px 12px; border-top: 1px solid var(--mat-sys-outline-variant); vertical-align: top; min-width: 120px; }
    .timeline { list-style: none; padding: 0; margin: 8px 0 22px; }
    .timeline li { position: relative; display: flex; flex-direction: column; padding: 0 0 18px 28px; margin: 0; }
    .timeline li::before {
      content: ''; position: absolute; left: 5px; top: 18px; bottom: -2px; width: 1px; background: var(--mat-sys-outline-variant);
    }
    .timeline li:last-child { padding-bottom: 0; }
    .timeline li:last-child::before { display: none; }
    .marker {
      position: absolute; left: 0; top: 5px; width: 11px; height: 11px; border-radius: 50%; box-sizing: border-box;
      border: 1.5px solid var(--accent-gold); background: var(--mat-sys-surface);
    }
    .date { font: 600 13px Inter, sans-serif; color: var(--accent-gold); letter-spacing: .3px; }
    .title { font: 600 17px/1.35 var(--heading-font); }
    .text { font: 400 16px/1.6 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
  `,
})
export class RichText {
  readonly source = input.required<string>();
  private readonly sheets = inject(Sheets);
  protected readonly blocks = computed(() => parseBlocks(this.source()));

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
