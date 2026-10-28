import { BackButton } from '../../shared/back-button';
import { afterNextRender, Component, computed, DestroyRef, effect, ElementRef, inject, input, signal, untracked } from '@angular/core';
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
import { storyItems } from '../../shared/listen-dom';
import { QuizPrompt } from '../../shared/quiz-prompt';
import { trailOfArticle } from '../../core/trails';
import { linkedArticles, trailStep } from '../../core/story-graph';
import { StoryProgressService } from '../../core/story-progress.service';
import { StoryJourney } from '../../shared/story-journey';
import { findMap } from '../../core/maps';
import { BibleMapView } from '../../shared/bible-map';
import { headingKey, outline } from '../../core/rich-text-parser';
import { RichText } from '../../shared/rich-text';
import { SourcesBox } from '../../shared/sources-box';

/** Artigo de estudo (história da Igreja, origem da Bíblia, estudos bíblicos). */
@Component({
  selector: 'app-article',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, RichText, BibleMapView, SourcesBox, QuizPrompt, StoryJourney],
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
          <div class="now" [class.on]="!!chapter()" aria-hidden="true">
            @if (chapter(); as c) {
              <span class="now-n">{{ c.tag }}</span>
              <span class="now-t">{{ c.title }}</span>
              <span class="now-left">faltam {{ c.left }} min</span>
            }
          </div>
          <header class="hero">
            <mat-icon class="watermark" aria-hidden="true">{{ a.icon }}</mat-icon>
            <span class="hero-over">{{ step()?.trail?.name ?? collection()?.name }}@if (step(); as st) { · história {{ st.index + 1 }} de {{ st.total }} }</span>
            <span class="era">{{ a.period }}</span>
            @if (a.portraits?.length) {
              <div class="portraits" aria-hidden="true">
                @for (src of a.portraits; track src) { <img [src]="'conteudo/' + src" alt="" /> }
              </div>
            }
            <h1 class="title">{{ a.title }}</h1>
            @if (a.topics?.length) {
              <ul class="topics" aria-label="Nesta história">
                @for (t of topicLinks(); track t.text) {
                  <li><button type="button" (click)="jump(t.anchor)" [disabled]="!t.anchor">{{ t.text }}<mat-icon aria-hidden="true">arrow_downward</mat-icon></button></li>
                }
              </ul>
            } @else {
              <p class="lead">{{ a.subtitle }}</p>
            }
            <p class="time"><mat-icon>schedule</mat-icon> {{ a.minutes }} min de leitura</p>
            @if (overview(); as o) {
              <a class="part-of" [routerLink]="['/artigo', o.id]"><mat-icon>auto_stories</mat-icon> Parte do panorama: {{ o.title }}</a>
            }
          </header>
        } @else {
          <span class="overline">{{ step()?.trail?.name ?? collection()?.name }} · {{ a.period }}</span>
          <h1 class="title">{{ a.title }}</h1>
          @if (a.topics?.length) {
            <ul class="topics" aria-label="Neste estudo">
              @for (t of topicLinks(); track t.text) {
                <li><button type="button" (click)="jump(t.anchor)" [disabled]="!t.anchor">{{ t.text }}<mat-icon aria-hidden="true">arrow_downward</mat-icon></button></li>
              }
            </ul>
          } @else {
            <p class="lead">{{ a.subtitle }}</p>
          }
          <p class="time"><mat-icon>schedule</mat-icon> {{ a.minutes }} min de leitura</p>
        }

        @if (resume(); as at) {
          <button type="button" class="resume" (click)="resumeReading(at)"><mat-icon>bookmark</mat-icon> Continuar de onde parou · {{ percent(at) }}%</button>
        } @else if (progress.isDone(id())) {
          <p class="read-done"><mat-icon>check_circle</mat-icon> Você já leu esta história</p>
        }

        @if (mapInfo(); as m) {
          <a class="card map" matRipple [routerLink]="['/mapas', m.id]">
            <app-bible-map [map]="m" [compact]="true" />
            <span class="map-label"><mat-icon>map</mat-icon> Ver no mapa interativo, etapa por etapa <mat-icon class="go">arrow_forward</mat-icon></span>
          </a>
        }

        @if (toc().length > 2 && !article()?.topics?.length) {
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
          <app-rich-text [source]="text" [story]="story()" [topics]="article()?.topics ?? []" />
        } @else {
          <p class="empty">Não foi possível abrir este texto agora.</p>
        }

        @if (body()) {
          <app-quiz-prompt [link]="['/quiz/historia', id()]" text="Cinco perguntas sobre esta história: datas, personagens e ideias." />
        }
        <app-sources [article]="id()" />
        @if (body()) {
          <app-story-journey [articleId]="id()" [linked]="linked()" />
        }
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
    /* O que a história responde, um tópico por linha */
    .topics { position: relative; display: flex; flex-direction: column; gap: 0; margin: 2px 0 14px; padding: 0; list-style: none; }
    .topics li { position: relative; padding-left: 20px; }
    .topics li::before { content: ''; position: absolute; left: 3px; top: 1.05em; width: 7px; height: 7px; border-radius: 50%; background: var(--accent-gold); }
    .topics button {
      display: block; width: 100%; min-height: 40px; padding: 6px 0; border: 0; background: none; cursor: pointer; text-align: left;
      font: 400 16px/1.45 var(--reading-font); color: var(--mat-sys-on-surface-variant); text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 4px;
    }
    .topics button:hover:not(:disabled) { text-decoration-color: currentColor; }
    .topics button mat-icon { width: 16px; height: 16px; margin-left: 6px; font-size: 16px; vertical-align: -2px; color: var(--accent-gold); }
    .hero .topics button mat-icon { color: #e2c28c; }
    .topics button:disabled { cursor: default; }
    .hero .topics button { color: #eadfcb; }
    .hero .topics li::before { background: #e2c28c; }
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
    .progress { display: block; animation: read linear both; animation-timeline: scroll(root); }
    }
    @keyframes read { to { transform: scaleX(1); } }
    .resume {
      display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin: 0 0 18px; padding: 0 18px; border-radius: 22px; cursor: pointer;
      border: 1px solid var(--accent-gold); background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface); font: 600 15px Inter, sans-serif;
    }
    .resume mat-icon { color: var(--accent-gold); }
    .read-done { display: flex; align-items: center; gap: 6px; margin: 0 0 18px; font: 500 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .read-done mat-icon { font-size: 20px; width: 20px; height: 20px; }
    /* Capítulo atual, embaixo da tela, enquanto se lê a história */
    .now {
      position: fixed; z-index: 25; left: 0; right: 0; margin-inline: auto; bottom: calc(var(--nav-height, 72px) + 12px + env(safe-area-inset-bottom));
      display: flex; align-items: center; gap: 8px; width: max-content; max-width: min(520px, calc(100vw - 32px)); padding: 8px 14px; border-radius: 20px; box-sizing: border-box;
      background: var(--mat-sys-surface-container-highest); color: var(--mat-sys-on-surface); border: 1px solid var(--mat-sys-outline-variant);
      box-shadow: 0 4px 16px rgba(0, 0, 0, .18); font: 500 13px Inter, sans-serif;
      transform: translateY(140%); opacity: 0; transition: transform .25s, opacity .25s; pointer-events: none;
    }
    .now.on { transform: none; opacity: 1; }
    @media (min-width: 840px) { .now { bottom: 20px; } }
    @media (prefers-reduced-motion: reduce) { .now { transition: none; } }
    .now-n { flex: none; font-weight: 700; color: var(--accent-gold); }
    .now-t { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: 600; }
    .now-left { flex: none; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class ArticlePage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);
  protected readonly listen = inject(ListenService);
  private readonly snackBar = inject(MatSnackBar);

  /** Ouvir a história: título, resumo e cada parágrafo, um de cada vez, destacado na tela. */
  protected async listenArticle(): Promise<void> {
    if (this.listen.state() !== 'idle') {
      this.listen.stop();
      return;
    }
    const a = this.article();
    if (!a) return;
    const ok = await this.listen.startStory(a.title, `artigos/${a.id}`, storyItems(`${a.title}. ${a.subtitle}`));
    if (!ok) this.snackBar.open('Este aparelho não tem leitura em voz alta.', undefined, { duration: 3000 });
  }


  protected readonly progress = inject(StoryProgressService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly article = computed(() => findArticle(this.id()));
  /** Posição na trilha (para a capa e para o painel do fim). */
  protected readonly step = computed(() => trailStep(this.id()));
  /** Histórias que o texto já cita: o painel do fim não as sugere de novo. */
  protected readonly linked = computed(() => linkedArticles(this.body() ?? ''));
  /** Onde a pessoa parou da última vez (some quando ela continua ou passa desse ponto). */
  protected readonly resume = signal<number | null>(null);
  /** Capítulo que está na tela, com o tempo que falta. */
  protected readonly chapter = signal<{ tag: string; title: string; left: number } | null>(null);
  protected readonly collection = computed(() => {
    const a = this.article();
    return a ? COLLECTIONS[a.collection] : undefined;
  });
  /** Assunto da tela de histórias a que este artigo pertence (para onde o botão voltar leva). */
  protected readonly trailId = computed(() => trailOfArticle(this.id())?.id);
  /** Histórias (Igreja e Bíblia) ganham capa e leitura em capítulos. */
  protected readonly story = computed(() => STORY_COLLECTIONS.includes(this.article()?.collection!) || !!this.article()?.story);
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
  protected readonly toc = computed(() => (this.body() ? outline(this.body()!, this.article()?.topics ?? []) : []));
  /** Os tópicos da capa, cada um com a seção do texto que ele abre. */
  protected readonly topicLinks = computed(() =>
    (this.article()?.topics ?? []).map((text) => ({ text, anchor: this.toc().find((h) => headingKey(h.text) === headingKey(text))?.anchor })),
  );

  protected jump(anchor: string | undefined): void {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected percent(at: number): number {
    return Math.round(at * 100);
  }

  /** Leva ao ponto em que a pessoa parou. */
  protected resumeReading(at: number): void {
    const text = this.host.nativeElement.querySelector('app-rich-text');
    this.resume.set(null);
    if (!text) return;
    const r = text.getBoundingClientRect();
    window.scrollTo({ top: scrollY + r.top + at * r.height - innerHeight * 0.5, behavior: 'smooth' });
  }

  /** A cada rolagem: guarda até onde leu (no fim do texto, a história fica lida) e mostra o capítulo atual. */
  private track(): void {
    const text = this.host.nativeElement.querySelector('app-rich-text');
    const a = this.article();
    if (!text || !a || !this.body()) return;
    const r = text.getBoundingClientRect();
    const h = innerHeight;
    const fraction = r.bottom <= h ? 1 : Math.min(1, Math.max(0, (h * 0.5 - r.top) / r.height));
    this.progress.record(a.id, fraction);
    const at = this.resume();
    if (at !== null && fraction >= at - 0.02) this.resume.set(null);
    if (!this.story()) return;
    const toc = this.toc();
    let n = -1;
    for (let i = 0; i < toc.length; i++) {
      const el = document.getElementById(toc[i].anchor);
      if (!el || el.getBoundingClientRect().top > h * 0.35) break;
      n = i;
    }
    // "Tópico 2 de 5" vira "2/5"; um capítulo, "3/12"; uma seção especial, o nome dela ("Em resumo")
    const topic = n >= 0 ? /^Tópico (\d+) de (\d+)$/.exec(toc[n].label) : null;
    const tag = n < 0 ? '' : topic ? `${topic[1]}/${topic[2]}` : toc[n].chapter ? `${toc[n].chapter}/${toc.filter((t) => t.chapter).length}` : toc[n].label;
    this.chapter.set(n >= 0 && r.bottom > h * 0.6 ? { tag, title: toc[n].text, left: Math.max(1, Math.round(a.minutes * (1 - fraction))) } : null);
  }

  constructor() {
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => this.listen.stop());
    // Ao abrir (ou trocar de) história: onde parou da última vez, e nenhum capítulo na tela ainda
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.resume.set(this.progress.resumeAt(id));
        this.chapter.set(null);
      });
    });
    afterNextRender(() => {
      let frame = 0;
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; this.track(); });
      };
      addEventListener('scroll', onScroll, { passive: true });
      destroy.onDestroy(() => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); });
    });
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
