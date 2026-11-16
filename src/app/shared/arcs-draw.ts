import { BOOKS } from '../core/books';
import { bookIndexOf, CHAPTER_COUNT, ConnectionGraph, distanceHue, firstChapterOf, isChapter, type Span } from '../core/bible-connections';
import type { ShareArt } from '../core/share-card';
import { roundRect } from './share-canvas';

/**
 * O desenho de “A Bíblia Conectada”: os capítulos numa linha (de Gênesis a Apocalipse), e cada ligação, um arco por cima, mais alto
 * quanto mais longe estão os dois capítulos. Funções puras sobre um canvas 2D, usadas pela tela (shared/bible-arcs.ts) e pela
 * imagem de compartilhar (shared/share-render.ts). A ideia dos arcos vem de “Bible Cross-References”, de Chris Harrison e
 * Christoph Römhild (2007); o desenho e os dados são nossos.
 */

export interface ArcsLayout {
  width: number;
  height: number;
  /** Margem dos lados. */
  padX: number;
  /** A linha dos capítulos (onde os arcos nascem). */
  baseY: number;
  /** Largura de um capítulo na linha. */
  step: number;
  /** Altura da faixa colorida dos livros, logo abaixo da linha. */
  strip: number;
}

/** Cores do desenho: o dourado liga ao Antigo Testamento e o rosa, ao Novo. */
export const ARC_COLORS = { ot: '#f1d9a8', nt: '#ff8fb8', label: '#fff8ec' };

/** Onde fica cada coisa para uma área de `width` × `height`: em cima os arcos; embaixo a faixa dos livros e os rótulos. */
export function layoutFor(width: number, height: number): ArcsLayout {
  const padX = Math.max(6, Math.round(width * 0.02));
  const strip = Math.max(6, Math.round(width / 52));
  const bottom = Math.max(strip + 40, Math.round(height * 0.17));
  return { width, height, padX, baseY: height - bottom, step: (width - 2 * padX) / CHAPTER_COUNT, strip };
}

export const xOf = (i: number, L: ArcsLayout): number => L.padX + (i + 0.5) * L.step;

/** Que capítulo está na posição horizontal `x`. */
export function indexAt(x: number, L: ArcsLayout): number {
  return Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor((x - L.padX) / L.step)));
}

const NT_START = firstChapterOf(BOOKS.findIndex((b) => b.id === 'MAT'));

/** A distância percorre só o rosa e o dourado do app, sem transformar a visão geral num arco-íris. */
function distanceRgb(distance: number): [number, number, number] {
  const p = Math.min(1, Math.max(0, (290 - distanceHue(distance)) / 230));
  return [255 - 14 * p, 143 + 74 * p, 184 - 16 * p];
}

/** Cor de um arco pela distância; a opacidade muda conforme a camada. */
export const distanceColor = (distance: number, alpha = 1): string => `rgba(${distanceRgb(distance).map(Math.round).join(', ')}, ${alpha})`;

/** Espessura da linha dos arcos de fundo, para o desenho ficar fino em qualquer largura. */
export const baseLineWidth = (L: ArcsLayout): number => Math.min(1, Math.max(0.5, L.width / 650));

/** Um arco entre os capítulos `a` e `b` (a < b), por cima da linha. */
function arcPath(ctx: CanvasRenderingContext2D, L: ArcsLayout, a: number, b: number): void {
  const xa = xOf(a, L);
  const xb = xOf(b, L);
  ctx.beginPath();
  ctx.arc((xa + xb) / 2, L.baseY, (xb - xa) / 2, Math.PI, 0);
}

/**
 * Desenha de `from` a `to` as ligações de `order` (índices de ligações, da mais longa para a mais curta), na visão geral: cor pela
 * distância. Devolve o próximo `from`, para quem desenha aos poucos sem travar a tela.
 */
export function drawBaseArcs(ctx: CanvasRenderingContext2D, graph: ConnectionGraph, L: ArcsLayout, order: Uint32Array, from: number, to: number, alpha: number): number {
  ctx.lineWidth = baseLineWidth(L);
  const end = Math.min(to, order.length);
  for (let p = from; p < end; p++) {
    const k = order[p];
    const a = graph.a[k];
    const b = graph.b[k];
    ctx.strokeStyle = distanceColor(b - a, alpha);
    arcPath(ctx, L, a, b);
    ctx.stroke();
  }
  return end;
}

/**
 * O desenho por densidade, para dezenas de milhares de arcos (o nível “Todas”): em vez de traçar cada arco no canvas (pesado), cada
 * arco soma a sua cor num mapa do tamanho da tela, e no fim o mapa vira um brilho (onde passam muitos arcos, a cor é cheia; onde
 * passam poucos, é fraca). `add` trabalha por partes, para a tela não travar; `paint` pinta o resultado.
 */
