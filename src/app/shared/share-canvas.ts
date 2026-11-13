import { plain } from '../core/share-card';

/** Auxiliares de desenho da imagem de compartilhar, usados pelo `share-render.ts` e pelo `share-shelf.ts`. */

/** Quebra o texto em linhas que cabem em `max` pixels (a fonte já precisa estar no contexto). */
export function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = plain(text).split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > max) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Limita a `max` linhas; a última termina em reticências quando o texto não coube. */
export function clampLines(ctx: CanvasRenderingContext2D, lines: string[], max: number, width: number): string[] {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = `${kept[max - 1]}…`;
  while (last.length > 2 && ctx.measureText(last).width > width) last = `${last.slice(0, -2).trimEnd()}…`;
  kept[max - 1] = last;
  return kept;
}

/** Retângulo de cantos redondos; `r` pode ser uma lista (um raio por canto, a partir do de cima à esquerda). */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
