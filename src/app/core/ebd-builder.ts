import type { ActivityKind, IbucLesson } from './teaching';

/**
 * Montador das aulas de apoio da EBD: cada turma escreve as 13 lições em forma compacta, e aqui elas viram `IbucLesson`.
 * O texto das aulas é próprio; da revista de cada turma só o tema da lição serve de guia.
 */
export interface CompactLesson {
  /** Número da lição no trimestre (1–13); sem número, a aula vai para "Outras aulas". */
  n?: number;
  slug: string;
  title: string;
  theme: string;
  refs: string;
  verse: string;
  reminders: string[];
  opening: string;
  /** Você sabia?: [título, texto]. */
  facts: [string, string][];
  context: string;
  /** Atividades: [tipo, nome, tempo, material, passos]. */
  acts: [ActivityKind, string, string, string, string[]][];
  /** Perguntas: texto ou [texto, referência]. */
  qs: (string | [string, string])[];
  life: string;
  more?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** "2026-4" → "4t26", como nos ids das aulas de Adultos e Jovens. */
const short = (quarter: string) => `${quarter.split('-')[1]}t${quarter.slice(2, 4)}`;

export function ebdLessons(turma: string, quarter: string, list: CompactLesson[]): IbucLesson[] {
  return list.map((c) => ({
    classes: [turma],
    quarter,
    ...(c.n ? { number: c.n } : {}),
    id: `${turma}-${short(quarter)}-${c.n ? pad(c.n) : 'extra'}-${c.slug}`,
    title: c.title,
    theme: c.theme,
    refs: c.refs,
    memoryVerse: c.verse,
    reminders: c.reminders,
    opening: c.opening,
    curiosities: c.facts.map(([title, text]) => ({ title, text })),
    context: c.context,
    activities: c.acts.map(([kind, name, time, material, steps]) => ({ kind, name, time, material, steps })),
    questions: c.qs.map((q) => (typeof q === 'string' ? { q } : { q: q[0], ref: q[1] })),
    application: c.life,
    ...(c.more ? { deepen: c.more } : {}),
  }));
}