export class DensityPainter {
  private readonly w: number;
  private readonly h: number;
  private readonly count: Uint16Array;
  private readonly sum: Float32Array;
  private readonly colors = new Map<number, [number, number, number]>();

  constructor(private readonly L: ArcsLayout) {
    this.w = Math.ceil(L.width);
    this.h = Math.ceil(L.baseY + 2);
    this.count = new Uint16Array(this.w * this.h);
    this.sum = new Float32Array(this.w * this.h * 3);
  }

  /** Soma as ligações de `from` a `to` (índices de `order`); devolve o próximo `from`. */
  add(graph: ConnectionGraph, order: Uint32Array, from: number, to: number): number {
    const { L, w, h, count, sum } = this;
    const end = Math.min(to, order.length);
    for (let p = from; p < end; p++) {
      const k = order[p];
      const a = graph.a[k];
      const b = graph.b[k];
      const bucket = Math.round((b - a) / 8);
      let rgb = this.colors.get(bucket);
      if (!rgb) {
        rgb = distanceRgb(Math.max(1, bucket * 8)).map((c) => c / 255) as [number, number, number];
        this.colors.set(bucket, rgb);
      }
      const xa = xOf(a, L);
      const xb = xOf(b, L);
      const r = (xb - xa) / 2;
      const cx = (xa + xb) / 2;
      const steps = Math.max(6, Math.ceil(Math.PI * r));
      for (let s = 0; s <= steps; s++) {
        const theta = (Math.PI * s) / steps;
        const ix = Math.floor(cx - r * Math.cos(theta));
        const iy = Math.floor(L.baseY - r * Math.sin(theta));
        if (ix < 0 || ix >= w || iy < 0 || iy >= h) continue;
        const cell = iy * w + ix;
        count[cell]++;
        sum[cell * 3] += rgb[0];
        sum[cell * 3 + 1] += rgb[1];
        sum[cell * 3 + 2] += rgb[2];
      }
    }
    return end;
  }

  /** Pinta o mapa no canvas (que já está na escala da tela), com a cor média de cada ponto e a opacidade pela quantidade de arcos. */
  paint(ctx: CanvasRenderingContext2D): void {
    const { w, h, count, sum } = this;
    const image = new ImageData(w, h);
    for (let cell = 0; cell < w * h; cell++) {
      const n = count[cell];
      if (!n) continue;
      image.data[cell * 4] = (sum[cell * 3] / n) * 255;
      image.data[cell * 4 + 1] = (sum[cell * 3 + 1] / n) * 255;
      image.data[cell * 4 + 2] = (sum[cell * 3 + 2] / n) * 255;
      image.data[cell * 4 + 3] = (1 - Math.exp(-n * 0.05)) * 235;
    }
    const layer = document.createElement('canvas');
    layer.width = w;
    layer.height = h;
    layer.getContext('2d')!.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(layer, 0, 0, w, h);
  }
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** Quantas ligações o desenho acende, no máximo, para um capítulo e para um livro inteiro. */
export const FOCUS_MAX_CHAPTER = 450;
export const FOCUS_MAX_BOOK = 300;

/**
 * As ligações do que está em foco, acesas: douradas para o Antigo Testamento e rosa para o Novo. Com `progress` de 0 a 1 elas
 * crescem a partir do que foi escolhido (a entrada suave quando a escolha muda). Um capítulo mostra uma ligação para cada capítulo
 * ligado a ele; um livro inteiro mostra uma para cada capítulo de fora, somando as referências de todos os seus capítulos, saindo do
 * meio do livro (milhares de arcos quase iguais, um por capítulo do livro, virariam uma mancha).
 */
export function drawFocusArcs(ctx: CanvasRenderingContext2D, graph: ConnectionGraph, L: ArcsLayout, span: Span, progress = 1): void {
  new FocusPainter(graph, L, span).paint(ctx, progress);
}

/** A seleção e a geometria são calculadas uma vez por escolha, e não a cada quadro da animação. */
export class FocusPainter {
  private readonly lines: { center: number; radius: number; forward: boolean; width: number; alpha: number; color: string; endpoint: number }[];

