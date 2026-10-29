import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { inBibleOrder, positionOfRef } from '../../core/bible-order';
import { findArticle } from '../../core/library';
import { CATEGORIES, KINDS, STATUSES } from '../../core/prophecy';
import { epochOfProphecy } from '../../core/epochs';
import { EraChip } from '../../shared/era-chip';
import { PassageView } from '../../shared/passage-view';
import { Sheets } from '../../shared/sheets';
import { SourcesBox } from '../../shared/sources-box';

/** Uma profecia: o texto, o contexto, o cumprimento e as interpretações. */
@Component({
  selector: 'app-prophecy',
  imports: [BackButton, EraChip, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, PassageView, SourcesBox],
  template: `
    @if (prophecy(); as p) {
      <div class="article">
        <div class="top">
          <app-back fallback="/profecias" />
        </div>
        <span class="overline">{{ categories[p.category].name }}</span>
        <h1 class="title">{{ p.title }}</h1>
        <div class="badges">
          <span class="status" [class]="p.status" [title]="statuses[p.status].description">{{ statuses[p.status].name }}</span>
          <span class="kind">{{ kinds[p.kind] }}</span>
        </div>

        <app-era-chip [epoch]="epoch()" label="Quando foi dada" />

        <h2 class="section-title">A profecia</h2>
        <p class="given"><mat-icon>record_voice_over</mat-icon>{{ p.given }}</p>
        <app-passage-view [refs]="p.ref" />

        <h2 class="section-title">O contexto</h2>
        <p class="body">{{ p.context }}</p>

        <h2 class="section-title">O cumprimento</h2>
        <ol class="fulfillment">
          @for (f of p.fulfillment; track f.ref) {
            <li>
              <span class="marker"></span>
              <button class="ref" (click)="openRef(f.ref)">{{ f.ref }}</button>
              <span>{{ f.text }}</span>
            </li>
          }
        </ol>

        <h2 class="section-title">Explicação</h2>
        <p class="body">{{ p.explanation }}</p>

        @if (p.views?.length) {
          <h2 class="section-title">Interpretações</h2>
          <p class="hint">Cristãos que creem na inspiração da Bíblia leem esta passagem de formas diferentes:</p>
          <div class="views">
            @for (v of p.views; track v.name) {
              <article class="card view"><h3>{{ v.name }}</h3><p>{{ v.text }}</p></article>
            }
          </div>
        }

        @if (article(); as a) {
          <a class="card link" matRipple [routerLink]="['/artigo', a.id]">
            <mat-icon>{{ a.icon }}</mat-icon><span><small>Estudo aprofundado</small>{{ a.title }}</span><mat-icon class="go">chevron_right</mat-icon>
          </a>
        }

        <nav class="neighbours">
          @if (neighbours().prev; as prev) {
            <a class="card" matRipple [routerLink]="['/profecias', prev.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ prev.title }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as next) {
            <a class="card next" matRipple [routerLink]="['/profecias', next.id]"><span><small>Próxima</small>{{ next.title }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
    } @else if (all()) {
      <p class="empty">Profecia não encontrada.</p>
    } @else {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    }
    <app-sources topic="profecias" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
    .status, .kind { font: 600 13px Inter, sans-serif; padding: 4px 12px; border-radius: 12px; }
    .kind { border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface-variant); }
    .status.cumprida { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .status.parcial { background: color-mix(in srgb, var(--accent-gold) 22%, transparent); color: var(--mat-sys-on-surface); }
    .status.debatida { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    .status.futura { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .given { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 500 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .given mat-icon { color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .body { font: 400 17px/1.75 var(--reading-font); margin: 0; }
    .hint { margin: 0 0 10px; color: var(--mat-sys-on-surface-variant); }
    .fulfillment { list-style: none; margin: 0; padding: 0; }
    .fulfillment li { position: relative; display: flex; flex-direction: column; padding: 0 0 14px 26px; font: 400 16px/1.55 var(--reading-font); }
    .fulfillment li::before { content: ''; position: absolute; left: 5px; top: 18px; bottom: -2px; width: 1px; background: var(--mat-sys-outline-variant); }
    .fulfillment li:last-child::before { display: none; }
    .marker { position: absolute; left: 0; top: 13px; width: 11px; height: 11px; border-radius: 50%; box-sizing: border-box; border: 1.5px solid var(--accent-gold); background: var(--mat-sys-surface); }
    .ref {
      align-self: flex-start; min-height: 36px; padding: 0; border: 0; background: none; cursor: pointer;
      font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: underline; text-underline-offset: 3px;
    }
    .views { display: grid; gap: 10px; }
    .view { padding: 14px 16px; border-radius: 16px; border-left: 3px solid var(--mat-sys-tertiary); }
    .view h3 { margin: 0 0 4px; font: 600 16px var(--heading-font); }
    .view p { margin: 0; font: 400 15px/1.6 var(--reading-font); }
    .link { display: flex; align-items: center; gap: 12px; margin-top: 22px; padding: 12px 14px; border-radius: 16px; }
    .link > mat-icon { color: var(--accent-gold); }
    .link span { flex: 1; display: flex; flex-direction: column; font: 600 15px/1.3 var(--heading-font); }
    .link small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .link .go { color: var(--mat-sys-on-surface-variant); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 28px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px/1.3 var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class ProphecyPage {
  readonly id = input.required<string>();
  private readonly sheets = inject(Sheets);
  protected readonly all = toSignal(inject(ContentService).prophecies);
  protected readonly categories = CATEGORIES;
  protected readonly statuses = STATUSES;
  protected readonly kinds = KINDS;

  protected readonly prophecy = computed(() => this.all()?.find((p) => p.id === this.id()));
  protected readonly epoch = computed(() => (this.prophecy() ? epochOfProphecy(this.prophecy()!) : null));
  protected readonly article = computed(() => {
    const id = this.prophecy()?.article;
    return id ? findArticle(id) : undefined;
  });
  protected readonly neighbours = computed(() => {
    const list = inBibleOrder(this.all() ?? [], (p) => positionOfRef(p.ref));
    const i = list.findIndex((p) => p.id === this.id());
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const p = this.prophecy();
      if (p) title.setTitle(`${p.title} · Profecias`);
    });
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
