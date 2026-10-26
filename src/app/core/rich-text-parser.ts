/** Leitor do Markdown simples usado nos artigos e sermões (sem dependências do Angular). */

/** Trecho de uma linha: texto, negrito, itálico, referência bíblica ou link. */
export interface Inline {
  t: 'text' | 'b' | 'i' | 'ref' | 'link';
  text: string;
  href?: string;
}

export interface Block {
  type: 'h2' | 'h3' | 'p' | 'quote' | 'ul' | 'ol' | 'timeline' | 'note' | 'table' | 'image' | 'figure' | 'scene' | 'pullquote' | 'people';
  inlines?: Inline[];
  items?: Inline[][];
  events?: { date: string; title: string; text: Inline[] }[];
  /** Âncora dos títulos de seção (para o índice). */
  anchor?: string;
  head?: Inline[][];
  rows?: Inline[][][];
  /** Foto: caminho dentro de public/conteudo e descrição para leitores de tela. */
  src?: string;
  alt?: string;
  /** Ilustração desenhada pelo app (id do diagrama em shared/figure.ts). */
  figure?: string;
  /** Legenda da foto ou da ilustração (com o crédito). */
  caption?: Inline[];
  /** Cena: lugar e data que abrem o quadro. */
  place?: string;
  /** Destaque: de quem é a frase (pode ter referência bíblica). */
  cite?: Inline[];
  /** Personagens: nome, papel e foto opcional. */
  people?: { name: string; role: string; src?: string }[];
}

const cells = (line: string) =>
  line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

// [[Jo 3.16]] ou [[Jo 3.16|texto]] · **negrito** · *itálico* · [texto](/rota)
const INLINE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of line.matchAll(INLINE)) {
    if (m.index > last) out.push({ t: 'text', text: line.slice(last, m.index) });
    if (m[1]) out.push({ t: 'ref', text: m[2] ?? m[1], href: m[1].trim() });
    else if (m[3]) out.push({ t: 'b', text: m[3] });
    else if (m[4]) out.push({ t: 'i', text: m[4] });
    else out.push({ t: 'link', text: m[5], href: m[6] });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ t: 'text', text: line.slice(last) });
  return out;
}

/**
 * Markdown simples: ## e ### títulos, parágrafos, > citação, listas (- e 1.),
 * ":::tempo" (linha do tempo: "- data | título | texto"), ":::nota" (destaque),
 * ":::figura id" (ilustração do app, com a legenda dentro) e fotos: ![descrição](imagens/foto.jpg "legenda").
 * Para as histórias: ":::cena Lugar, data" (um quadro que põe o leitor no lugar), ":::destaque" (frase em
 * destaque; a última linha começando com "— " é o autor) e ":::pessoas" ("- Nome | papel | imagens/foto.jpg").
 */
export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', inlines: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      flush();
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      flush();
      blocks.push({ type: 'image', alt: image[1], src: image[2], caption: image[3] ? parseInline(image[3]) : undefined });
      continue;
    }
    const fence = line.match(/^:::\s*(tempo|nota|figura|cena|destaque|pessoas)(?:\s+(.+))?$/);
    if (fence) {
      flush();
      const body: string[] = [];
      while (++i < lines.length && lines[i].trim() !== ':::') body.push(lines[i].trim());
      const text = body.filter(Boolean);
      if (fence[1] === 'cena') {
        blocks.push({ type: 'scene', place: fence[2]?.trim(), inlines: parseInline(text.join(' ')) });
      } else if (fence[1] === 'destaque') {
        const cite = text.length > 1 && text[text.length - 1].startsWith('— ') ? text.pop()!.slice(2) : undefined;
        blocks.push({ type: 'pullquote', inlines: parseInline(text.join(' ')), cite: cite ? parseInline(cite) : undefined });
      } else if (fence[1] === 'pessoas') {
        const people = text
          .filter((l) => l.startsWith('- '))
          .map((l) => {
            const [name, role, src] = l.slice(2).split('|').map((p) => p.trim());
            return { name, role: role ?? '', src: src || undefined };
          });
        blocks.push({ type: 'people', people });
      } else if (fence[1] === 'figura') {
        blocks.push({ type: 'figure', figure: fence[2]?.trim(), caption: body.length ? parseInline(body.filter(Boolean).join(' ')) : undefined });
      } else if (fence[1] === 'tempo') {
        const events = body
          .filter((l) => l.startsWith('- '))
          .map((l) => {
            const [date, title, ...text] = l.slice(2).split('|').map((p) => p.trim());
            return { date, title, text: parseInline(text.join(' | ')) };
          });
        blocks.push({ type: 'timeline', events });
      } else {
        blocks.push({ type: 'note', inlines: parseInline(body.filter(Boolean).join(' ')) });
      }
      continue;
    }
    if (line.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = cells(lines[i]);
        if (!row.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(row);
        i++;
      }
      i--;
      const [head, ...body] = rows;
      blocks.push({ type: 'table', head: head.map(parseInline), rows: body.map((r) => r.map(parseInline)) });
      continue;
    }
    if (line.startsWith('### ')) {
      flush();
      blocks.push({ type: 'h3', inlines: parseInline(line.slice(4)) });
    } else if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'h2', inlines: parseInline(line.slice(3)), anchor: `secao-${blocks.filter((b) => b.type === 'h2').length + 1}` });
    } else if (line.startsWith('> ')) {
      flush();
      const quote = [line.slice(2)];
      while (lines[i + 1]?.trim().startsWith('> ')) quote.push(lines[++i].trim().slice(2));
      blocks.push({ type: 'quote', inlines: parseInline(quote.join(' ')) });
    } else if (/^(-|\d+\.)\s/.test(line)) {
      flush();
      const ordered = /^\d+\./.test(line);
      const items: Inline[][] = [];
      let j = i;
      while (j < lines.length && /^(-|\d+\.)\s/.test(lines[j].trim())) {
        items.push(parseInline(lines[j].trim().replace(/^(-|\d+\.)\s+/, '')));
        j++;
      }
      i = j - 1;
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

/** Títulos de seção de um texto, para montar o índice. */
export const outline = (source: string) =>
  parseBlocks(source)
    .filter((b) => b.type === 'h2')
    .map((b) => ({ anchor: b.anchor!, text: b.inlines!.map((i) => i.text).join('') }));
