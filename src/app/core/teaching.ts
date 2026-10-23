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
  /** Como abrir a aula e prender a atenção nos primeiros minutos. */
  opening: string;
  curiosities: { title: string; text: string }[];
  /** Contexto histórico e cultural (texto com [[referências]]). */
  context: string;
  activities: IbucActivity[];
  questions: { q: string; ref?: string }[];
  application: string;
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
    classes: EBD_SUPPORT_CLASSES,
    lessons: EBD_SUPPORT_LESSONS,
  },
};

export const findProgram = (id: string | undefined) => PROGRAMS[(id as ProgramId) ?? 'ibuc'] ?? PROGRAMS.ibuc;
export const lessonsOfClass = (program: TeachingProgram, classId: string) => program.lessons.filter((l) => l.classes.includes(classId));
