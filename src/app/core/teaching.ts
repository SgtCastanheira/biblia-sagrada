/**
 * Apoio ao professor: os módulos por idade (IBUC e EBD) usam as mesmas turmas, aulas e telas.
 * As aulas não reproduzem revistas nem PDFs: trazem curiosidades, contexto histórico, dinâmicas,
 * perguntas e aplicação, para ajudar quem tem pouco tempo para preparar a aula.
 */
import { EBD_SUPPORT_CLASSES, EBD_SUPPORT_LESSONS } from './ebd-support';
import { IBUC_CLASSES, IBUC_FULL_NAME, IBUC_LESSONS, IBUC_NAME, IBUC_UNIT } from './ibuc';
import type { SourceTopic } from './sources';

export interface IbucClass {
  id: string;
  name: string;
  ages: string;
  icon: string;
  /** Como ensinar nesta idade (dicas para o professor). */
  tips: string[];
}

export type ActivityKind = 'brincadeira' | 'dinâmica' | 'trabalho manual' | 'dramatização' | 'música' | 'estudo de caso' | 'debate' | 'trabalho em grupo';

export interface IbucActivity {
  name: string;
  kind: ActivityKind;
  time: string;
  material: string;
  steps: string[];
  /** Turmas em que funciona melhor (ids); vazio = todas. */
  classes?: string[];
}

export interface IbucLesson {
  id: string;
  /** Turmas em que a aula aparece. */
  classes: string[];
  title: string;
  theme: string;
  refs: string;
  memoryVerse: string;
  /** Aula-modelo, para mostrar como as aulas aparecem. */
  example?: boolean;
  /** Trimestre da revista ("2026-4" = 4º trimestre de 2026) e número da lição nele. */
  quarter?: string;
  number?: number;
  /** Lembretes ao professor: o que preparar antes e o que não esquecer durante a aula (uma linha cada). */
  reminders?: string[];
  /** Como abrir a aula e prender a atenção nos primeiros minutos. */
  opening: string;
  curiosities: { title: string; text: string }[];
  /** Contexto histórico e cultural (texto com [[referências]]). */
  context: string;
  activities: IbucActivity[];
  questions: { q: string; ref?: string }[];
  application: string;
  /** Para aprofundar: estudos do próprio app ligados à lição (texto com [links](/rota) e [[referências]]). */
  deepen?: string;
}

export const ACTIVITY_ICONS: Record<ActivityKind, string> = {
  brincadeira: 'sports_esports',
  dinâmica: 'emoji_people',
  'trabalho manual': 'content_cut',
  dramatização: 'theater_comedy',
  música: 'music_note',
  'estudo de caso': 'cases',
  debate: 'forum',
  'trabalho em grupo': 'group_work',
};

export type ProgramId = 'ibuc' | 'ebd';

export interface TeachingProgram {
  id: ProgramId;
  /** Nome curto (título da tela). */
  name: string;
  /** Linha abaixo do nome. */
  subtitle: string;
  overline: string;
  /** Rota de início do módulo. */
  path: string;
  intro: string;
  /** O que o módulo não faz (direitos autorais). */
  disclaimer: string;
  activitiesTitle: string;
  sources: SourceTopic;
  /** Lições por trimestre na revista. */
  lessonsPerQuarter: number;
  classes: IbucClass[];
  lessons: IbucLesson[];
}

