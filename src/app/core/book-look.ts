/**
 * O jeito de cada livro da biblioteca: o tom da capa e se ela é de creme. Vem só da chave do livro, então o mesmo livro tem
 * sempre o mesmo jeito, na estante do app e na imagem de compartilhar. Código puro (sem Angular), para os testes.
 */

export function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export interface BookLook {
  /** Quanto a cor do assunto escurece na capa (%). */
  dark: number;
  /** Uma capa em cada cinco é cor de creme, com o texto escuro. */
  light: boolean;
}

export function bookLook(key: string): BookLook {
  const h = hash(key);
  return { dark: [0, 12, 22, 30][(h >>> 3) % 4], light: h % 5 === 0 };
}

/** Mistura duas cores "#rrggbb": `amount` de `b` (0 a 1) sobre `a`. É o `color-mix` do CSS, para desenhar no canvas. */
export function mixHex(a: string, b: string, amount: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(channel(a, i) * (1 - amount) + channel(b, i) * amount).toString(16).padStart(2, '0')).join('')}`;
}
