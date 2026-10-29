import { CONTEXT_EVENTS, ChurchNote, ContextKind } from './ad-context';
import { Inline, parseBlocks } from './rich-text-parser';

/**
 * Linha do tempo nacional da Assembleia de Deus: junta, em ordem cronológica, as linhas do tempo escritas
 * em cada estado (public/conteudo/ad-estados/<uf>.md, blocos ":::tempo") e o contexto do Brasil e do mundo.
 * É código puro (sem Angular) para ser testado nos testes de lógica.
 */

export interface TimelineItem {
  lane: 'igreja' | 'contexto';
  year: number;
  /** Data como foi escrita ("c. 1948", "jun. 1911"). */
  when: string;
  title: string;
  text: Inline[];
  /** Estado da história (siglas minúsculas), nos fatos da igreja. */
  uf?: string;
  kind?: ContextKind;
  /** Estados a que o fato do contexto se aplica, se for restrito. */
  states?: string[];
  scopes?: string[];
  /** O que a igreja viveu nesse tempo, nos fatos do contexto. */
  church?: ChurchNote;
}

/** O primeiro ano de quatro dígitos de um texto de data ("1922–1924", "c. 1948", "jun. 1911"), ou null. */
export function yearOf(date: string): number | null {
  const m = date.match(/\b(1[5-9]\d\d|20\d\d)\b/);
  return m ? Number(m[1]) : null;
}

/** Fatos da igreja: os blocos ":::tempo" dos textos dos estados. */
export function churchItems(texts: Record<string, string>): TimelineItem[] {
  const out: TimelineItem[] = [];
  for (const [uf, text] of Object.entries(texts)) {
    for (const block of parseBlocks(text)) {
      if (block.type !== 'timeline') continue;
      for (const e of block.events ?? []) {
        const year = yearOf(e.date);
        if (year === null || year < 1900) continue;
        out.push({ lane: 'igreja', year, when: e.date, title: e.title, text: e.text, uf });
      }
    }
  }
  return out;
}

/** Fatos do contexto, no mesmo formato. */
export function contextItems(): TimelineItem[] {
  return CONTEXT_EVENTS.filter((e) => e.from >= 1900).map((e) => ({
    lane: 'contexto' as const,
    year: e.from,
    when: e.when,
    title: e.title,
    text: [{ t: 'text' as const, text: e.text }],
    kind: e.kind,
    states: e.states,
    scopes: e.scope,
    church: e.church,
  }));
}

/** Tudo junto, do mais antigo para o mais novo; no mesmo ano, a igreja vem antes do contexto. */
export function buildTimeline(texts: Record<string, string>): TimelineItem[] {
  return [...churchItems(texts), ...contextItems()].sort(
    (a, b) => a.year - b.year || (a.lane === b.lane ? 0 : a.lane === 'igreja' ? -1 : 1) || a.title.localeCompare(b.title, 'pt-BR'),
  );
}

/** Agrupa os fatos por ano, para mostrar um ano de cada vez. */
export function groupByYear(items: TimelineItem[]): { year: number; church: TimelineItem[]; context: TimelineItem[] }[] {
  const years = new Map<number, { year: number; church: TimelineItem[]; context: TimelineItem[] }>();
  for (const it of items) {
    const row = years.get(it.year) ?? { year: it.year, church: [], context: [] };
    (it.lane === 'igreja' ? row.church : row.context).push(it);
    years.set(it.year, row);
  }
  return [...years.values()].sort((a, b) => a.year - b.year);
}
