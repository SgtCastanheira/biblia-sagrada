import { BackButton } from '../../shared/back-button';
import { Component, computed, DestroyRef, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { ContentService } from '../../core/content.service';
import { articlesOf, COLLECTIONS, findArticle, STORY_COLLECTIONS } from '../../core/library';
import { ListenService } from '../../core/listen.service';
import { trailOfArticle } from '../../core/trails';
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
          <app-back fallback="/historia" [queryParams]="{ trilha: trailId() }" />
          <span class="actions">
            <button mat-icon-button (click)="listenArticle()" [attr.aria-label]="listen.state() === 'idle' ? 'Ouvir esta história' : 'Parar de ouvir'">
              <mat-icon>{{ listen.state() === 'idle' ? 'headphones' : 'stop_circle' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="share()" aria-label="Compartilhar"><mat-icon>ios_share</mat-icon></button>
          </span>
        </div>
        @if (story()) {
          <div class="progress" aria-hidden="true"></div>
          <header class="hero">
            <mat-icon class="watermark" aria-hidden="true">{{ a.icon }}</mat-icon>
            <span class="hero-over">{{ collection()?.name }}</span>
            <span class="era">{{ a.period }}</span>
            @if (a.portraits?.length) {
              <div class="portraits" aria-hidden="true">
                @for (src of a.portraits; track src) { <img [src]="'conteudo/' + src" alt="" /> }
              </div>
            }
            <h1 class="title">{{ a.title }}</h1>
            <p class="lead">{{ a.subtitle }}</p>
            <p class="time"><mat-icon>schedule</mat-icon> {{ a.minutes }} min de leitura · role para entrar na história</p>
            @if (overview(); as o) {
              <a class="part-of" [routerLink]="['/artigo', o.id]"><mat-icon>auto_stories</mat-icon> Parte do panorama: {{ o.title }}</a>
            }
          </header>
        } @else {
          <span class="overline">{{ collection()?.name }} · {{ a.period }}</span>
          <h1 class="title">{{ a.title }}</h1>
          <p class="lead">{{ a.subtitle }}</p>
          <p class="time"><mat-icon>schedule</mat-icon> {{ a.minutes }} min de leitura</p>
        }

        @if (mapInfo(); as m) {
          <a class="card map" matRipple [routerLink]="['/mapas', m.id]">
            <app-bible-map [map]="m" [compact]="true" />
            <span class="map-label"><mat-icon>map</mat-icon> Ver no mapa interativo, etapa por etapa <mat-icon class="go">arrow_forward</mat-icon></span>
          </a>
        }

        @if (toc().length > 2) {
          <details class="toc" [open]="wide">
            <summary class="toc-title">
              <mat-icon>list</mat-icon> {{ story() ? 'Nesta história' : 'Neste estudo' }}
              <span class="count">{{ toc().length }} {{ story() ? 'capítulos' : 'partes' }}</span>
              <mat-icon class="expand">expand_more</mat-icon>
            </summary>
            <nav aria-label="Índice">
              @for (t of toc(); track t.anchor) {
                <button (click)="jump(t.anchor)">@if (story()) {<span class="n">{{ $index + 1 }}</span>}{{ t.text }}</button>
              }
            </nav>
          </details>
        }

        @if (body() === undefined) {
          <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
        } @else if (body(); as text) {
          <app-rich-text [source]="text" [story]="story()" />
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
    .toc-title {
      display: flex; align-items: center; gap: 6px; min-height: 40px; cursor: pointer; list-style: none;
      font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold);
    }
    .toc-title::-webkit-details-marker { display: none; }
    .toc .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    .toc .expand { transition: transform .2s; }
    .toc[open] .expand { transform: rotate(180deg); }
    .toc nav { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
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
    .toc .n {
      display: inline-grid; place-items: center; width: 24px; height: 24px; margin-right: 10px; border-radius: 50%;
      font: 700 13px Inter, sans-serif; color: var(--accent-gold); border: 1px solid var(--accent-gold);
    }
    /* Capa das histórias: escura e sépia, como a abertura de um documentário */
    .hero {
      position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start;
      margin: 4px -20px 24px; padding: 28px 20px 22px; color: #fbf4e6;
      background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .28), transparent 60%), linear-gradient(165deg, #45321f, #21180f 75%);
    }
    @media (min-width: 840px) { .hero { margin: 4px 0 28px; padding: 40px 36px 30px; border-radius: 28px; } }
    .watermark {
      position: absolute; right: -24px; bottom: -36px; width: 220px; height: 220px; font-size: 220px;
      color: rgba(226, 194, 140, .1); pointer-events: none;
    }
    .hero-over { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 2px; color: #e2c28c; }
    .era { margin: 6px 0 14px; font: 600 40px/1 var(--heading-font); letter-spacing: -.5px; color: #e2c28c; }
    .portraits { display: flex; margin-bottom: 16px; }
    .portraits img {
      width: 84px; height: 84px; border-radius: 50%; object-fit: cover; object-position: top; filter: sepia(.4) contrast(1.05);
      box-shadow: 0 0 0 3px #21180f, 0 0 0 5px #e2c28c;
    }
    .portraits img + img { margin-left: -14px; }
    .hero .title { position: relative; margin: 0 0 10px; font-size: 34px; color: #fff8ec; }
    .hero .lead { position: relative; margin: 0 0 16px; color: #eadfcb; }
    .hero .time { position: relative; margin: 0; color: #d9c9ad; }
    .part-of {
      position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; margin-top: 14px; padding: 0 14px;
      border-radius: 20px; text-decoration: none; font: 600 13px Inter, sans-serif; color: #fbf4e6;
      background: rgba(226, 194, 140, .16); border: 1px solid rgba(226, 194, 140, .4);
    }
    .part-of mat-icon { font-size: 18px; width: 18px; height: 18px; color: #e2c28c; }
    .progress {
      display: none; position: fixed; inset: 0 0 auto; z-index: 1000; height: 3px; background: var(--accent-gold);
      transform-origin: 0 50%; transform: scaleX(0);
    }
    @supports (animation-timeline: scroll()) {
      .part-of {
      position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; margin-top: 14px; padding: 0 14px;
      border-radius: 20px; text-decoration: none; font: 600 13px Inter, sans-serif; color: #fbf4e6;
      background: rgba(226, 194, 140, .16); border: 1px solid rgba(226, 194, 140, .4);
    }
    .part-of mat-icon { font-size: 18px; width: 18px; height: 18px; color: #e2c28c; }
    .progress { display: block; animation: read linear both; animation-timeline: scroll(root); }
    }
    @keyframes read { to { transform: scaleX(1); } }
  `,
})
export class ArticlePage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);
  protected readonly listen = inject(ListenService);
  private readonly snackBar = inject(MatSnackBar);

  /** Ouvir a história: título, resumo e cada parágrafo, um de cada vez, destacado na tela. */
  protected listenArticle(): void {
    if (!this.listen.supported) {
      this.snackBar.open('Este aparelho não tem leitura em voz alta.', undefined, { duration: 3000 });
      return;
    }
    if (this.listen.state() !== 'idle') {
      this.listen.stop();
      return;
    }
    const a = this.article();
    const body = document.querySelector('app-rich-text');
    if (!a || !body) return;
    const wanted = [...body.querySelectorAll<HTMLElement>('h2, h3, p, blockquote, ul:not(.people) > li, ol > li')]
      .filter((el) => !el.closest('.people, .read, .sources, .toc'));
    // Quem contém outro trecho da lista (uma citação com parágrafo dentro) fica de fora, para não ler duas vezes
    const leaves = wanted.filter((el) => !wanted.some((other) => other !== el && el.contains(other)));
    const items = [
      { text: `${a.title}. ${a.subtitle}` },
      ...leaves.map((el) => ({ el, text: (el.textContent ?? '').replace(/\s+/g, ' ').trim() })).filter((i) => i.text),
    ];
    this.listen.start(a.title, items);
  }


  protected readonly article = computed(() => findArticle(this.id()));
  protected readonly collection = computed(() => {
    const a = this.article();
    return a ? COLLECTIONS[a.collection] : undefined;
  });
  /** Assunto da tela de histórias a que este artigo pertence (para onde o botão voltar leva). */
  protected readonly trailId = computed(() => trailOfArticle(this.id())?.id);
  /** Histórias (Igreja e Bíblia) ganham capa e leitura em capítulos. */
  protected readonly story = computed(() => STORY_COLLECTIONS.includes(this.article()?.collection!));
  /** O panorama da coleção (como Atos), para quem quiser ver onde esta história se encaixa. */
  protected readonly overview = computed(() => {
    const a = this.article();
    return a && !a.overview ? articlesOf(a.collection).find((x) => x.overview) : undefined;
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

  /** No celular o índice começa fechado, para o texto aparecer logo. */
  protected readonly wide = typeof matchMedia !== 'undefined' && matchMedia('(min-width: 840px)').matches;
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
    inject(DestroyRef).onDestroy(() => this.listen.stop());
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