export const PROGRAMS: Record<ProgramId, TeachingProgram> = {
  ibuc: {
    id: 'ibuc',
    name: IBUC_NAME,
    subtitle: `${IBUC_FULL_NAME} — ${IBUC_UNIT}`,
    overline: `Apoio ao professor · ${IBUC_UNIT}`,
    path: '/ibuc',
    intro: 'Curiosidades, contexto histórico e brincadeiras para cada tema, por idade, para ajudar o professor a preparar a aula mesmo com pouco tempo.',
    disclaimer: 'O app não reproduz a revista nem os PDFs do IBUC: use-os normalmente na sala. Aqui fica o apoio para aprofundar o tema.',
    activitiesTitle: 'Brincadeiras e dinâmicas',
    sources: 'ibuc',
    lessonsPerQuarter: 13,
    classes: IBUC_CLASSES,
    lessons: IBUC_LESSONS,
  },
  ebd: {
    id: 'ebd',
    name: 'EBD — Apoio ao professor',
    subtitle: 'Adolescentes, Jovens e Adultos',
    overline: 'Escola Bíblica Dominical',
    path: '/ebd/apoio',
    intro: 'Para cada tema da revista: como abrir a aula, curiosidades, contexto histórico, dinâmicas para a idade da turma, perguntas e aplicação — para o professor que tem pouco tempo para preparar.',
    disclaimer: 'A revista é só a inspiração: o app não reproduz o texto das lições. Use a revista normalmente na sala; aqui fica o apoio para aprofundar o tema.',
    activitiesTitle: 'Dinâmicas e atividades',
    sources: 'ebd',
    lessonsPerQuarter: 13,
    classes: EBD_SUPPORT_CLASSES,
    lessons: EBD_SUPPORT_LESSONS,
  },
};

/** "2026-4" → 4º trimestre de 2026. */
export const quarterKey = (year: number, quarter: number) => `${year}-${quarter}`;
export const currentQuarterKey = () => {
  const now = new Date();
  return quarterKey(now.getFullYear(), Math.floor(now.getMonth() / 3) + 1);
};
export const quarterLabel = (key: string) => {
  const [year, quarter] = key.split('-');
  return `${quarter}º trimestre de ${year}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Data da lição `number` de um trimestre ("2026-4"): o primeiro domingo do trimestre mais sete dias por lição,
 * como nas revistas da EBD (4º trimestre de 2026: 4 de outubro a 27 de dezembro).
 */
export function lessonDate(key: string, number: number): Date {
  const [year, quarter] = key.split('-').map(Number);
  const first = new Date(year, (quarter - 1) * 3, 1);
  first.setDate(first.getDate() + ((7 - first.getDay()) % 7) + (number - 1) * 7);
  return first;
}

/** "domingo, 1 de novembro". */
export const lessonDateLabel = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

/** Quantos dias antes da aula o número da lição passa a piscar para chamar a atenção do professor. */
export const DUE_DAYS = 7;

/** A lição "da vez": a primeira que ainda vai acontecer, se cair nos próximos 7 dias (hoje conta). */
export function dueLessonNumber(key: string, total: number, today: Date = new Date()): number | null {
  const now = startOfDay(today).getTime();
  for (let n = 1; n <= total; n++) {
    const days = Math.round((startOfDay(lessonDate(key, n)).getTime() - now) / 86_400_000);
    if (days >= 0) return days <= DUE_DAYS ? n : null;
  }
  return null;
}

/** Aula de apoio de uma lição da revista (turma, trimestre e número). */
export const supportLesson = (program: TeachingProgram, classId: string, quarter: string, number: number) =>
  program.lessons.find((l) => !l.example && l.quarter === quarter && l.number === number && l.classes.includes(classId));

/**
 * Trimestres de uma turma, cada um com as lições 1 a N (a aula, quando já existe).
 * O trimestre atual aparece sempre; os outros, quando têm aulas.
 */
export function quartersOf(program: TeachingProgram, classId: string) {
  const current = currentQuarterKey();
  const keys = new Set([current, ...program.lessons.filter((l) => !l.example && l.quarter && l.classes.includes(classId)).map((l) => l.quarter!)]);
  return [...keys]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    .map((key) => {
      const due = dueLessonNumber(key, program.lessonsPerQuarter);
      return {
        key,
        label: quarterLabel(key),
        current: key === current,
        lessons: Array.from({ length: program.lessonsPerQuarter }, (_, i) => ({
          number: i + 1,
          lesson: supportLesson(program, classId, key, i + 1),
          date: lessonDate(key, i + 1),
          due: due === i + 1,
        })),
      };
    });
}

export const findProgram = (id: string | undefined) => PROGRAMS[(id as ProgramId) ?? 'ibuc'] ?? PROGRAMS.ibuc;
export const lessonsOfClass = (program: TeachingProgram, classId: string) => program.lessons.filter((l) => l.classes.includes(classId));
