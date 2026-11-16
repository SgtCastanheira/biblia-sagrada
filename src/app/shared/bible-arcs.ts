import { afterNextRender, Component, DestroyRef, computed, effect, ElementRef, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { chapterAt, ConnectionGraph, spanLabel, type LevelInfo, type Span } from '../core/bible-connections';
import { saveLocal } from '../core/storage.service';
import { ArcsLayout, DensityPainter, drawAxis, drawBaseArcs, drawMarker, drawTravelPulse, FocusPainter, indexAt, layoutFor, xOf } from './arcs-draw';

/** Quantos arcos o desenho de fundo pinta por quadro, para a tela não travar quando são muitos. */
const CHUNK = 5000;
const OPENING_KEY = 'biblia.conexoes.abertura';

/** Uma escolha na lista ou no caminho, distinta de arrastar pela linha ou trocar um seletor. */
export interface ArcJourney { from: number; to: number; id: number }

/**
 * O desenho de “A Bíblia Conectada” na tela: duas camadas de canvas. A de baixo traz a visão geral (todas as ligações do nível
 * escolhido, a faixa dos livros) e é pintada aos poucos; a de cima traz só o que está em foco, que cresce a partir do capítulo
 * escolhido. Com algo em foco, a de baixo se apaga. Arrastar o dedo (ou o mouse) pela linha escolhe o capítulo.
 */
@Component({
  selector: 'app-bible-arcs',
  template: `
    <div class="frame">
    <div #box class="arcs" [class.focus]="!!selected()" [class.opening]="opening()" [class.pulsing]="traveling()" role="img" [attr.aria-label]="description()">
      <canvas #base class="base" aria-hidden="true"></canvas>
      <canvas
        #top
        class="top"
        aria-hidden="true"
        (pointerdown)="down($event)"
        (pointermove)="move($event)"
        (pointerup)="up($event)"
        (pointercancel)="cancel()"
        (pointerleave)="leave($event)"
      ></canvas>
      @if (busy()) { <span class="busy" role="status">Desenhando as ligações…</span> }
      @if (tip(); as t) { <span class="tip" [style.left.px]="t.x" [style.top.px]="t.y">{{ t.label }}</span> }
      @if (beacon(); as point) { <span class="beacon" aria-hidden="true" [style.left.px]="point.x" [style.top.px]="point.y"></span> }
      @if (opening()) { <span class="weft" aria-hidden="true"></span> }
    </div>
    @if (opening()) {
      <button class="skip" type="button" (click)="finishOpening()">Pular abertura</button>
    }
    </div>
  `,
  styles: `
    :host { display: block; }
    .frame { position: relative; }
    .arcs { position: relative; width: 100%; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
    .base { transition: opacity .35s ease; }
    .arcs.focus .base { opacity: .2; }
    /* Arrastar para os lados escolhe o capítulo; para cima e para baixo, a página rola */
    .top { touch-action: pan-y; cursor: crosshair; }
    .tip { position: absolute; z-index: 2; transform: translate(-50%, -100%); padding: 8px 14px; border: 1px solid #f1d9a8; border-radius: 20px; background: #12231a; color: #fff8ec; font: 600 14px/1.2 Inter, sans-serif; white-space: nowrap; pointer-events: none; box-shadow: 0 4px 18px rgba(0, 0, 0, .35), 0 0 16px rgba(241, 217, 168, .12); }
    .busy { position: absolute; left: 50%; top: 38%; transform: translateX(-50%); padding: 4px 12px; border-radius: 12px; background: rgba(0, 0, 0, .4); color: #eadfcb; font: 600 14px Inter, sans-serif; pointer-events: none; }
    .beacon { position: absolute; width: 10px; height: 10px; border: 1px solid #f1d9a8; border-radius: 50%; transform: translate(-50%, -50%); background: rgba(241, 217, 168, .24); box-shadow: 0 0 12px rgba(241, 217, 168, .55); pointer-events: none; animation: breathe 1.5s ease-in-out infinite; }
    .pulsing .beacon { opacity: 0; }
    .opening .base { animation: weave 4.8s cubic-bezier(.2, .5, .25, 1) both; }
    .weft { position: absolute; top: 6%; bottom: 18%; width: 1px; background: linear-gradient(transparent, rgba(241, 217, 168, .45), transparent); box-shadow: 0 0 18px rgba(241, 217, 168, .2); pointer-events: none; animation: thread 4.8s cubic-bezier(.2, .5, .25, 1) both; }
    .skip { position: absolute; top: 0; right: 0; min-height: 40px; padding: 0 14px; border: 1px solid rgba(241, 217, 168, .5); border-radius: 22px; background: #12231a; color: #fff8ec; font: 600 13px Inter, sans-serif; cursor: pointer; }
    .skip:focus-visible { outline: 3px solid #f1d9a8; outline-offset: 3px; }
    @keyframes breathe { 50% { box-shadow: 0 0 20px rgba(241, 217, 168, .8); background: rgba(241, 217, 168, .5); } }
    @keyframes weave { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
    @keyframes thread { from { left: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } to { left: 100%; opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .base { transition: none; } .beacon, .opening .base, .weft { animation: none; } .weft { display: none; } }
  `,
})
export class BibleArcs {
  readonly graph = input.required<ConnectionGraph>();
  readonly level = input.required<LevelInfo>();
  /** O que está em foco: um capítulo, um livro ou nada. */
  readonly selected = input<Span | null>(null);
  readonly journey = input<ArcJourney | null>(null);
  /** O capítulo sob o dedo enquanto se arrasta pela linha. */
  readonly picked = output<number>();
  /** O dedo saiu da linha: o capítulo em que parou. */
  readonly settled = output<number>();

  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  private readonly baseCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('base');
  private readonly topCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('top');
  private readonly size = signal({ w: 0, h: 0 });
  protected readonly busy = signal(false);
  protected readonly opening = signal(false);
  protected readonly traveling = signal(false);
  protected readonly tip = signal<{ x: number; y: number; label: string } | null>(null);
  private layout: ArcsLayout | null = null;
  private dragging = false;
  private lastPicked = -1;
  private baseToken = 0;
  private baseFrame = 0;
  private topFrame = 0;
  private pickFrame = 0;
  private pendingPick: { index: number; x: number } | null = null;
  private tipTimer: ReturnType<typeof setTimeout> | undefined;
  private openingTimer: ReturnType<typeof setTimeout> | undefined;
  private openingChecked = false;
  private lastJourneyId = -1;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly motionReduced = signal(this.reduced.matches);

  protected readonly beacon = computed(() => {
    const span = this.selected();
    const { w, h } = this.size();
    if (!span || !w) return null;
    const L = layoutFor(w, h);
    return { x: xOf((span.from + span.to) / 2, L), y: L.baseY };
  });

  protected readonly description = computed(() => {
    const s = this.selected();
    return `A Bíblia inteira numa linha, de Gênesis a Apocalipse, com ${this.graph().count(this.level().min).toLocaleString('pt-BR')} ligações entre capítulos desenhadas como arcos${s ? `. Em destaque: ${spanLabel(s)}` : ''}. As ligações também estão em lista, logo abaixo.`;
  });

  constructor() {
    const destroy = inject(DestroyRef);
    const onMotionChange = () => {
      this.motionReduced.set(this.reduced.matches);
      if (this.reduced.matches) this.finishOpening();
    };
    this.reduced.addEventListener('change', onMotionChange);
    afterNextRender(() => {
      const el = this.box().nativeElement;
      const measure = () => {
        const w = Math.round(el.clientWidth);
        if (w > 0 && Math.abs(w - this.size().w) > 1) this.size.set({ w, h: Math.round(w * 0.62) });
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      destroy.onDestroy(() => observer.disconnect());
    });
    destroy.onDestroy(() => {
      this.baseToken++;
      cancelAnimationFrame(this.baseFrame);
      cancelAnimationFrame(this.topFrame);
      cancelAnimationFrame(this.pickFrame);
      clearTimeout(this.tipTimer);
      clearTimeout(this.openingTimer);
      this.reduced.removeEventListener('change', onMotionChange);
    });
    // Visão geral: de novo quando muda o grafo, o nível ou o tamanho
    effect(() => {
      const graph = this.graph();
      const level = this.level();
      const size = this.size();
      untracked(() => this.paintBase(graph, level, size));
    });
    // O que está em foco: de novo quando a escolha ou o tamanho mudam
    effect(() => {
      const span = this.selected();
      const journey = this.journey();
      this.size();
      this.motionReduced();
      untracked(() => this.paintTop(span, journey));
    });
  }

  /** Prepara um canvas para o tamanho da tela, nítido em telas de alta densidade. */
  private prepare(canvas: HTMLCanvasElement, w: number, h: number, maxDpr = 3): CanvasRenderingContext2D {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const width = Math.round(w * dpr);
    const height = Math.round(h * dpr);
    // Reaproveitar o bitmap evita realocar a camada inteira a cada movimento do dedo.
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }

  private paintBase(graph: ConnectionGraph, level: LevelInfo, size: { w: number; h: number }): void {
    if (!size.w) return;
    if (this.openingChecked) this.finishOpening();
    else this.beginOpening();
    const token = ++this.baseToken;
    cancelAnimationFrame(this.baseFrame);
    this.box().nativeElement.style.height = `${size.h}px`;
    const L = layoutFor(size.w, size.h);
    this.layout = L;
    const ctx = this.prepare(this.baseCanvas().nativeElement, size.w, size.h);
    const order = graph.ordered(level.min);
    // Até 20 mil arcos: um traço para cada. Acima disso (o nível “Todas”) o canvas não aguenta traçar um por um: o desenho vira um mapa
    // de densidade, somado aos poucos e pintado no fim
    const many = order.length > 20000;
    const alpha = order.length > 8000 ? 0.2 : 0.3;
    const painter = many ? new DensityPainter(L) : null;
    this.busy.set(many);
    let from = 0;
    const step = () => {
      if (token !== this.baseToken) return;
      from = painter ? painter.add(graph, order, from, from + CHUNK) : drawBaseArcs(ctx, graph, L, order, from, from + CHUNK, alpha);
      if (from < order.length) this.baseFrame = requestAnimationFrame(step);
      else {
        painter?.paint(ctx);
        this.busy.set(false);
      }
    };
    step();
  }

  /** A abertura revela o canvas já desenhado, sem recalcular milhares de arcos por quadro. */
  private beginOpening(): void {
    this.openingChecked = true;
    if (this.selected()) return;
    try {
      if (localStorage.getItem(OPENING_KEY)) return;
    } catch {
      // Se o armazenamento estiver bloqueado, esta instância ainda toca a abertura só uma vez.
    }
    saveLocal(OPENING_KEY, '1');
    if (this.reduced.matches) return;
    this.opening.set(true);
    this.openingTimer = setTimeout(() => this.finishOpening(), 4800);
  }

  protected finishOpening(): void {
    clearTimeout(this.openingTimer);
    this.opening.set(false);
  }

  private paintTop(span: Span | null, journey: ArcJourney | null): void {
    const { w, h } = this.size();
    if (!w) return;
    cancelAnimationFrame(this.topFrame);
    this.traveling.set(false);
    if (span) this.finishOpening();
    const L = this.layout ?? layoutFor(w, h);
    // Durante o arrastar, a prévia mantém todas as ligações com menos pixels e um traço só; ao soltar, o acabamento volta.
    const ctx = this.prepare(this.topCanvas().nativeElement, w, h, this.dragging ? 1.5 : 3);
    // A faixa dos livros fica nesta camada, que nunca se apaga (a de baixo fica fraca quando algo está em foco)
    drawAxis(ctx, L);
    if (!span) return;
    const painter = new FocusPainter(this.graph(), L, span);
    const draw = (progress: number) => {
      ctx.clearRect(0, 0, w, h);
      drawAxis(ctx, L);
      painter.paint(ctx, progress, !this.dragging);
      drawMarker(ctx, L, span);
    };
    // Ao arrastar, cada capítulo aparece de uma vez; ao escolher por outro caminho, as ligações crescem
    if (this.dragging || this.reduced.matches) {
      if (journey) this.lastJourneyId = journey.id;
      draw(1);
      return;
    }
    const grow = () => {
      this.traveling.set(false);
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / 500);
        draw(progress);
        if (progress < 1) this.topFrame = requestAnimationFrame(tick);
      };
      this.topFrame = requestAnimationFrame(tick);
    };
    if (journey && journey.id !== this.lastJourneyId && journey.to === span.from && span.from === span.to && journey.from !== journey.to) {
      this.lastJourneyId = journey.id;
      this.traveling.set(true);
      const previous = { from: journey.from, to: journey.from };
      // A rede antiga fica numa pequena camada estática durante o pulso; só um arco se move.
      const still = document.createElement('canvas');
      still.width = this.topCanvas().nativeElement.width;
      still.height = this.topCanvas().nativeElement.height;
      const stillCtx = still.getContext('2d')!;
      const dpr = still.width / w;
      stillCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawAxis(stillCtx, L);
      new FocusPainter(this.graph(), L, previous).paint(stillCtx);
      drawMarker(stillCtx, L, previous);
      const started = performance.now();
      const travel = (now: number) => {
        const progress = Math.min(1, (now - started) / 540);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(still, 0, 0, w, h);
        drawTravelPulse(ctx, L, journey.from, journey.to, progress);
        if (progress < 1) this.topFrame = requestAnimationFrame(travel);
        else grow();
      };
      this.topFrame = requestAnimationFrame(travel);
    } else grow();
  }

  private indexFor(e: PointerEvent): { index: number; x: number } | null {
    const L = this.layout;
    if (!L) return null;
    const rect = this.box().nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return { index: indexAt(x, L), x };
  }

  private showTip(index: number, x: number): void {
    const L = this.layout!;
    clearTimeout(this.tipTimer);
    const label = chapterAt(index).label;
    const ctx = this.topCanvas().nativeElement.getContext('2d')!;
    ctx.save();
    ctx.font = '600 14px Inter, sans-serif';
    const half = Math.ceil(ctx.measureText(label).width / 2) + 16;
    ctx.restore();
    this.tip.set({ x: Math.min(L.width - half, Math.max(half, x)), y: L.baseY - 10, label });
  }

  protected down(e: PointerEvent): void {
    const at = this.indexFor(e);
    if (!at) return;
    this.finishOpening();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.dragging = true;
    this.pick(at.index, at.x);
  }

  protected move(e: PointerEvent): void {
    const at = this.indexFor(e);
    if (!at) return;
    if (this.dragging) {
      this.pendingPick = at;
      if (!this.pickFrame) this.pickFrame = requestAnimationFrame(() => {
        this.pickFrame = 0;
        const latest = this.pendingPick;
        this.pendingPick = null;
        if (this.dragging && latest) this.pick(latest.index, latest.x);
      });
    }
    else if (e.pointerType === 'mouse') this.showTip(at.index, at.x);
  }

  private pick(index: number, x: number): void {
    this.showTip(index, x);
    if (index === this.lastPicked) return;
    this.lastPicked = index;
    this.picked.emit(index);
  }

  protected up(e: PointerEvent): void {
    if (!this.dragging) return;
    cancelAnimationFrame(this.pickFrame);
    this.pickFrame = 0;
    const at = this.indexFor(e);
    const latest = at ?? this.pendingPick;
    const index = latest?.index ?? this.lastPicked;
    if (latest) this.pick(index, latest.x);
    this.pendingPick = null;
    this.dragging = false;
    this.lastPicked = -1;
    this.settled.emit(index);
    this.tipTimer = setTimeout(() => this.tip.set(null), 900);
  }

  protected cancel(): void {
    cancelAnimationFrame(this.pickFrame);
    this.pickFrame = 0;
    this.pendingPick = null;
    this.dragging = false;
    this.lastPicked = -1;
    this.tip.set(null);
    this.paintTop(this.selected(), null);
  }

  protected leave(e: PointerEvent): void {
    if (!this.dragging && e.pointerType === 'mouse') this.tip.set(null);
  }
}
