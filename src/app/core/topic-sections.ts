import type { Block } from './rich-text-parser';

/**
 * Sanfona por tópico (estudos longos): cada título de seção (`##`) abre e fecha o seu trecho. Aqui ficam as contas, sem Angular:
 * onde cada tópico começa e termina, quanto ele pesa (em palavras) e como o progresso de leitura se mede.
 *
 * O progresso é medido pelo conteúdo (palavras), e não pela altura da página, porque a altura muda toda vez que um tópico
 * abre ou fecha: "continuar de onde parou" e "faltam N min" precisam apontar para o mesmo lugar do texto, aberto ou fechado.
 */
export interface TopicSection {
  /** Posição do título (`h2`) na lista de blocos. */
  head: number;
  /** Posição do último bloco do tópico (inclusive). */
  last: number;
  title: string;
  anchor?: string;
  words: number;
  /** Tempo de leitura do tópico, em minutos (200 palavras por minuto). */
  minutes: number;
}

const WORDS_PER_MINUTE = 200;
const TEXT_KEYS = new Set(['text', 'title', 'label', 'who', 'role', 'name', 'place']);

function collect(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const v of value) collect(v, out);
  } else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === 'string') {
        if (TEXT_KEYS.has(key)) out.push(v);
      } else collect(v, out);
    }
  }
}

/** Palavras de um bloco (todo texto que ele mostra: linhas, itens, falas, fichas, tabelas, legendas). */
export function blockWords(block: Block): number {
  const parts: string[] = [];
  collect(block, parts);
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

/** Os tópicos do texto: do título (`h2`) até o bloco antes do próximo título. */
export function topicSections(blocks: Block[]): TopicSection[] {
  const heads = blocks.flatMap((b, i) => (b.type === 'h2' ? [i] : []));
  return heads.map((head, k) => {
    const last = (heads[k + 1] ?? blocks.length) - 1;
    const words = blocks.slice(head, last + 1).reduce((sum, b) => sum + blockWords(b), 0);
    return {
      head,
      last,
      title: (blocks[head].inlines ?? []).map((x) => x.text).join('').trim(),
      anchor: blocks[head].anchor,
      words,
      minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    };
  });
}

/** Uma seção dobrável (“Saiba mais”) dentro de um tópico: o título `###` seguido de `:::dobra`. */
export interface FoldRange {
  /** Posição do título (`h3`), que fica sempre à vista e abre e fecha o corpo. */
  head: number;
  /** Primeiro e último bloco do corpo (o que fica escondido quando dobrado). */
  first: number;
  last: number;
  title: string;
}

/** As seções dobráveis: do `###` marcado com `:::dobra` até o bloco antes do próximo título (`###` ou `##`). */
export function foldRanges(blocks: Block[]): FoldRange[] {
  const out: FoldRange[] = [];
  blocks.forEach((b, i) => {
    if (b.type !== 'fold' || blocks[i - 1]?.type !== 'h3') return;
    let last = i;
    while (last + 1 < blocks.length && blocks[last + 1].type !== 'h2' && blocks[last + 1].type !== 'h3') last++;
    out.push({ head: i - 1, first: i + 1, last, title: (blocks[i - 1].inlines ?? []).map((x) => x.text).join('').trim() });
  });
  return out;
}

/**
 * Quais blocos aparecem: os títulos sempre; o resto de um tópico só quando ele está aberto; e, dentro de um tópico aberto,
 * o corpo de uma seção dobrável só quando ela está aberta (`openFolds` guarda a posição do título dela).
 */
export function visibleBlocks(
  sections: TopicSection[],
  count: number,
  open: ReadonlySet<number>,
  folds: FoldRange[] = [],
  openFolds: ReadonlySet<number> = new Set(),
): boolean[] {
  const shown = Array<boolean>(count).fill(true);
  sections.forEach((s, n) => {
    if (open.has(n)) return;
    for (let i = s.head + 1; i <= s.last; i++) shown[i] = false;
  });
  for (const f of folds) {
    if (openFolds.has(f.head)) continue;
    for (let i = f.first; i <= f.last; i++) shown[i] = false;
  }
  return shown;
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));

/** Progresso de leitura (0 a 1) de quem está no tópico `n`, `within` (0 a 1) dentro dele. */
export function readingFraction(sections: TopicSection[], n: number, within: number): number {
  const total = sections.reduce((sum, s) => sum + s.words, 0);
  if (!total || !sections[n]) return 0;
  const before = sections.slice(0, n).reduce((sum, s) => sum + s.words, 0);
  return clamp((before + clamp(within) * sections[n].words) / total);
}

/** O contrário: em que tópico e em que ponto dele está um progresso de leitura (0 a 1). */
export function locateTopic(sections: TopicSection[], fraction: number): { topic: number; within: number } {
  const total = sections.reduce((sum, s) => sum + s.words, 0);
  let rest = clamp(fraction) * total;
  for (let n = 0; n < sections.length; n++) {
    const words = sections[n].words;
    if (rest <= words || n === sections.length - 1) return { topic: n, within: words ? clamp(rest / words) : 0 };
    rest -= words;
  }
  return { topic: 0, within: 0 };
}
