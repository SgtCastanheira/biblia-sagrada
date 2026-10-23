import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { ContentService } from '../../core/content.service';
import { articlesOf, COLLECTIONS, findArticle } from '../../core/library';
import { findMap } from '../../core/maps';
import { BibleMapView } from '../../shared/bible-map';
import { outline } from '../../core/rich-text-parser';
import { RichText } from '../../shared/rich-text';
import { SourcesBox } from '../../shared/sources-box';

/** Artigo de estudo (história da Igreja, origem da Bíblia, estudos bíblicos). */
@Component({
  selector: 'app-article',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, RichText, BibleMapView, SourcesBox],
  template: `
    @if (article(); as a) {
      <div class="article">
        <div class="top">
          <app-back fallback="/historia" [queryParams]="{ colecao: a.collection }" />
          <button mat-icon-button (click)="share()" aria-label="Compartilhar"><mat-icon>ios_share</mat-icon></button>
        </div>
        <span class="overline">{{ collection()?.name }} · {{ a.period }}</span>
        <h1 class="title">{{ a.title }}</h1>
        <p class="lead">{{ a.subtitle }}</p>
        <p class="time"><mat-icon>schedule</mat-icon> {{ a.minutes }} min de leitura</p>

        @if (mapInfo(); as m) {
          <a class="card map" matRipple [routerLink]="['/mapas', m.id]">
            <app-bible-map [map]="m" [compact]="true" />
            <span class="map-label"><mat-icon>map</mat-icon> Ver no mapa interativo, etapa por etapa <mat-icon class="go">arrow_forward</mat-icon></span>
          </a>
        }

        @if (toc().length > 2) {
          <nav class="toc" aria-label="Neste estudo">
            <span class="toc-title"><mat-icon>list</mat-icon> Neste estudo</span>
            @for (t of toc(); track t.anchor) {
              <button (click)="jump(t.anchor)">{{ t.text }}</button>
            }
          </nav>
        }

        @if (body() === undefined) {
          <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
        } @else if (body(); as text) {
          <app-rich-text [source]="text" />
        } @else {
          <p class="empty">Não foi possível abrir este texto agora.</p>
        }

        <app-sources [article]="id()" />
        <nav class="neighbours">
          @if (neighbours().prev; as prev) {
            <a class="card" matRipple [routerLink]="['/artigo', prev.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ prev.title }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as next) {
            <a class="card next" matRipple [routerLink]="['/artigo', next.id]"><span><small>Próximo</small>{{ next.title }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
    } @else {
      <p class="empty">Texto não encontrado.</p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .time { display: flex; align-items: center; gap: 6px; margin: -6px 0 18px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .time mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .map { margin: 0 0 22px; }
    .map app-bible-map { display: block; aspect-ratio: 16 / 9; overflow: hidden; }
    .map-label {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--mat-sys-outline-variant);
      font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary);
    }
    .map-label .go { margin-left: auto; }
    .toc {
      display: flex; flex-direction: column; gap: 2px; margin: 0 0 22px; padding: 12px 14px; border-radius: 16px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .toc-title { display: flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); margin-bottom: 4px; }
    .toc-title mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .toc button {
      text-align: left; min-height: 40px; padding: 6px 8px; border: 0; border-radius: 10px; background: none; cursor: pointer;
      font: 500 15px/1.35 Inter, sans-serif; color: var(--mat-sys-primary);
    }
    .toc button:hover { background: var(--mat-sys-surface-container); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 32px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px/1.3 var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class ArticlePage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);

  protected readonly article = computed(() => findArticle(this.id()));
  protected readonly collection = computed(() => {
    const a = this.article();
    return a ? COLLECTIONS[a.collection] : undefined;
  });
  protected readonly mapInfo = computed(() => {
    const id = this.article()?.map;
    return id ? findMap(id) : undefined;
  });

  /** undefined = carregando; null = erro. */
  protected readonly body = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.content.text(`artigos/${id}.md`).pipe(map((t) => t as string | null | undefined), startWith(undefined))),
    ),
  );

  protected readonly toc = computed(() => (this.body() ? outline(this.body()!) : []));

  protected jump(anchor: string): void {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected readonly neighbours = computed(() => {
    const a = this.article();
    const list = a ? articlesOf(a.collection) : [];
    const i = list.findIndex((x) => x.id === a?.id);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const a = this.article();
      if (a) title.setTitle(`${a.title} · Bíblia Sagrada`);
    });
  }

  protected async share(): Promise<void> {
    const a = this.article();
    if (!a) return;
    const text = `${a.title}\n${a.subtitle}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: a.title, text, url: location.href });
      } catch {
        // cancelado
      }
    } else {
      await navigator.clipboard?.writeText(`${text}\n${location.href}`);
    }
  }
}
