import { mixHex } from '../core/book-look';
import { CARD_CREAM, CARD_GOLD, type ShareBook } from '../core/share-card';
import { clampLines, roundRect, wrapLines } from './share-canvas';

/**
 * A estante da imagem de compartilhar de uma prateleira: as capas dos livros, cada uma com o seu número, em fileiras sobre
 * tábuas, do jeito que a biblioteca do app mostra (o mesmo tom de cada capa, as de creme, o fio dourado, o ícone). Os atalhos
 * para outras telas não têm número e levam o contorno tracejado, como na estante do app.
 */

const SERIF = '"Source Serif 4", Georgia, serif';
const SANS = 'Inter, system-ui, sans-serif';
const ICON_FONT = '"Material Symbols Outlined"';
/** O mesmo texto escuro e o mesmo creme das capas claras na estante do app. */
const INK = '#2b2118';
const PAPER = '#efe3c8';

/** Medidas da capa (em pixels, para uma capa de 205 de largura; tudo cresce com a capa): o ícone, o respiro até o fio de cima e até o fio de baixo. */
const ICON_PX = 54;
const ICON_GAP = 14;
const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 24;
/** Altura da linha do título. */
const lineHeight = (fs: number) => Math.round(fs * 1.2);

export interface ShelfBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Carrega a fonte dos ícones; se ela faltar, a capa sai sem o ícone, nunca com o nome dele escrito. */
async function iconsReady(): Promise<boolean> {
  try {
    await Promise.all([document.fonts.load(`400 48px ${ICON_FONT}`, 'science'), document.fonts.load('600 30px "Source Serif 4"', 'Áé ção')]);
    return document.fonts.check(`400 48px ${ICON_FONT}`, 'science');
  } catch {
    return false;
  }
}

/** A tábua: um fio claro no alto, o corpo escuro e a sombra de baixo (como as prateleiras do app). */
function drawBoard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = 'rgba(255, 248, 236, 0.34)';
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.fillRect(x, y + 3, w, h - 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y + h - 3, w, 3);
}

/** O corpo da capa: a cor do assunto (mais escura ou de creme), o brilho da lombada à esquerda e os fios dourados no alto e no pé. */
function drawBody(ctx: CanvasRenderingContext2D, b: ShareBook, x: number, y: number, w: number, h: number, tone: string, k: number): void {
  const radii = [6 * k, 16 * k, 16 * k, 6 * k];
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 18 * k;
  ctx.shadowOffsetX = 3 * k;
  ctx.shadowOffsetY = 8 * k;
  ctx.fillStyle = b.light ? PAPER : mixHex(tone, '#000000', b.dark / 100);
  roundRect(ctx, x, y, w, h, radii);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, radii);
  ctx.clip();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  const stops: [number, string][] = b.light
    ? [[0, 'rgba(0,0,0,.22)'], [0.18, 'rgba(0,0,0,0)'], [0.3, 'rgba(255,255,255,.35)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.14)']]
    : [[0, 'rgba(0,0,0,.38)'], [0.16, 'rgba(0,0,0,0)'], [0.26, 'rgba(255,255,255,.13)'], [0.42, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.28)']];
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = b.light ? tone : CARD_GOLD;
  ctx.globalAlpha = 0.85;
  for (const ry of [y + 13 * k, y + h - 19 * k]) {
    for (const dy of [0, 4 * k]) ctx.fillRect(x + 17 * k, ry + dy, w - 26 * k, 1.8 * k);
  }
  ctx.restore();

  // atalho para outra tela: contorno tracejado por dentro da capa
  if (b.shortcut) {
    ctx.save();
    ctx.strokeStyle = b.light ? tone : CARD_GOLD;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2 * k;
    ctx.setLineDash([9 * k, 7 * k]);
    roundRect(ctx, x + 10 * k, y + 10 * k, w - 20 * k, h - 20 * k, 6 * k);
    ctx.stroke();
    ctx.restore();
  }
}

