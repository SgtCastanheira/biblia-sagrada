import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { AD_STATES, BODIES, CGADB_CONVENTIONS, findAdState, STATE_MINISTRIES } from '../../core/ad-states';
import { distanceKm, formatKm } from '../../core/atlas';
import { ContentService } from '../../core/content.service';
import { findMap } from '../../core/maps';
import { BackButton } from '../../shared/back-button';
import { BibleMapView } from '../../shared/bible-map';
import { RichText } from '../../shared/rich-text';

/** História completa da Assembleia de Deus num estado, com o mapa de onde saíram os pioneiros. */
@Component({
  selector: 'app-ad-state',
  imports: [RouterLink, MatIconModule, MatRippleModule, BibleMapView, BackButton, RichText],
  template: `
    @if (state(); as s) {
      <div class="article">
        <div class="top"><app-back fallback="/assembleia-de-deus" /></div>
        <header class="hero">
          <span class="hero-over">Assembleia de Deus · {{ s.region }}</span>
          <span class="era">{{ s.year }}</span>
          <h1 class="title">{{ s.state }}</h1>
          <p class="lead">{{ s.summary }}</p>
        </header>

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

        @if (body() === undefined) {
          <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
        } @else if (body(); as text) {
          <app-rich-text [source]="text" [story]="true" />
        } @else {
          <p class="empty">Não foi possível abrir esta história agora.</p>
        }

        <section class="ministries" aria-labelledby="min-title">
          <h2 id="min-title"><mat-icon>account_tree</mat-icon> Os ministérios no estado</h2>
          <p class="min-intro">A história acima é a da igreja pioneira. Hoje, em {{ s.state }}, a Assembleia de Deus é uma família de ministérios e convenções, lado a lado.</p>
          @for (m of ministries(); track m.name) {
            <article class="min" [attr.data-body]="m.body">
              <span class="min-body">{{ bodies[m.body].name }}</span>
              <h3>{{ m.name }}</h3>
              <p>{{ m.text }}</p>
            </article>
          }
          @if (conventions().length) {
            <article class="min" data-body="CGADB">
              <span class="min-body">{{ bodies.CGADB.name }}</span>
              <h3>Convenções no estado</h3>
              <ul>@for (c of conventions(); track c) { <li>{{ c }}</li> }</ul>
            </article>
          }
          <article class="min" data-body="CONAMAD">
            <span class="min-body">{{ bodies.CONAMAD.name }}</span>
            <h3>Madureira em {{ s.state }}</h3>
            <p>A CONAMAD tem convenção em todos os estados, com igrejas ligadas ao Ministério de Madureira.</p>
          </article>
          <article class="min" data-body="CADB">
            <span class="min-body">{{ bodies.CADB.name }}</span>
            <h3>A CADB</h3>
            <p>{{ bodies.CADB.text }} Ao ser fundada, disse ter pastores em 26 unidades da federação.</p>
          </article>
          <a class="min-more" routerLink="/artigo/madureira-e-a-separacao">O que são a CGADB, a CONAMAD e a CADB</a>
        </section>

        <details class="sources">
          <summary><mat-icon>menu_book</mat-icon> Fontes das informações</summary>
          <ul>
            <li>Jornal Mensageiro da Paz: “Os primeiros passos da Assembleia de Deus no Brasil”</li>
            <li>CGADB: lista oficial das convenções (cgadb.org.br/convencoes); Marina Correa, “Assembleias de Deus, suas convenções e ministérios” (ISER, 2024); Wikipédia: CADB e CONAMAD</li>
            @for (src of s.sources; track src) { <li>{{ src }}</li> }
          </ul>
          <p>As histórias locais foram escritas pelas próprias igrejas, muitas vezes décadas depois. Onde as fontes divergem, o texto mostra as versões.</p>
        </details>

        <nav class="neighbours">
          @if (neighbours().prev; as p) {
            <a class="card" matRipple [routerLink]="['/assembleia-de-deus', p.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ p.state }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as n) {
            <a class="card next" matRipple [routerLink]="['/assembleia-de-deus', n.id]"><span><small>Próximo</small>{{ n.state }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
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
    .hero .lead { margin: 0; color: #eadfcb; }
    .route { margin: 0 0 22px; }
    .route app-bible-map { display: block; aspect-ratio: 4 / 3; overflow: hidden; }
    .route-text { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .route-line { display: flex; align-items: center; gap: 8px; font: 500 15px Inter, sans-serif; }
    .route-line mat-icon { color: var(--accent-gold); flex: none; }
    .origin { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .ministries { margin: 30px 0 0; }
    .ministries h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 600 24px/1.25 var(--heading-font); }
    .ministries h2 mat-icon { color: var(--accent-gold); }
    .min-intro { margin: 0 0 14px; font: 400 16px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .min { margin: 0 0 10px; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); border-left: 4px solid var(--mat-sys-outline); background: var(--mat-sys-surface-container-low); }
    .min[data-body='CGADB'] { border-left-color: var(--mat-sys-primary); }
    .min[data-body='CONAMAD'] { border-left-color: var(--accent-gold); }
    .min[data-body='CADB'] { border-left-color: var(--mat-sys-tertiary); }
    .min-body { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .6px; color: var(--mat-sys-on-surface-variant); }
    .min h3 { margin: 4px 0 4px; font: 600 18px/1.3 var(--heading-font); }
    .min p { margin: 0; font: 400 15px/1.55 var(--reading-font); }
    .min ul { margin: 4px 0 0; padding-left: 18px; font: 400 14px/1.5 Inter, sans-serif; }
    .min-more { display: inline-flex; align-items: center; min-height: 40px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .sources { margin: 28px 0 0; padding: 12px 16px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .sources summary { display: flex; align-items: center; gap: 8px; min-height: 40px; cursor: pointer; font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    .sources summary mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .sources ul { margin: 6px 0; padding-left: 20px; font: 400 14px/1.5 Inter, sans-serif; }
    .sources p { margin: 6px 0 4px; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px/1.3 var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class AdStatePage {
  readonly id = input.required<string>();
  private readonly content = inject(ContentService);
  protected readonly statesMap = findMap('assembleia-de-deus-estados')!;
  protected readonly state = computed(() => findAdState(this.id()));

  protected readonly bodies = BODIES;
  protected readonly ministries = computed(() => STATE_MINISTRIES[this.id()] ?? []);
  protected readonly conventions = computed(() => CGADB_CONVENTIONS[this.id()] ?? []);

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

  protected readonly neighbours = computed(() => {
    const i = AD_STATES.findIndex((s) => s.id === this.id());
    return { prev: i > 0 ? AD_STATES[i - 1] : null, next: i >= 0 && i < AD_STATES.length - 1 ? AD_STATES[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const s = this.state();
      if (s) title.setTitle(`A Assembleia de Deus em ${s.state} · Bíblia Sagrada`);
    });
  }
}