  constructor(graph: ConnectionGraph, private readonly L: ArcsLayout, span: Span) {
    const links = isChapter(span) ? graph.neighbors(span.from) : graph.linksOf(span);
    const anchor = Math.round((span.from + span.to) / 2);
    // A lista abaixo da tela continua completa; o canvas tem no máximo 450 arcos de capítulo ou 300 de livro.
    const strongest = links.slice().sort((x, y) => y.refs - x.refs || x.index - y.index).slice(0, isChapter(span) ? FOCUS_MAX_CHAPTER : FOCUS_MAX_BOOK);
    strongest.sort((x, y) => Math.abs(y.index - anchor) - Math.abs(x.index - anchor));
    const density = Math.min(1, 160 / Math.max(1, strongest.length));
    const width = Math.max(1, L.width / 330) * (0.22 + 0.78 * density);
    const xa = xOf(anchor, L);
    this.lines = strongest.map(({ index, refs }) => {
      const xo = xOf(index, L);
      const weight = Math.min(1, Math.log2(1 + refs) / 5);
      return {
        center: (xa + xo) / 2, radius: Math.abs(xo - xa) / 2, forward: xa <= xo,
        width: width * (0.6 + 0.8 * weight),
        alpha: Math.min(0.95, 0.35 + 0.6 * weight) * (0.14 + 0.86 * density ** 0.8),
        color: index >= NT_START ? ARC_COLORS.nt : ARC_COLORS.ot, endpoint: xo,
      };
    });
  }

