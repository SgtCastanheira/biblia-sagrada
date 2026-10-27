import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { contextFor } from '../../core/ad-context';
import { AD_STATES, CGADB_CONVENTIONS, findAdState, STATE_MINISTRIES } from '../../core/ad-states';
import { distanceKm, formatKm } from '../../core/atlas';
import { ContentService } from '../../core/content.service';
import { ListenService } from '../../core/listen.service';
import { findMap } from '../../core/maps';
import { outline } from '../../core/rich-text-parser';
import { BackButton } from '../../shared/back-button';
import { BibleMapView } from '../../shared/bible-map';
import { ContextList } from '../../shared/context-list';
import { storyItems } from '../../shared/listen-dom';
import { PageToc, TocItem } from '../../shared/page-toc';
import { RichText } from '../../shared/rich-text';
import { StateMinistries } from '../../shared/state-ministries';

/** História completa da Assembleia de Deus num estado, com o mapa de onde saíram os pioneiros. */
@Component({
  selector: 'app-ad-state',
  imports: [MatButtonModule, NgTemplateOutlet, RouterLink, MatIconModule, MatRippleModule, BibleMapView, BackButton, RichText, PageToc, ContextList, StateMinistries],
  template: `
    @if (state(); as s) {
      <div class="article wide">
        <div class="top">
          <app-back fallback="/assembleia-de-deus" />
          <button mat-icon-button (click)="listenState()" [attr.aria-label]="listen.state() === 'idle' ? 'Ouvir esta história' : 'Parar de ouvir'">
            <mat-icon>{{ listen.state() === 'idle' ? 'headphones' : 'stop_circle' }}</mat-icon>
          </button>
        </div>
        <header class="hero">
          <span class="hero-over">Assembleia de Deus · {{ s.region }}</span>
          <span class="era">{{ s.year }}</span>
          <h1 class="title">{{ s.state }}</h1>
          <p class="lead">{{ s.summary }}</p>
        </header>

        <div class="layout">
          <aside class="rail">
            <section class="card route">
              <app-bible-map [map]="statesMap" [interactive]="true" [activeStep]="stepIndex()" [focus]="focusPlaces()" />
              <div class="route-text">
                <span class="route-line">
                  <mat-icon>near_me</mat-icon>
                  @if (trip(); as t) {
                    <strong>{{ t.from }} → {{ t.to }}</strong> · {{ t.km }} em linha reta
                  } @else {
                    <strong>{{ s.city }}</strong>
                  }
                </span>
                <span class="origin">{{ s.origin }}</span>
              </div>
            </section>
            <app-page-toc [items]="toc()" title="Nesta história" />
            <ng-container *ngTemplateOutlet="moves" />
          </aside>

          <div class="main">
            @if (body() === undefined) {
              <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
            } @else if (body(); as text) {
              <app-rich-text [source]="text" [story]="true" />
            } @else {
              <p class="empty">Não foi possível abrir esta história agora.</p>
            }

            <app-context-list [events]="context()" />
            <app-state-ministries [stateName]="s.state" [ministries]="ministries()" [conventions]="conventions()" />

            <details class="sources" id="fontes">
              <summary><mat-icon>menu_book</mat-icon> Fontes das informações</summary>
              <ul>
                <li>Jornal Mensageiro da Paz: “Os primeiros passos da Assembleia de Deus no Brasil”</li>
                <li>CGADB: lista oficial das convenções (cgadb.org.br/convencoes); Marina Correa, “Assembleias de Deus, suas convenções e ministérios” (ISER, 2024); Wikipédia: CADB e CONAMAD</li>
                <li>O tempo da história: Boris Fausto, <em>História do Brasil</em>; Lilia Schwarcz e Heloisa Starling, <em>Brasil: uma biografia</em>; Eric Hobsbawm, <em>Era dos Extremos</em></li>
                @for (src of s.sources; track src) { <li>{{ src }}</li> }
              </ul>
              <p>As histórias locais foram escritas pelas próprias igrejas, muitas vezes décadas depois. Onde as fontes divergem, o texto mostra as versões.</p>
            </details>

            <div class="narrow-only"><ng-container *ngTemplateOutlet="moves" /></div>
          </div>
        </div>
      </div>

      <ng-template #moves>
        <nav class="neighbours" aria-label="Outros estados">
          @if (neighbours().prev; as p) {
            <a class="card" matRipple [routerLink]="['/assembleia-de-deus', p.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ p.state }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as n) {
            <a class="card next" matRipple [routerLink]="['/assembleia-de-deus', n.id]"><span><small>Próximo</small>{{ n.state }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
          <a class="all" routerLink="/assembleia-de-deus"><mat-icon>pin_drop</mat-icon> Todos os estados</a>
          <a class="all" routerLink="/assembleia-de-deus/linha-do-tempo"><mat-icon>timeline</mat-icon> Linha do tempo</a>
        </nav>
      </ng-template>
    } @else {
      <p class="empty">Estado não encontrado.</p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .hero {
      display: flex; flex-direction: column; align-items: flex-start; margin: 4px -20px 18px; padding: 24px 20px 20px; color: #fbf4e6;
      background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .28), transparent 60%), linear-gradient(165deg, #45321f, #21180f 75%);
    }
    @media (min-width: 840px) { .hero { margin: 4px 0 22px; padding: 34px 32px 26px; border-radius: 28px; } }
    .hero-over { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 2px; color: #e2c28c; }
    .era { margin: 6px 0 8px; font: 600 34px/1 var(--heading-font); color: #e2c28c; }
    .hero .title { margin: 0 0 8px; font-size: 34px; color: #fff8ec; }
    .hero .lead { margin: 0; max-width: 640px; color: #eadfcb; }
    .route app-bible-map { display: block; aspect-ratio: 4 / 3; overflow: hidden; }
    .route-text { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .route-line { display: flex; align-items: center; gap: 8px; font: 500 15px Inter, sans-serif; }
    .route-line mat-icon { color: var(--accent-gold); flex: none; }
    .origin { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .sources { margin: 28px 0 0; padding: 12px 16px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); scroll-margin-top: 72px; }
    .sources summary { display: flex; align-items: center; gap: 8px; min-height: 40px; cursor: pointer; font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    .sources summary mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .sources ul { margin: 6px 0; padding-left: 20px; font: 400 14px/1.5 Inter, sans-serif; }
    .sources p { margin: 6px 0 4px; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
    .neighbours a.card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px/1.3 var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
    .neighbours .all { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; border-radius: 14px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; background: var(--mat-sys-surface-container); }
    .rail { display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px; }
    .rail .neighbours { display: none; }
    .rail .route { margin: 0; }
    @media (min-width: 1100px) {
      .rail { position: sticky; top: 76px; max-height: calc(100vh - 92px); overflow-y: auto; margin: 0; padding-bottom: 4px; }
      .rail .neighbours { display: grid; margin-top: 0; }
      .narrow-only { display: none; }
    }
  `,
})
export class AdStatePage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);
  protected readonly listen = inject(ListenService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly statesMap = findMap('assembleia-de-deus-estados')!;
  protected readonly state = computed(() => findAdState(this.id()));

  protected readonly ministries = computed(() => STATE_MINISTRIES[this.id()] ?? []);
  protected readonly conventions = computed(() => CGADB_CONVENTIONS[this.id()] ?? []);
  protected readonly context = computed(() => {
    const s = this.state();
    return s ? contextFor(s.id, s.span) : [];
  });

  /** Etapa do estado no mapa: destaca o lugar e a seta de onde saíram os pioneiros. */
  protected readonly stepIndex = computed(() => this.statesMap.steps.findIndex((s) => s.place === this.id()));

  /** O mapa abre enquadrando a cidade de origem e a de destino. */
  protected readonly focusPlaces = computed(() => {
    const step = this.statesMap.steps[this.stepIndex()];
    return step ? [step.place, ...(step.from ? [step.from] : [])] : null;
  });

  /** De onde para onde, com a distância em linha reta. */
  protected readonly trip = computed(() => {
    const step = this.statesMap.steps[this.stepIndex()];
    const place = (id: string) => this.statesMap.places.find((p) => p.id === id)!;
    if (!step?.from) return null;
    const a = place(step.from), b = place(step.place);
    return { from: a.name, to: b.name, km: formatKm(distanceKm(a, b)) };
  });

  protected readonly body = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.content.text(`ad-estados/${id}.md`).pipe(map((t) => t as string | null | undefined), startWith(undefined))),
    ),
  );

  /** Índice: os capítulos da história e, depois, o contexto, os ministérios e as fontes. */
  protected readonly toc = computed<TocItem[]>(() => {
    const chapters = this.body() ? outline(this.body()!).map((o) => ({ anchor: o.anchor, text: o.text, chapter: o.chapter })) : [];
    return [
      ...chapters,
      { anchor: 'contexto', text: 'O Brasil naquele tempo' },
      { anchor: 'ministerios', text: 'Os ministérios no estado' },
      { anchor: 'fontes', text: 'Fontes' },
    ];
  });

  protected readonly neighbours = computed(() => {
    const i = AD_STATES.findIndex((s) => s.id === this.id());
    return { prev: i > 0 ? AD_STATES[i - 1] : null, next: i >= 0 && i < AD_STATES.length - 1 ? AD_STATES[i + 1] : null };
  });

  /** Ouvir a história do estado (gravação em voz neural, se existir; senão a voz do aparelho). */
  protected async listenState(): Promise<void> {
    if (this.listen.state() !== 'idle') {
      this.listen.stop();
      return;
    }
    const s = this.state();
    if (!s) return;
    const ok = await this.listen.startStory(`A Assembleia de Deus em ${s.state}`, `estados/${s.id}`, storyItems(`A Assembleia de Deus em ${s.state}. ${s.summary}`));
    if (!ok) this.snackBar.open('Este aparelho não tem leitura em voz alta.', undefined, { duration: 3000 });
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => this.listen.stop());
    const title = inject(Title);
    effect(() => {
      const s = this.state();
      if (s) title.setTitle(`A Assembleia de Deus em ${s.state} · Bíblia Sagrada`);
    });
  }
}
