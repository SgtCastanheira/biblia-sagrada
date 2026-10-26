import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ARTICLE_SOURCES, SourceSet, SourceTopic, TOPIC_SOURCES, WORKS } from '../core/sources';

/** "Fontes": de onde vêm as informações de um estudo ou de uma parte do app. */
@Component({
  selector: 'app-sources',
  imports: [MatIconModule, RouterLink],
  template: `
    @if (set(); as s) {
      <details class="sources" [open]="open()">
        <summary><mat-icon>menu_book</mat-icon><span>Fontes das informações</span><mat-icon class="chevron">expand_more</mat-icon></summary>
        <p class="lead">Texto escrito para este app a partir da Bíblia (os versículos estão no próprio texto) e das fontes abaixo.@if (s.note) { {{ s.note }} }</p>
        @if (s.ancient?.length) {
          <h3>{{ s.ancientLabel ?? 'Fontes antigas e arqueologia' }}</h3>
          <ul>@for (a of s.ancient; track a) { <li>{{ a }}</li> }</ul>
        }
        <h3>Para conferir e aprofundar</h3>
        <ul>
          @for (w of works(); track w.title) {
            <li>{{ w.author }}. <cite>{{ w.title }}</cite>. {{ w.publisher }}.</li>
          }
        </ul>
        <a class="all" routerLink="/fontes">Todas as fontes do app</a>
      </details>
    }
  `,
  styles: `
    :host { display: block; margin-top: 28px; }
    .sources { border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); padding: 0 16px; }
    summary {
      display: flex; align-items: center; gap: 10px; min-height: 52px; cursor: pointer; list-style: none;
      font: 600 16px var(--heading-font);
    }
    summary::-webkit-details-marker { display: none; }
    summary span { flex: 1; }
    summary mat-icon { color: var(--accent-gold); }
    summary .chevron { color: var(--mat-sys-on-surface-variant); transition: transform .2s; }
    details[open] .chevron { transform: rotate(180deg); }
    details[open] { padding-bottom: 14px; }
    .lead { margin: 0 0 10px; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    h3 { margin: 14px 0 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    ul { margin: 0; padding-left: 18px; font: 400 15px/1.55 var(--reading-font); }
    li { margin-bottom: 4px; }
    cite { font-style: italic; }
    .all { display: inline-flex; align-items: center; min-height: 40px; margin-top: 8px; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; }
  `,
})
export class SourcesBox {
  /** Estudo (id do artigo) ou parte do app. */
  readonly article = input<string>();
  readonly topic = input<SourceTopic>();
  readonly open = input(false);

  protected readonly set = computed<(SourceSet & { note?: string }) | undefined>(() => {
    const a = this.article();
    const t = this.topic();
    return a ? ARTICLE_SOURCES[a] : t ? TOPIC_SOURCES[t] : undefined;
  });
  protected readonly works = computed(() => (this.set()?.works ?? []).map((id) => WORKS[id]).filter(Boolean));
}
