import { HttpClient } from '@angular/common/http';
import { afterNextRender, Component, computed, DestroyRef, effect, ElementRef, inject, input, model, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { distanceKm, Era, formatKm, GAZETTEER, GazetteerKind, MODERN_COUNTRIES } from '../core/atlas';
import { BibleMap, LabelSide, projector } from '../core/maps';

interface Geography {
  land: string;
  lakes: string;
  rivers: string[];
  /** Fronteiras atuais dos países. */
  borders?: string[];
}

let instances = 0;
const NICE_KM = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

/** Retângulo visível do mapa (unidades do SVG). */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

const geographyCache = new Map<string, Geography>();

/** [1, 14] → "1·14"; [22, 23, 24, 25] → "22–25". */
function formatSteps(steps: number[]): string {
  const parts: string[] = [];
  for (let i = 0; i < steps.length; ) {
    let j = i;
    while (j + 1 < steps.length && steps[j + 1] === steps[j] + 1) j++;
    parts.push(j - i >= 2 ? `${steps[i] + 1}–${steps[j] + 1}` : steps.slice(i, j + 1).map((n) => n + 1).join('·'));
    i = j + 1;
  }
  return parts.join('·');
}
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Mapa histórico em SVG: geografia real (Natural Earth), lugares, rota e etapas numeradas.
 * - interactive: arrastar, pinça e roda do mouse para zoom.
 * - storyStep: modo história — a câmera e o "viajante" seguem as etapas, desenhando a rota aos poucos.
 */
@Component({
  selector: 'app-bible-map',
  template: `
    @let geo = geography();
    @let c = camera();
    <svg [attr.viewBox]="c.x + ' ' + c.y + ' ' + c.w + ' ' + c.h" [class.compact]="compact()" [class.interactive]="interactive()"
         [class.story]="storyStep() !== null" role="img" [attr.aria-label]="'Mapa: ' + map().title"
         (pointerdown)="onPointerDown($event)" (pointermove)="onPointerMove($event)" (pointerup)="onPointerUp($event)"
         (pointercancel)="onPointerUp($event)" (wheel)="onWheel($event)" (dblclick)="onDoubleClick($event)">
      <defs>
        @if (geo) {
          <clipPath [attr.id]="clipId"><path [attr.d]="geo.land" /></clipPath>
        }
        <marker [attr.id]="'arrow-' + map().id" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="arrow" />
        </marker>
      </defs>
      <rect class="sea" [attr.x]="-view().width" [attr.y]="-view().height" [attr.width]="view().width * 3" [attr.height]="view().height * 3" />
      @if (geo) {
        <path class="land" [attr.d]="geo.land" [attr.stroke-width]="font() * 0.05" />
        @for (river of geo.rivers; track $index) {
          <path class="river" [attr.d]="river" [attr.stroke-width]="font() * 0.11" />
        }
        <path class="lake" [attr.d]="geo.lakes" [attr.stroke-width]="font() * 0.05" />

        <!-- Reinos e impérios da época (recortados pelo litoral) -->
        @if (powers().length) {
          <g [attr.clip-path]="'url(#' + clipId + ')'">
            @for (pw of powers(); track pw.key) {
              <path class="power" [class.territory]="pw.territory" [class.dim]="pw.dim" [class.focus]="pw.focus" [attr.d]="pw.d"
                    [style.fill]="pw.color" [style.stroke]="pw.color" [attr.stroke-width]="font() * (pw.focus ? 0.2 : 0.12)"
                    [attr.stroke-dasharray]="pw.territory ? null : font() * 0.5 + ' ' + font() * 0.3" />
            }
          </g>
        }

        <!-- Fronteiras de hoje -->
        @if (modern()) {
          @for (b of geo.borders ?? []; track $index) {
            <path class="border" [attr.d]="b" [attr.stroke-width]="font() * 0.09" [attr.stroke-dasharray]="font() * 0.35 + ' ' + font() * 0.25" />
          }
        }
      }

      @for (l of layerLabels(); track l.key) {
        @switch (l.kind) {
          @case ('power') { <text class="power-label" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.82" [style.fill]="l.color">{{ l.text }}</text> }
          @case ('people') { <text class="people" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.8">{{ l.text }}</text> }
          @case ('modern') { <text class="modern" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.85">{{ l.text }}</text> }
          @case ('agua') { <text class="water" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.78">{{ l.text }}</text> }
          @case ('rio') { <text class="water" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.72">{{ l.text }}</text> }
          @case ('deserto') { <text class="people" [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.72">{{ l.text }}</text> }
          @default {
            <g class="nearby">
              @if (l.kind === 'monte') {
                <path [attr.d]="'M' + l.px + ',' + (l.py - font() * 0.32) + 'l' + font() * 0.3 + ',' + font() * 0.52 + 'h-' + font() * 0.6 + 'z'" />
              } @else {
                <circle [attr.cx]="l.px" [attr.cy]="l.py" [attr.r]="font() * 0.17" />
              }
              <text [attr.x]="l.x" [attr.y]="l.y" [attr.font-size]="font() * 0.74">{{ l.text }}</text>
            </g>
          }
        }
      }

      @for (region of regions(); track region.id) {
        <text class="region" [attr.x]="region.x" [attr.y]="region.y" [attr.font-size]="font() * 0.95">{{ region.name }}</text>
      }

      @if (routePath()) {
        <path class="route" [attr.d]="routePath()" [attr.stroke-width]="font() * 0.14"
              [attr.marker-mid]="storyStep() === null ? 'url(#arrow-' + map().id + ')' : null"
              [attr.marker-end]="storyStep() === null ? 'url(#arrow-' + map().id + ')' : null" />
      }

      <!-- De onde saiu quem levou a mensagem (mapas da história da Igreja) -->
      @for (o of origins(); track o.key) {
        <path class="origin" [class.on]="o.on" [attr.d]="o.d" [attr.stroke-width]="font() * (o.on ? 0.16 : 0.1)"
              [attr.stroke-dasharray]="font() * 0.4 + ' ' + font() * 0.25" [attr.marker-end]="o.on ? 'url(#arrow-' + map().id + ')' : null" />
      }

      <!-- Distância do território destacado até o ponto de referência (o templo) -->
      @for (m of measures(); track m.key) {
        <path class="measure" [attr.d]="m.d" [attr.stroke-width]="font() * 0.13" [attr.stroke-dasharray]="font() * 0.35 + ' ' + font() * 0.25" />
        <text class="measure-label" [attr.x]="m.lx" [attr.y]="m.ly" [attr.font-size]="font() * 0.85">{{ m.label }}</text>
      }

      @if (traveler(); as t) {
        <circle class="pulse" [attr.cx]="t.x" [attr.cy]="t.y" [attr.r]="font() * 1.1" />
      }

      @for (p of points(); track p.id) {
        <g class="place" [class.active]="p.active" [class.uncertain]="p.uncertain" [class.dim]="p.dim"
           (click)="select(p.firstStep)">
          @if (p.numbers && !compact()) {
            <rect [attr.x]="p.x - p.mw / 2" [attr.y]="p.y - p.r" [attr.width]="p.mw" [attr.height]="p.r * 2" [attr.rx]="p.r"
                  [attr.stroke-width]="font() * 0.12" />
            <text class="num" [attr.x]="p.x" [attr.y]="p.y + font() * 0.27" text-anchor="middle" [attr.font-size]="font() * 0.74">{{ p.numbers }}</text>
          } @else {
            <circle [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="font() * (compact() ? 0.45 : 0.3)" [attr.stroke-width]="font() * 0.12" />
          }
          @if (!compact() && (p.showLabel || p.active)) {
            <text class="label" [attr.x]="p.lx" [attr.y]="p.ly" [attr.text-anchor]="p.anchor" [attr.font-size]="font()">
              {{ p.name }}{{ p.uncertain ? ' (?)' : '' }}
            </text>
          }
        </g>
      }

      @if (landmark(); as lm) {
        <g class="landmark" role="img" [attr.aria-label]="lm.name">
          <path [attr.d]="lm.icon" [attr.stroke-width]="font() * 0.1" />
          @if (!compact()) {
            <text [attr.x]="lm.x - font() * 0.95" [attr.y]="lm.y + font() * 0.35" text-anchor="end" [attr.font-size]="font() * 0.9">{{ lm.name }}</text>
          }
        </g>
      }

      @if (scaleBar(); as sb) {
        <g class="scale">
          <rect [attr.x]="sb.x - font() * 0.4" [attr.y]="sb.y - font() * 1.25" [attr.width]="sb.w + font() * 0.8" [attr.height]="font() * 1.75" [attr.rx]="font() * 0.3" />
          <path [attr.d]="'M' + sb.x + ',' + (sb.y - font() * 0.25) + 'v' + font() * 0.25 + 'h' + sb.w + 'v-' + font() * 0.25" [attr.stroke-width]="font() * 0.1" />
          <text [attr.x]="sb.x + sb.w / 2" [attr.y]="sb.y - font() * 0.45" [attr.font-size]="font() * 0.72">{{ sb.label }}</text>
        </g>
      }

      <!-- O viajante só aparece em movimento; parado, fica o brilho atrás do marcador -->
      @if (moving(); as t) {
        <circle class="traveler" [attr.cx]="t.x" [attr.cy]="t.y" [attr.r]="font() * 0.38" [attr.stroke-width]="font() * 0.14" />
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; height: auto; user-select: none; -webkit-user-select: none; }
    svg.story { height: 100%; }
    svg.interactive { touch-action: none; cursor: grab; }
    svg.interactive:active { cursor: grabbing; }
    .sea { fill: var(--map-sea); }
    .land { fill: var(--map-land); stroke: var(--map-coast); stroke-linejoin: round; }
    .lake { fill: var(--map-sea); stroke: var(--map-coast); }
    .river { fill: none; stroke: var(--map-river); stroke-linecap: round; stroke-linejoin: round; }
    .region { fill: var(--map-region); font-family: 'Source Serif 4', serif; font-style: italic; letter-spacing: .08em; text-anchor: middle; text-transform: uppercase; pointer-events: none; }
    .route { fill: none; stroke: var(--mat-sys-primary); stroke-linecap: round; stroke-linejoin: round; opacity: .85; pointer-events: none; }
    .compact .route { stroke-width: 5; }
    .arrow { fill: var(--mat-sys-primary); }
    .place { cursor: pointer; transition: opacity 400ms; }
    .place.dim { opacity: .28; }
    .place circle { fill: var(--map-ink); stroke: var(--map-land); }
    .place.uncertain circle { fill: var(--map-land); stroke: var(--map-ink); stroke-dasharray: 4 3; }
    .place rect { fill: var(--accent-gold); stroke: var(--map-land); }
    .place.uncertain rect { fill: var(--map-land); stroke: var(--accent-gold); stroke-dasharray: 6 4; }
    .place.active rect { fill: var(--mat-sys-primary); stroke: var(--map-land); stroke-dasharray: none; }
    .place .num { fill: var(--map-badge-text); font-family: Inter, sans-serif; font-weight: 700; pointer-events: none; }
    .place.uncertain .num { fill: var(--accent-gold); }
    .place.active .num { fill: var(--mat-sys-on-primary); }
    .place .label {
      fill: var(--map-ink); font-family: Inter, sans-serif; font-weight: 600; pointer-events: none;
      paint-order: stroke; stroke: var(--map-land); stroke-width: .28em; stroke-linejoin: round;
    }
    .place.active .label { fill: var(--mat-sys-primary); }
    .origin { fill: none; stroke: var(--accent-gold); stroke-linecap: round; opacity: .35; pointer-events: none; }
    .origin.on { opacity: 1; }
    .measure { fill: none; stroke: var(--mat-sys-primary); stroke-linecap: round; pointer-events: none; }
    .measure-label {
      fill: var(--mat-sys-primary); font-family: Inter, sans-serif; font-weight: 700; text-anchor: middle; pointer-events: none;
      paint-order: stroke; stroke: var(--map-land); stroke-width: .3em; stroke-linejoin: round;
    }
    .landmark { pointer-events: none; }
    .landmark path { fill: var(--accent-gold); stroke: var(--map-land); stroke-linejoin: round; }
    .landmark text {
      fill: var(--map-ink); font-family: Inter, sans-serif; font-weight: 700;
      paint-order: stroke; stroke: var(--map-land); stroke-width: .3em; stroke-linejoin: round;
    }
    .traveler { fill: var(--accent-gold); stroke: var(--map-land); pointer-events: none; }
    .pulse {
      pointer-events: none;
      fill: var(--accent-gold); opacity: .35; transform-box: fill-box; transform-origin: center;
      animation: pulse 1.6s ease-out infinite;
    }
    .power { fill-opacity: .16; stroke-opacity: .75; stroke-linejoin: round; pointer-events: none; }
    .power.territory { fill-opacity: .3; stroke-opacity: .9; transition: fill-opacity .3s, stroke-opacity .3s; }
    .power.territory.dim { fill-opacity: .07; stroke-opacity: .3; }
    .power.territory.focus { fill-opacity: .5; stroke-opacity: 1; }
    .power-label {
      font-family: Inter, sans-serif; font-weight: 700; text-anchor: middle; text-transform: uppercase; letter-spacing: .04em;
      paint-order: stroke; stroke: var(--map-land); stroke-width: .3em; stroke-linejoin: round; pointer-events: none;
    }
    .people { fill: var(--map-region); font-family: 'Source Serif 4', serif; font-style: italic; text-anchor: middle; pointer-events: none; }
    .water { fill: var(--map-river); font-family: 'Source Serif 4', serif; font-style: italic; text-anchor: middle; pointer-events: none; filter: brightness(.8); }
    .border { fill: none; stroke: var(--map-ink); stroke-opacity: .45; pointer-events: none; }
    .modern { fill: var(--map-ink); fill-opacity: .55; font-family: Inter, sans-serif; font-weight: 600; text-anchor: middle; letter-spacing: .06em; pointer-events: none; }
    .nearby { pointer-events: none; opacity: .8; }
    .nearby circle, .nearby path { fill: var(--map-region); }
    .nearby text { fill: var(--map-ink); fill-opacity: .75; font-family: Inter, sans-serif; paint-order: stroke; stroke: var(--map-land); stroke-width: .25em; }
    .scale { pointer-events: none; }
    .scale rect { fill: var(--map-land); fill-opacity: .85; }
    .scale path { fill: none; stroke: var(--map-ink); }
    .scale text { fill: var(--map-ink); font-family: Inter, sans-serif; font-weight: 600; text-anchor: middle; }
    @keyframes pulse { from { transform: scale(.4); opacity: .5; } to { transform: scale(1.6); opacity: 0; } }
  `,
})
export class BibleMapView {
  readonly map = input.required<BibleMap>();
  /** Versão reduzida (pré-visualização): sem nomes nem números. */
  readonly compact = input(false);
  /** Arrastar, pinça e zoom. */
  readonly interactive = input(false);
  /** Modo história: etapa atual (a câmera e o viajante a acompanham). */
  readonly storyStep = input<number | null>(null);
  /** Etapa destacada (índice) — sincronizada com a lista de etapas. */
  readonly activeStep = model<number | null>(null);
  /** Reinos, impérios e povos da época (atlas). */
  readonly era = input<Era | null>(null);
  /** Cidades, montes, mares e rios ao redor (índice do atlas). */
  readonly nearby = input(false);
  /** Fronteiras e nomes dos países de hoje. */
  readonly modern = input(false);
  /** Território destacado (id do território ou do grupo): os outros ficam apagados. */
  readonly highlight = input<string | null>(null);

  protected readonly clipId = `land-clip-${++instances}`;

  private readonly http = inject(HttpClient);
  private readonly hostSize = signal({ width: 360, height: 240 });

  protected readonly view = computed(() => projector(this.map().bounds));
  private readonly full = computed<Box>(() => ({ x: 0, y: 0, w: this.view().width, h: this.view().height }));

  /** Câmera atual (viewBox). Null = mapa inteiro. */
  private readonly cam = signal<Box | null>(null);
  protected readonly camera = computed(() => this.cam() ?? this.full());
  readonly zoomed = computed(() => !!this.cam() && this.cam()!.w < this.full().w * 0.98);

  /** Viagem animada entre duas etapas (modo história). */
  private readonly travel = signal<{ from: number; to: number; t: number } | null>(null);

  protected readonly geography = toSignal(
    toObservable(this.map).pipe(
      switchMap((map) => {
        const cached = geographyCache.get(map.id);
        if (cached) return of(cached);
        return this.http.get<Geography>(`maps/${map.id}.json`).pipe(
          tap((geo) => geographyCache.set(map.id, geo)),
          catchError(() => of(null)),
        );
      }),
    ),
  );

  /** Tamanho da letra em unidades do SVG: ~13px na tela em qualquer zoom. */
  protected readonly font = computed(() => (13 * this.camera().w) / Math.max(200, this.hostSize().width));

  private readonly placeById = computed(() => new Map(this.map().places.map((p) => [p.id, p])));

  /** Coordenadas de cada etapa no SVG. */
  private readonly stepPoints = computed<Point[]>(() => {
    const v = this.view();
    return this.map().steps.map((s) => {
      const p = this.placeById().get(s.place)!;
      return { x: v.x(p.lon), y: v.y(p.lat) };
    });
  });

  /** Etapa até onde a história já chegou (durante a viagem, ainda a anterior). */
  private readonly reached = computed(() => {
    const step = this.storyStep();
    const travel = this.travel();
    if (step === null) return null;
    return travel && travel.t < 1 ? travel.from : step;
  });

  protected readonly traveler = computed<Point | null>(() => {
    if (this.storyStep() === null || this.map().route === false) return null;
    const pts = this.stepPoints();
    const travel = this.travel();
    if (travel) {
      const a = pts[travel.from];
      const b = pts[travel.to];
      const t = ease(travel.t);
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
    return pts[this.storyStep()!] ?? null;
  });

  protected readonly moving = computed(() => (this.travel() ? this.traveler() : null));

  protected readonly routePath = computed(() => {
    const map = this.map();
    if (map.route === false) return '';
    const pts = this.stepPoints();
    const story = this.storyStep();
    let visible = pts;
    if (story !== null) {
      const travel = this.travel();
      visible = pts.slice(0, (travel ? travel.from : story) + 1);
      const t = this.traveler();
      if (travel && t) visible = [...visible, t];
    }
    return visible.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');
  });

  protected readonly regions = computed(() => {
    const v = this.view();
    const close = this.camera().w < this.full().w * 0.08;
    return this.map()
      .places.filter((p) => p.region && (!p.detail || close))
      .map((p) => ({ id: p.id, name: p.name, x: v.x(p.lon), y: v.y(p.lat) }));
  });

  protected readonly points = computed(() => {
    const map = this.map();
    const v = this.view();
    const f = this.font();
    const cam = this.camera();
    const active = this.storyStep() ?? this.activeStep();
    const reached = this.reached();

    const raw = map.places
      .filter((p) => !p.region)
      .map((p) => {
        const steps = map.steps.map((s, i) => (s.place === p.id ? i : -1)).filter((i) => i >= 0);
        const numbers = formatSteps(steps);
        const r = numbers ? f * 0.62 : f * 0.3;
        return {
          place: p, steps, numbers, r,
          x: v.x(p.lon), y: v.y(p.lat),
          // Marcador numerado: círculo, ou pílula se o lugar aparece em mais de uma etapa
          mw: Math.max(r * 2, f * (0.35 + numbers.length * 0.46)),
          // No modo história, lugares ainda não alcançados ficam apagados
          dim: reached !== null && steps.length > 0 && steps[0] > reached,
        };
      });

    // Marcadores que se encostam viram um só ("Jerusalém 22–29"); ao aproximar, eles se separam
    type Member = (typeof raw)[number];
    type Group = { members: Member[]; box: [number, number, number, number] };
    const pad = f * 0.15;
    const boxOf = (m: Member): Group['box'] => [m.x - m.mw / 2 - pad, m.y - m.r - pad, m.x + m.mw / 2 + pad, m.y + m.r + pad];
    const touch = (a: Group['box'], b: Group['box']) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    const pillWidth = (numbers: string, r: number) => Math.max(r * 2, f * (0.35 + numbers.length * 0.46));
    const close = cam.w < this.full().w * 0.1;

    const merge = (members: Member[]) => {
      const first = members[0];
      if (members.length === 1) return first;
      const steps = [...new Set(members.flatMap((m) => m.steps))].sort((a, b) => a - b);
      let numbers = formatSteps(steps);
      if (numbers.length > 9) numbers = `${steps.length} etapas`;
      const r = steps.length ? f * 0.62 : f * 0.3;
      const named = members.map((m) => m.place.name);
      const counts = new Map<string, number>();
      members.forEach((m) => m.place.group && counts.set(m.place.group, (counts.get(m.place.group) ?? 0) + 1));
      const main = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const allSame = !!main && counts.size === 1 && counts.get(main) === members.length;
      // De longe: nome do grupo ("Jerusalém", "Jerusalém e região"); de perto: os nomes dos lugares
      const name = !close && main ? (allSame ? main : `${main} e região`)
        : members.length === 2 ? `${named[0]} e ${named[1]}` : `${named[0]} +${members.length - 1}`;
      return {
        ...first,
        place: { ...first.place, id: members.map((m) => m.place.id).join('+'), name, uncertain: members.every((m) => m.place.uncertain) },
        steps, numbers, r, mw: pillWidth(numbers, r),
        dim: members.every((m) => m.dim),
      };
    };

    let groups: Group[] = [];
    for (const m of [...raw].sort((a, b) => (a.steps[0] ?? 99) - (b.steps[0] ?? 99))) {
      const near = groups.find((g) => touch(g.box, boxOf(m)));
      if (near) near.members.push(m);
      else groups.push({ members: [m], box: boxOf(m) });
    }
    // Um grupo maior pode passar a encostar em outro: junta até estabilizar
    for (let pass = 0; pass < 4; pass++) {
      groups.forEach((g) => (g.box = boxOf(merge(g.members) as Member)));
      const next: Group[] = [];
      for (const g of groups) {
        const near = next.find((n) => touch(n.box, g.box));
        if (near) {
          near.members.push(...g.members);
          near.box = boxOf(merge(near.members) as Member);
        } else next.push(g);
      }
      if (next.length === groups.length) break;
      groups = next;
    }
    const places = groups.map((g) => merge(g.members));

    // Os marcadores ocupam espaço: os nomes não podem cobri-los
    type Rect = [number, number, number, number];
    const overlaps = (a: Rect, b: Rect) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    const markers: Rect[] = places.map((m) => [m.x - m.mw / 2, m.y - m.r, m.x + m.mw / 2, m.y + m.r]);
    // O ponto de referência (o templo) e o seu nome também ocupam espaço
    const lm = this.map().landmark;
    if (lm && !this.compact()) {
      const lx = v.x(lm.lon), ly = v.y(lm.lat);
      markers.push([lx - f * 0.8, ly - f * 0.8, lx + f * 0.8, ly + f * 0.8], [lx - f * 0.95 - lm.name.length * f * 0.58, ly - f * 0.6, lx - f * 0.8, ly + f * 0.45]);
    }
    const labels: Rect[] = [];

    // Prioridade: etapa atual, lugares das etapas (na ordem), depois os demais
    const priority = (i: number) => {
      const steps = places[i].steps;
      if (active !== null && steps.includes(active)) return -1;
      return steps[0] ?? 99;
    };
    const order = [...places.keys()].sort((a, b) => priority(a) - priority(b));
    const result = new Array(places.length);

    for (const i of order) {
      const m = places[i];
      const text = m.place.name + (m.place.uncertain ? ' (?)' : '');
      const w = text.length * f * 0.56;
      const gap = m.mw / 2 + f * 0.3;
      const preferred = m.place.label ?? 'r';
      const sides = [...new Set<LabelSide>([preferred, 'r', 'l', 't', 'b'])];

      let chosen: { lx: number; ly: number; anchor: string; box: Rect } | null = null;
      if (!m.dim) {
        for (const side of sides) {
          const [lx, ly, anchor] =
            side === 'r' ? [m.x + gap, m.y + f * 0.35, 'start'] :
            side === 'l' ? [m.x - gap, m.y + f * 0.35, 'end'] :
            side === 't' ? [m.x, m.y - m.r - f * 0.35, 'middle'] :
            [m.x, m.y + m.r + f * 1.05, 'middle'];
          const x0 = anchor === 'start' ? lx : anchor === 'end' ? lx - w : lx - w / 2;
          const box: Rect = [x0, ly - f * 0.82, x0 + w, ly + f * 0.25];
          const inside = box[0] >= cam.x && box[2] <= cam.x + cam.w && box[1] >= cam.y && box[3] <= cam.y + cam.h;
          const free = inside && !labels.some((b) => overlaps(b, box)) && !markers.some((b, j) => j !== i && overlaps(b, box));
          if (free) {
            chosen = { lx, ly, anchor, box };
            break;
          }
        }
      }
      if (!chosen && !m.dim && active !== null && m.steps.includes(active)) {
        // A etapa atual sempre mostra o nome, mesmo que encoste em outro
        const side = sides[0];
        const [lx, ly, anchor] =
          side === 'r' ? [m.x + gap, m.y + f * 0.35, 'start'] :
          side === 'l' ? [m.x - gap, m.y + f * 0.35, 'end'] :
          side === 't' ? [m.x, m.y - m.r - f * 0.35, 'middle'] :
          [m.x, m.y + m.r + f * 1.05, 'middle'];
        chosen = { lx, ly, anchor, box: [0, 0, 0, 0] };
      }
      if (chosen) labels.push(chosen.box);

      result[i] = {
        id: m.place.id, name: m.place.name, uncertain: !!m.place.uncertain, dim: m.dim,
        x: m.x, y: m.y, r: m.r, mw: m.mw, numbers: m.numbers,
        // Sem espaço: o nome fica oculto até aproximar (o número continua visível)
        showLabel: !!chosen, lx: chosen?.lx ?? 0, ly: chosen?.ly ?? 0, anchor: chosen?.anchor ?? 'start',
        firstStep: m.steps[0] ?? null,
        active: active !== null && m.steps.includes(active),
      };
    }
    return result as {
      id: string; name: string; uncertain: boolean; dim: boolean; x: number; y: number; r: number; mw: number;
      numbers: string; showLabel: boolean; lx: number; ly: number; anchor: string; firstStep: number | null; active: boolean;
    }[];
  });

  /** Territórios do mapa e polígonos dos reinos da época, já projetados. */
  protected readonly powers = computed(() => {
    const v = this.view();
    const project = (polygon: [number, number][]) => polygon.map(([lon, lat]) => [v.x(lon), v.y(lat)]);
    const path = (pts: number[][]) => `M${pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L')}Z`;
    const focus = this.highlight();
    const territories = (this.map().territories ?? []).map((t) => {
      const on = !!focus && (t.id === focus || t.tribe === focus);
      return { key: `t-${t.id}`, name: t.name, color: t.color, d: path(project(t.polygon)), lx: 0, ly: 0, territory: true, focus: on, dim: !!focus && !on };
    });
    const era = this.era();
    if (!era || this.compact()) return territories;
    const [lon0, lat0, lon1, lat1] = this.map().bounds;
    // Um império que cobre o mapa inteiro não ajuda a ver nada: fica só na legenda
    const coversAll = (poly: [number, number][]) => {
      const inside = (x: number, y: number) => {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, yi] = poly[i];
          const [xj, yj] = poly[j];
          if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
        }
        return c;
      };
      // Cobre o centro e pelo menos três cantos: na prática, é o fundo do mapa inteiro
      const corners = [inside(lon0, lat0), inside(lon1, lat1), inside(lon0, lat1), inside(lon1, lat0)].filter(Boolean).length;
      return inside((lon0 + lon1) / 2, (lat0 + lat1) / 2) && corners >= 3;
    };
    return [
      ...territories,
      ...era.powers.filter((p) => !coversAll(p.polygon)).map((p) => {
        const pts = project(p.polygon);
        const [lx, ly] = p.label ? [v.x(p.label[0]), v.y(p.label[1])] : [pts.reduce((s, q) => s + q[0], 0) / pts.length, pts.reduce((s, q) => s + q[1], 0) / pts.length];
        return { key: `p-${p.name}`, name: p.name, color: p.color, d: path(pts), lx, ly, territory: false, focus: false, dim: false };
      }),
    ];
  });

  /** Ponto de referência (o templo), com um pequeno desenho de templo: frontão, colunas e base. */
  protected readonly landmark = computed(() => {
    const lm = this.map().landmark;
    if (!lm) return null;
    const v = this.view();
    const f = this.font() * (this.compact() ? 1.4 : 1);
    const x = v.x(lm.lon);
    const y = v.y(lm.lat);
    const w = f * 0.68;
    const icon =
      `M${x - w},${y - w * 0.35}L${x},${y - w * 1.1}L${x + w},${y - w * 0.35}Z` +
      [-0.75, -0.25, 0.25, 0.75].map((c) => `M${x + w * c - w * 0.12},${y - w * 0.3}h${w * 0.24}v${w * 0.95}h-${w * 0.24}Z`).join('') +
      `M${x - w * 1.1},${y + w * 0.7}h${w * 2.2}v${w * 0.3}h-${w * 2.2}Z`;
    return { name: lm.name, x, y, icon };
  });

  /** Linhas da origem de cada etapa (de onde saiu quem levou a mensagem), curvas; a etapa ativa fica em destaque. */
  protected readonly origins = computed(() => {
    if (this.compact()) return [];
    const map = this.map();
    const v = this.view();
    const active = this.storyStep() ?? this.activeStep();
    const place = (id: string) => map.places.find((p) => p.id === id);
    return map.steps.flatMap((s, i) => {
      const a = s.from ? place(s.from) : undefined;
      const b = place(s.place);
      // Na jornada, só a linha da etapa atual; no mapa, todas (a escolhida em destaque)
      if (!a || !b || (this.storyStep() !== null && i !== active)) return [];
      const x0 = v.x(a.lon), y0 = v.y(a.lat), x1 = v.x(b.lon), y1 = v.y(b.lat);
      const cx = (x0 + x1) / 2 - (y1 - y0) * 0.18, cy = (y0 + y1) / 2 + (x1 - x0) * 0.18;
      return [{ key: `${i}`, on: i === active, d: `M${x0.toFixed(1)},${y0.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}` }];
    });
  });

  /** Linhas do território destacado até o ponto de referência, com a distância em linha reta. */
  protected readonly measures = computed(() => {
    const lm = this.map().landmark;
    const focus = this.highlight();
    if (!lm || !focus || this.compact()) return [];
    const v = this.view();
    return (this.map().territories ?? [])
      .filter((t) => t.center && (t.id === focus || t.tribe === focus))
      .map((t) => {
        const [lon, lat] = t.center!;
        const x0 = v.x(lon), y0 = v.y(lat), x1 = v.x(lm.lon), y1 = v.y(lm.lat);
        return {
          key: t.id,
          d: `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`,
          lx: (x0 + x1) / 2,
          ly: (y0 + y1) / 2 - this.font() * 0.35,
          label: formatKm(distanceKm({ lon, lat }, lm)),
        };
      });
  });

  /**
   * Nomes das camadas extras (reinos, povos, países de hoje, lugares ao redor), posicionados sem
   * cobrir os lugares e nomes principais do mapa. Os de menor prioridade somem quando não cabem.
   */
  protected readonly layerLabels = computed(() => {
    if (this.compact()) return [];
    const f = this.font();
    const cam = this.camera();
    const v = this.view();
    type Rect = [number, number, number, number];
    const taken: Rect[] = [];
    for (const p of this.points()) {
      taken.push([p.x - p.mw / 2, p.y - p.r, p.x + p.mw / 2, p.y + p.r]);
      if (p.showLabel || p.active) {
        const w = (p.name.length + (p.uncertain ? 4 : 0)) * f * 0.56;
        const x0 = p.anchor === 'start' ? p.lx : p.anchor === 'end' ? p.lx - w : p.lx - w / 2;
        taken.push([x0, p.ly - f * 0.82, x0 + w, p.ly + f * 0.25]);
      }
    }
    const sb = this.scaleBar();
    if (sb) taken.push([sb.x - f * 0.5, sb.y - f * 1.4, sb.x + sb.w + f * 0.5, sb.y + f * 0.6]);
    for (const r of this.regions()) {
      const w = r.name.length * f * 0.95 * 0.8;
      taken.push([r.x - w / 2, r.y - f * 0.9, r.x + w / 2, r.y + f * 0.2]);
    }
    const free = (b: Rect) =>
      b[0] >= cam.x && b[2] <= cam.x + cam.w && b[1] >= cam.y && b[3] <= cam.y + cam.h &&
      !taken.some((t) => b[0] < t[2] && b[2] > t[0] && b[1] < t[3] && b[3] > t[1]);

    const out: { key: string; kind: 'power' | 'people' | 'modern' | GazetteerKind; text: string; x: number; y: number; px: number; py: number; color?: string }[] = [];
    const tryCentered = (key: string, kind: (typeof out)[number]['kind'], text: string, x: number, y: number, size: number, color?: string) => {
      const w = text.length * f * size * 0.6;
      const box: Rect = [x - w / 2, y - f * size, x + w / 2, y + f * size * 0.25];
      if (free(box)) {
        taken.push(box);
        out.push({ key, kind, text, x, y, px: x, py: y, color });
      }
    };

    // Os territórios não levam nome: o lugar numerado de cada um já diz qual é
    for (const pw of this.powers()) if (!pw.territory) tryCentered(`pw-${pw.name}`, 'power', pw.name, pw.lx, pw.ly, 0.82, pw.color);
    for (const p of this.era()?.peoples ?? []) tryCentered(`pe-${p.name}`, 'people', p.name, v.x(p.lon), v.y(p.lat), 0.8);
    if (this.modern()) {
      for (const c of MODERN_COUNTRIES) tryCentered(`mo-${c.name}`, 'modern', c.name.toUpperCase(), v.x(c.lon), v.y(c.lat), 0.85);
    }
    if (this.nearby()) {
      const year = this.era()?.year;
      const own = this.map().places.map((p) => ({ x: v.x(p.lon), y: v.y(p.lat) }));
      // Águas e desertos primeiro (são grandes), depois montes e cidades
      const order: GazetteerKind[] = ['agua', 'rio', 'deserto', 'monte', 'cidade'];
      for (const kind of order) {
        for (const g of GAZETTEER) {
          if (g.kind !== kind || (year !== undefined && g.from !== undefined && g.from > year)) continue;
          const x = v.x(g.lon);
          const y = v.y(g.lat);
          // Lugares que já estão no mapa não se repetem
          if (own.some((o) => Math.hypot(o.x - x, o.y - y) < f * 1.4)) continue;
          if (kind === 'agua' || kind === 'rio' || kind === 'deserto') {
            tryCentered(`gz-${g.name}`, kind, g.name, x, y, kind === 'agua' ? 0.78 : 0.72);
            continue;
          }
          const w = g.name.length * f * 0.74 * 0.58;
          const dot: Rect = [x - f * 0.3, y - f * 0.3, x + f * 0.3, y + f * 0.3];
          const label: Rect = [x + f * 0.45, y - f * 0.55, x + f * 0.45 + w, y + f * 0.25];
          if (free(dot) && free(label)) {
            taken.push(dot, label);
            out.push({ key: `gz-${g.name}`, kind, text: g.name, x: x + f * 0.45, y: y + f * 0.22, px: x, py: y });
          }
        }
      }
    }
    return out;
  });

  /** Escala gráfica (km), no canto inferior esquerdo da tela. */
  protected readonly scaleBar = computed(() => {
    if (this.compact()) return null;
    const [, latMin, , latMax] = this.map().bounds;
    const unitsPerKm = this.view().height / (latMax - latMin) / 111.32;
    const cam = this.camera();
    const f = this.font();
    const target = (cam.w * 0.22) / unitsPerKm;
    const km = [...NICE_KM].reverse().find((n) => n <= target) ?? 1;
    return { x: cam.x + f * 1.1, y: cam.y + cam.h - f * 0.7, w: km * unitsPerKm, label: `${km} km` };
  });

  private frame = 0;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly pointers = new Map<number, Point>();
  private gesture: { box: Box; pointers: Map<number, Point>; moved: boolean } | null = null;

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(([entry]) =>
        this.hostSize.set({ width: Math.max(200, entry.contentRect.width), height: Math.max(150, entry.contentRect.height) }),
      );
      observer.observe(this.host.nativeElement);
      destroy.onDestroy(() => observer.disconnect());
    });
    destroy.onDestroy(() => cancelAnimationFrame(this.frame));

    // Modo história: anima a câmera (e o viajante) a cada mudança de etapa
    let previous: number | null = null;
    effect(() => {
      const step = this.storyStep();
      const size = this.hostSize();
      untracked(() => {
        if (step === null) {
          previous = null;
          this.travel.set(null);
          return;
        }
        const pts = this.stepPoints();
        const forward = previous !== null && step === previous + 1 && this.map().route !== false;
        const from = previous;
        previous = step;
        const zoom = this.map().zoom ?? 0.32;
        const target = this.fitBox(from !== null && forward ? [pts[from], pts[step]] : [pts[step]], size, zoom);
        const startBox = this.cam() ?? this.fitBox([pts[step]], size, Math.max(zoom * 3, 0.9));
        const distance = forward ? Math.hypot(pts[step].x - pts[from!].x, pts[step].y - pts[from!].y) : 0;
        const duration = forward ? Math.min(2600, 1100 + distance * 2.2) : 900;
        this.animate(
          duration,
          (t) => {
            this.cam.set(this.lerpBox(startBox, target, ease(t)));
            this.travel.set(forward ? { from: from!, to: step, t } : null);
          },
          () => this.travel.set(null),
        );
      });
    });
  }

  protected select(step: number | null): void {
    if (step !== null && !this.gesture?.moved) this.activeStep.set(step);
  }

  /** Volta a mostrar o mapa inteiro. */
  reset(): void {
    const start = this.camera();
    this.animate(500, (t) => this.cam.set(this.lerpBox(start, this.full(), ease(t))), () => this.cam.set(null));
  }

  // ---------- Gestos (arrastar, pinça, roda do mouse, toque duplo) ----------

  protected onPointerDown(e: PointerEvent): void {
    if (!this.interactive()) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.gesture = { box: this.camera(), pointers: new Map(this.pointers), moved: false };
  }

  protected onPointerMove(e: PointerEvent): void {
    if (!this.interactive() || !this.pointers.has(e.pointerId) || !this.gesture) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const start = this.gesture.box;
    const units = start.w / this.hostSize().width;
    const before = [...this.gesture.pointers.values()];
    const now = [...this.pointers.values()];

    if (now.length === 1 && before.length === 1) {
      const dx = now[0].x - before[0].x;
      const dy = now[0].y - before[0].y;
      if (Math.hypot(dx, dy) > 4) {
        if (!this.gesture.moved) (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        this.gesture.moved = true;
      }
      if (this.gesture.moved) this.cam.set(this.clamp({ ...start, x: start.x - dx * units, y: start.y - dy * units }));
    } else if (now.length >= 2 && before.length >= 2) {
      this.gesture.moved = true;
      const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
      const scale = dist(before[0], before[1]) / Math.max(1, dist(now[0], now[1]));
      const mid = { x: (now[0].x + now[1].x) / 2, y: (now[0].y + now[1].y) / 2 };
      this.cam.set(this.zoomAt(start, scale, this.toMap(mid, start)));
    }
  }

  protected onPointerUp(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    if (this.gesture) this.gesture = { box: this.camera(), pointers: new Map(this.pointers), moved: this.gesture.moved };
    if (!this.pointers.size) setTimeout(() => (this.gesture = null));
  }

  protected onWheel(e: WheelEvent): void {
    if (!this.interactive()) return;
    e.preventDefault();
    const box = this.camera();
    this.cam.set(this.zoomAt(box, Math.pow(1.0015, e.deltaY), this.toMap({ x: e.clientX, y: e.clientY }, box)));
  }

  protected onDoubleClick(e: MouseEvent): void {
    if (!this.interactive()) return;
    const start = this.camera();
    const target = this.zoomAt(start, 0.5, this.toMap({ x: e.clientX, y: e.clientY }, start));
    this.animate(350, (t) => this.cam.set(this.lerpBox(start, target, ease(t))));
  }

  // ---------- Câmera ----------

  private toMap(screen: Point, box: Box): Point {
    const rect = this.host.nativeElement.getBoundingClientRect();
    return { x: box.x + ((screen.x - rect.left) / rect.width) * box.w, y: box.y + ((screen.y - rect.top) / rect.height) * box.h };
  }

  private zoomAt(box: Box, scale: number, at: Point): Box {
    const full = this.full();
    const w = Math.min(full.w, Math.max(full.w * Math.min(0.12, this.map().zoom ?? 0.12), box.w * scale));
    const k = w / box.w;
    return this.clamp({ x: at.x - (at.x - box.x) * k, y: at.y - (at.y - box.y) * k, w, h: box.h * k });
  }

  /** Mantém a câmera dentro do mapa. */
  private clamp(box: Box): Box {
    const full = this.full();
    const x = box.w >= full.w ? (full.w - box.w) / 2 : Math.min(full.w - box.w, Math.max(0, box.x));
    const y = box.h >= full.h ? (full.h - box.h) / 2 : Math.min(full.h - box.h, Math.max(0, box.y));
    return { ...box, x, y };
  }

  /** Enquadra pontos com folga, na proporção da tela. */
  private fitBox(points: Point[], size: { width: number; height: number }, minFraction = 0.32): Box {
    const full = this.full();
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const aspect = size.width / size.height;
    let w = Math.max((Math.max(...xs) - Math.min(...xs)) * 1.6, full.w * minFraction);
    let h = Math.max((Math.max(...ys) - Math.min(...ys)) * 1.6, w / aspect);
    w = Math.max(w, h * aspect);
    h = w / aspect;
    // Não afasta além do necessário para ver o mapa inteiro
    const maxW = Math.max(full.w, full.h * aspect);
    if (w > maxW) {
      w = maxW;
      h = w / aspect;
    }
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  }

  private lerpBox(a: Box, b: Box, t: number): Box {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) };
  }

  private animate(duration: number, step: (t: number) => void, done?: () => void): void {
    cancelAnimationFrame(this.frame);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      step(t);
      if (t < 1) this.frame = requestAnimationFrame(tick);
      else done?.();
    };
    this.frame = requestAnimationFrame(tick);
  }
}
