import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ARTICLES, COLLECTIONS } from '../../core/library';
import { ARTICLE_SOURCES, SourceTopic, TOPIC_SOURCES, Work, WORK_KINDS, WorkKind, WORKS } from '../../core/sources';
import { BackButton } from '../../shared/back-button';

/** Todas as fontes das informações de estudo do app. */
@Component({
  selector: 'app-sources-page',
  imports: [RouterLink, MatIconModule, BackButton],
  template: `
    <div class="top"><app-back fallback="/estudo" /></div>
    <header class="page-head">
      <span class="overline">Estudo</span>
      <h1>Fontes das informações</h1>
      <p>Os textos de estudo foram escritos para este app a partir da Bíblia — os versículos estão sempre no próprio texto —, de fontes antigas e achados arqueológicos e de obras de referência, indicadas aqui para quem quiser conferir e aprofundar.</p>
    </header>

    <h2 class="section-title">Cada parte do app</h2>
    @for (t of topics; track t.id) {
      <section class="topic">
        <h3>{{ t.title }}</h3>
        @if (t.note) { <p class="note">{{ t.note }}</p> }
        <ul>@for (w of works(t.works); track w.title) { <li>{{ w.author }}. <cite>{{ w.title }}</cite>.</li> }</ul>
      </section>
    }

    <h2 class="section-title">Cada estudo</h2>
    @for (c of collections; track c.id) {
      <h3 class="collection">{{ c.name }}</h3>
      @for (a of c.articles; track a.id) {
        <details class="article">
          <summary><a [routerLink]="['/artigo', a.id]" (click)="$event.stopPropagation()">{{ a.title }}</a><mat-icon>expand_more</mat-icon></summary>
          @if (sources[a.id]?.ancient?.length) {
            <p class="label">{{ sources[a.id].ancientLabel ?? 'Fontes antigas e arqueologia' }}</p>
            <ul>@for (x of sources[a.id].ancient; track x) { <li>{{ x }}</li> }</ul>
          }
          <p class="label">Para conferir e aprofundar</p>
          <ul>@for (w of works(sources[a.id]?.works ?? []); track w.title) { <li>{{ w.author }}. <cite>{{ w.title }}</cite>.</li> }</ul>
        </details>
      }
    }

    <h2 class="section-title">Todas as obras de referência</h2>
    @for (g of bibliography; track g.kind) {
      <h3 class="collection">{{ g.name }}</h3>
      <ul class="biblio">@for (w of g.works; track w.title) { <li>{{ w.author }}. <cite>{{ w.title }}</cite>. {{ w.publisher }}.</li> }</ul>
    }
    <p class="note">Textos bíblicos, mapas e dados de terceiros e as suas licenças estão em <a routerLink="/creditos">Créditos e licenças</a>.</p>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .topic { margin: 0 4px 16px; }
    h3 { margin: 0 0 4px; font: 600 17px var(--heading-font); }
    .collection { margin: 18px 4px 8px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    .note { margin: 0 0 6px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    ul { margin: 0; padding-left: 20px; font: 400 15px/1.55 var(--reading-font); }
    li { margin-bottom: 4px; }
    cite { font-style: italic; }
    .article { margin: 0 4px; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .article summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 48px; cursor: pointer; list-style: none; }
    .article summary::-webkit-details-marker { display: none; }
    .article summary a { color: var(--mat-sys-primary); font: 600 15px var(--heading-font); text-decoration: none; }
    .article summary mat-icon { color: var(--mat-sys-on-surface-variant); }
    .article[open] summary mat-icon { transform: rotate(180deg); }
    .article[open] { padding-bottom: 10px; }
    .label { margin: 8px 0 4px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .biblio { margin: 0 4px; }
  `,
})
export class SourcesPage {
  protected readonly sources = ARTICLE_SOURCES;
  protected readonly topics = (Object.keys(TOPIC_SOURCES) as SourceTopic[]).map((id) => ({ id, ...TOPIC_SOURCES[id] }));
  protected readonly collections = (Object.keys(COLLECTIONS) as (keyof typeof COLLECTIONS)[]).map((id) => ({
    id, name: COLLECTIONS[id].name, articles: ARTICLES.filter((a) => a.collection === id),
  }));
  protected readonly bibliography = (Object.keys(WORK_KINDS) as WorkKind[]).map((kind) => ({
    kind, name: WORK_KINDS[kind],
    works: Object.values(WORKS).filter((w) => w.kind === kind).sort((a, b) => a.author.localeCompare(b.author, 'pt-BR')),
  }));

  protected works(ids: string[]): Work[] {
    return ids.map((id) => WORKS[id]).filter(Boolean);
  }
}
