/** Promessas e profecias: texto original, contexto, cumprimento e as diferentes interpretações. */

export type ProphecyCategory = 'messias' | 'historia' | 'israel' | 'igreja' | 'fim';

/**
 * Situação, segundo a leitura cristã:
 * - cumprida: os cristãos em geral concordam que se cumpriu.
 * - parcial: cumpriu-se em parte e aguarda cumprimento final (“já e ainda não”).
 * - debatida: há interpretações bem diferentes sobre o cumprimento.
 * - futura: a maioria dos cristãos entende que ainda vai se cumprir.
 */
export type ProphecyStatus = 'cumprida' | 'parcial' | 'debatida' | 'futura';

/**
 * Como o Novo Testamento relaciona o texto ao cumprimento:
 * - direta: predição explícita do que aconteceria.
 * - tipologica: um fato ou pessoa do passado que prefigura Cristo (Mateus diz “para que se cumprisse”).
 * - dupla: um cumprimento próximo, na época do profeta, e um pleno, depois.
 */
export type ProphecyKind = 'direta' | 'tipologica' | 'dupla';

export interface Prophecy {
  id: string;
  title: string;
  category: ProphecyCategory;
  status: ProphecyStatus;
  kind: ProphecyKind;
  /** Texto da profecia. */
  ref: string;
  /** Quem, quando e onde. */
  given: string;
  context: string;
  fulfillment: { ref: string; text: string }[];
  explanation: string;
  /** Interpretações diferentes (quando há divergência). */
  views?: { name: string; text: string }[];
  /** Estudo aprofundado relacionado. */
  article?: string;
}

export const CATEGORIES: Record<ProphecyCategory, { name: string; icon: string }> = {
  messias: { name: 'O Messias', icon: 'star' },
  historia: { name: 'Reinos e nações', icon: 'account_balance' },
  israel: { name: 'Israel', icon: 'flag' },
  igreja: { name: 'Igreja e Espírito', icon: 'local_fire_department' },
  fim: { name: 'O fim dos tempos', icon: 'wb_twilight' },
};

export const STATUSES: Record<ProphecyStatus, { name: string; description: string }> = {
  cumprida: { name: 'Cumprida', description: 'Os cristãos em geral concordam que se cumpriu.' },
  parcial: { name: 'Já e ainda não', description: 'Cumpriu-se em parte e aguarda o cumprimento final.' },
  debatida: { name: 'Interpretações diferentes', description: 'Há leituras bem diferentes entre estudiosos e tradições cristãs.' },
  futura: { name: 'Futura', description: 'A maioria dos cristãos entende que ainda vai se cumprir.' },
};

export const KINDS: Record<ProphecyKind, string> = {
  direta: 'Predição direta',
  tipologica: 'Tipologia: o passado prefigura Cristo',
  dupla: 'Cumprimento duplo: próximo e pleno',
};