  paint(ctx: CanvasRenderingContext2D, progress = 1, glow = true): void {
    const p = easeOut(Math.min(1, Math.max(0, progress)));
    if (p <= 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    for (const line of this.lines) {
      ctx.strokeStyle = line.color;
      ctx.beginPath();
      const start = line.forward ? Math.PI : 2 * Math.PI;
      ctx.arc(line.center, this.L.baseY, line.radius, start, start + (line.forward ? 1 : -1) * p * Math.PI, !line.forward);
      // Dois traços sobre o mesmo caminho dão brilho sem aplicar shadowBlur a centenas de arcos.
      if (glow) {
        ctx.globalAlpha = line.alpha * 0.12;
        ctx.lineWidth = line.width + Math.min(5, this.L.width / 150);
        ctx.stroke();
      }
      ctx.globalAlpha = line.alpha;
      ctx.lineWidth = line.width;
      ctx.stroke();
    }
    // Poucos pontos de luz mantêm a linha dos capítulos limpa mesmo num livro inteiro.
    if (glow && p > 0.98) {
      const every = Math.max(1, Math.ceil(this.lines.length / 24));
      this.lines.forEach((line, i) => {
        if (i % every !== 0) return;
        ctx.fillStyle = line.color;
        ctx.globalAlpha = Math.min(0.85, line.alpha + 0.2);
        ctx.beginPath();
        ctx.arc(line.endpoint, this.L.baseY, Math.max(1.1, line.width * 0.8), 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }
}

/** Um pulso segue o arco no sentido da escolha, com cauda curta; só este arco recebe sombra. */
export function drawTravelPulse(ctx: CanvasRenderingContext2D, L: ArcsLayout, from: number, to: number, progress: number): void {
  if (from === to) return;
  const xa = xOf(from, L);
  const xb = xOf(to, L);
  const radius = Math.abs(xb - xa) / 2;
  const center = (xa + xb) / 2;
  const forward = xa < xb;
  const angle = (p: number) => (forward ? Math.PI : Math.PI * 2) + (forward ? 1 : -1) * Math.PI * p;
  const p = Math.min(1, Math.max(0, progress));
  const color = to >= NT_START ? ARC_COLORS.nt : ARC_COLORS.ot;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.5, L.width / 400);
  ctx.beginPath();
  ctx.arc(center, L.baseY, radius, angle(Math.max(0, p - 0.2)), angle(p), !forward);
  ctx.stroke();
  const x = center + radius * Math.cos(angle(p));
  const y = L.baseY + radius * Math.sin(angle(p));
  ctx.fillStyle = ARC_COLORS.label;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(2, L.width / 250), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A faixa colorida dos livros (uma cor por categoria) e os rótulos do Antigo e do Novo Testamento. */
export function drawAxis(ctx: CanvasRenderingContext2D, L: ArcsLayout, fontPx = 13): void {
  const top = L.baseY + Math.round(L.strip * 0.5);
  BOOKS.forEach((book, bookIndex) => {
    const first = firstChapterOf(bookIndex);
    ctx.fillStyle = book.category.color;
    ctx.fillRect(xOf(first, L) - L.step / 2 + 0.3, top, book.chapters * L.step - 0.6, L.strip);
  });
  ctx.fillStyle = ARC_COLORS.label;
  ctx.font = `600 ${fontPx}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  const labelY = top + L.strip + fontPx + 12;
  ctx.textAlign = L.width < 500 ? 'left' : 'center';
  ctx.fillText('Antigo Testamento', L.width < 500 ? L.padX : xOf(NT_START / 2, L), labelY);
  ctx.textAlign = 'right';
  ctx.fillText('Novo Testamento', L.width - L.padX, labelY);
  ctx.textAlign = 'left';
}

/** O marcador do que está em foco, sobre a faixa dos livros: um triângulo num capítulo, ou um colchete num livro inteiro. */
export function drawMarker(ctx: CanvasRenderingContext2D, L: ArcsLayout, span: Span): void {
  ctx.save();
  const top = L.baseY + Math.round(L.strip * 0.5);
  const center = xOf((span.from + span.to) / 2, L);
  const glow = ctx.createRadialGradient(center, L.baseY, 0, center, L.baseY, 16);
  glow.addColorStop(0, 'rgba(241, 217, 168, .55)');
  glow.addColorStop(1, 'rgba(241, 217, 168, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(center - 16, L.baseY - 16, 32, 32);
  ctx.fillStyle = ARC_COLORS.ot;
  ctx.strokeStyle = ARC_COLORS.ot;
  if (isChapter(span)) {
    const x = xOf(span.from, L);
    const s = Math.max(5, L.strip * 0.8);
    ctx.beginPath();
    ctx.moveTo(x, top + L.strip + 1);
    ctx.lineTo(x - s, top + L.strip + 1 + s * 1.4);
    ctx.lineTo(x + s, top + L.strip + 1 + s * 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, L.baseY - 4);
    ctx.stroke();
  } else {
    const x1 = xOf(span.from, L) - L.step / 2;
    const x2 = xOf(span.to, L) + L.step / 2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, top - 2);
    ctx.lineTo(x1, top + L.strip + 4);
    ctx.lineTo(x2, top + L.strip + 4);
    ctx.lineTo(x2, top - 2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * O desenho inteiro de uma vez (para a imagem de compartilhar): a visão geral com as ligações do nível escolhido, as do que está em
 * foco por cima, a faixa dos livros e o marcador. Na tela, as camadas são separadas (shared/bible-arcs.ts).
 */
export function drawAll(ctx: CanvasRenderingContext2D, graph: ConnectionGraph, L: ArcsLayout, min: number, span: Span | null, opts: { fontPx?: number; veil?: string } = {}): void {
  const order = graph.ordered(min);
  drawBaseArcs(ctx, graph, L, order, 0, order.length, span ? 0.1 : 0.3);
  if (span && opts.veil) {
    // apaga o fundo para o que está em foco aparecer
    ctx.fillStyle = opts.veil;
    ctx.fillRect(0, 0, L.width, L.baseY + 2);
  }
  if (span) drawFocusArcs(ctx, graph, L, span);
  drawAxis(ctx, L, opts.fontPx);
  if (span) drawMarker(ctx, L, span);
}

/** O livro (posição na lista) que está sob a posição `x`, para o rótulo de quem arrasta o dedo. */
export const bookIndexAt = (x: number, L: ArcsLayout): number => bookIndexOf(indexAt(x, L));

/** A arte é local e opcional: uma falha de carregamento conserva o degradê e permite compartilhar offline. */
function shareBackground(stories: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `conteudo/imagens/conexoes-compartilhar-${stories ? 'stories' : 'feed'}.webp`;
  });
}

/**
 * O desenho dentro da imagem de compartilhar: um painel escuro com os arcos (na visão geral, ou com o que está em foco aceso), a
 * faixa dos livros e os rótulos. `min` é o nível de ligações da visão geral.
 */
export function shareArt(graph: ConnectionGraph, span: Span | null, min: number): ShareArt {
  return {
    async draw(ctx, box, { stories }) {
      const image = await shareBackground(stories);
      ctx.save();
      roundRect(ctx, box.x, box.y, box.w, box.h, 28);
      ctx.clip();
      if (image) {
        const scale = Math.max(box.w / image.naturalWidth, box.h / image.naturalHeight);
        const iw = image.naturalWidth * scale;
        const ih = image.naturalHeight * scale;
        ctx.drawImage(image, box.x + (box.w - iw) / 2, box.y + (box.h - ih) / 2, iw, ih);
      }
      ctx.fillStyle = 'rgba(18, 35, 26, .35)';
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.restore();
      const h = Math.min(box.h, Math.round(box.w * 0.68));
      const y = box.y + Math.max(0, (box.h - h) / 2);
      ctx.save();
      ctx.translate(box.x, y);
      const panel = ctx.createLinearGradient(0, 0, 0, h);
      panel.addColorStop(0, 'rgba(18, 35, 26, .75)');
      panel.addColorStop(1, 'rgba(18, 35, 26, .94)');
      ctx.fillStyle = panel;
      roundRect(ctx, 0, 0, box.w, h, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(241, 217, 168, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      roundRect(ctx, 0, 0, box.w, h, 26);
      ctx.clip();
      drawAll(ctx, graph, layoutFor(box.w, h), min, span, { fontPx: stories ? 30 : 26, veil: 'rgba(15, 29, 22, 0.78)' });
      ctx.restore();
    },
  };
}