/** O número na quina da capa: disco dourado com o número escuro (na capa de creme, disco escuro com o número claro). */
function drawNumber(ctx: CanvasRenderingContext2D, b: ShareBook, x: number, y: number, tone: string, k: number): void {
  if (!b.n) return;
  const r = 22 * k;
  const cx = x + 18 * k + r;
  const cy = y + 30 * k + r;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 5 * k;
  ctx.shadowOffsetY = 2 * k;
  ctx.fillStyle = b.light ? mixHex(tone, '#000000', 0.15) : CARD_GOLD;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = b.light ? 'rgba(255, 248, 236, 0.65)' : 'rgba(43, 33, 24, 0.55)';
  ctx.lineWidth = 2.5 * k;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = b.light ? CARD_CREAM : INK;
  ctx.font = `700 ${Math.round(27 * k)}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(b.n), cx, cy + 9.5 * k);
  ctx.textAlign = 'left';
}

/** Quebra o título em linhas de tamanho parecido: a menor largura que ainda dá o mesmo número de linhas da quebra comum. */
function balancedLines(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const common = wrapLines(ctx, text, max);
  let best = common;
  if (common.length < 2) return best;
  for (let w = max - 6; w > max * 0.5; w -= 6) {
    const lines = wrapLines(ctx, text, w);
    if (lines.length > common.length) break;
    if (lines.every((line) => ctx.measureText(line).width <= max)) best = lines;
  }
  return best;
}

/** Com a fonte de ícones, o nome do ícone vira um único símbolo; se a palavra sair larga, a fonte não valeu e o ícone é dispensado. */
function iconFits(ctx: CanvasRenderingContext2D, name: string, size: number): boolean {
  ctx.font = `400 ${size}px ${ICON_FONT}`;
  return ctx.measureText(name).width <= size * 1.6;
}

/** O ícone (ligadura da fonte de ícones) e o título, centrados na capa; as capas de creme levam texto escuro. */
function drawLabel(ctx: CanvasRenderingContext2D, b: ShareBook, lines: string[], x: number, y: number, w: number, h: number, fs: number, iconOk: boolean, tone: string, k: number): void {
  const ink = b.light ? INK : CARD_CREAM;
  const iconSize = Math.round(ICON_PX * k);
  const lh = lineHeight(fs);
  const showIcon = iconOk && iconFits(ctx, b.icon, iconSize);
  const gap = showIcon ? Math.round(ICON_GAP * k) : 0;
  const block = (showIcon ? iconSize : 0) + gap + lines.length * lh;
  let top = Math.max(y + TOP_MARGIN * k, y + (h - block) / 2 + 4 * k);
  const cx = x + (w + 8 * k) / 2;
  ctx.textAlign = 'center';
  if (showIcon) {
    ctx.font = `400 ${iconSize}px ${ICON_FONT}`;
    ctx.fillStyle = b.light ? mixHex(tone, '#000000', 0.15) : CARD_GOLD;
    ctx.textBaseline = 'middle';
    ctx.fillText(b.icon, cx, top + iconSize / 2);
    top += iconSize + gap;
  }
  ctx.fillStyle = ink;
  ctx.font = `600 ${fs}px ${SERIF}`;
  ctx.textBaseline = 'alphabetic';
  for (const line of lines) {
    top += lh;
    ctx.fillText(line, cx, top - lh * 0.24);
  }
  ctx.textAlign = 'left';
}

/**
 * Desenha a estante dentro de `box`. Quatro capas por fileira no feed e três nos Stories (que têm mais altura), em até duas e três
 * fileiras; o que não couber vira “+ N livros no app”. Com poucos livros as capas ficam maiores e a fileira, centrada. A letra do
 * título é a mesma em todas as capas, a maior em que o ícone e o título mais comprido ainda cabem; se nem a menor couber, o título
 * é cortado com reticências.
 */
export async function drawShelf(ctx: CanvasRenderingContext2D, books: ShareBook[], box: ShelfBox, tone: string, stories: boolean): Promise<void> {
  const iconOk = await iconsReady();
  const cols = stories ? 3 : 4;
  const shown = books.slice(0, cols * (stories ? 3 : 2));
  const hidden = books.length - shown.length;
  const used = Math.min(shown.length, cols);
  const rows = Math.ceil(shown.length / used);
  const k0 = stories ? 1.25 : 1;
  const gap = Math.round(18 * k0);
  const board = Math.round(18 * k0);
  const lift = Math.round(16 * k0);
  const padX = 20;
  const padTop = 12;
  const padBottom = 12;
  const moreH = hidden ? 58 : 0;
  const innerW = box.w - padX * 2;
  const bookW = Math.min((innerW - gap * (used - 1)) / used, stories ? 330 : 280);
  const k = bookW / 205;
  const bookH = Math.max(140, Math.min(bookW * 1.45, (box.h - padTop - padBottom - moreH - rows * (board + lift)) / rows));
  const panelH = padTop + rows * (bookH + board + lift) + padBottom + moreH;
  const top = box.y + Math.max(0, (box.h - panelH) / 2);

  // a letra do título é a mesma em todas as capas: a maior em que a palavra mais comprida cabe na largura e o título que mais
  // linhas pede cabe, com o ícone, entre os dois fios dourados
  const textW = bookW - 22 * k;
  const area = bookH - (TOP_MARGIN + BOTTOM_MARGIN) * k;
  const iconBlock = iconOk ? (ICON_PX + ICON_GAP) * k : 0;
  const words = shown.flatMap((b) => b.title.split(' '));
  const wrap = (fs: number) => {
    ctx.font = `600 ${fs}px ${SERIF}`;
    return shown.map((b) => balancedLines(ctx, b.title, textW));
  };
  const fits = (fs: number, lines: string[][]) => Math.max(...words.map((w) => ctx.measureText(w).width)) <= textW && iconBlock + Math.max(...lines.map((l) => l.length)) * lineHeight(fs) <= area;
  const smallest = Math.round(21 * k);
  let fs = Math.round(30 * k);
  let all = wrap(fs);
  while (fs > smallest && !fits(fs, all)) all = wrap(--fs);
  // nem a menor letra cabe: corta o título com reticências na última linha que cabe
  const maxLines = Math.max(1, Math.floor((area - iconBlock) / lineHeight(fs)));
  ctx.font = `600 ${fs}px ${SERIF}`;
  all = all.map((lines) => clampLines(ctx, lines, maxLines, textW));

  // o móvel da estante: um fundo escuro com filete dourado
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  roundRect(ctx, box.x, top, box.w, panelH, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(241, 217, 168, 0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  let rowTop = top + padTop;
  for (let r = 0; r < rows; r++) {
    const baseY = rowTop + lift + bookH;
    drawBoard(ctx, box.x + 10, baseY, box.w - 20, board);
    const first = r * used;
    const count = Math.min(used, shown.length - first);
    const shift = rows === 1 ? (innerW - (count * bookW + (count - 1) * gap)) / 2 : 0;
    for (let i = 0; i < count; i++) {
      const b = shown[first + i];
      const x = box.x + padX + shift + i * (bookW + gap);
      const y = baseY - bookH;
      drawBody(ctx, b, x, y, bookW, bookH, tone, k);
      drawLabel(ctx, b, all[first + i], x, y, bookW, bookH, fs, iconOk, tone, k);
      drawNumber(ctx, b, x, y, tone, k);
    }
    rowTop = baseY + board;
  }
  if (hidden) {
    ctx.fillStyle = CARD_GOLD;
    ctx.font = `600 ${Math.round(29 * k0)}px ${SANS}`;
    ctx.fillText(`+ ${hidden} ${hidden === 1 ? 'livro' : 'livros'} no app`, box.x + padX, rowTop + 40);
  }
}
