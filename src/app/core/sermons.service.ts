import { computed, effect, Injectable, signal } from '@angular/core';
import { todayKey } from './dates';

export type SermonKind = 'expositivo' | 'tematico' | 'textual' | 'livre';

export interface SermonPoint {
  id: string;
  title: string;
  refs: string;
  content: string;
  illustration: string;
  application: string;
}

export interface Sermon {
  id: string;
  kind: SermonKind;
  title: string;
  baseText: string;
  theme: string;
  occasion: string;
  date: string;
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
  appeal: string;
  ready: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Modelos de sermão: a estrutura e as orientações de cada parte. */
export const SERMON_KINDS: { id: SermonKind; name: string; icon: string; description: string; points: number; hints: string[] }[] = [
  {
    id: 'expositivo',
    name: 'Expositivo',
    icon: 'menu_book',
    description: 'Explica um trecho bíblico versículo por versículo. Os tópicos seguem a ordem do texto.',
    points: 3,
    hints: ['Primeira parte do texto (ex.: v. 1-3)', 'Segunda parte do texto (ex.: v. 4-7)', 'Terceira parte do texto (ex.: v. 8-11)'],
  },
  {
    id: 'tematico',
    name: 'Temático',
    icon: 'category',
    description: 'Desenvolve um tema (ex.: fé, perdão) com textos de várias partes da Bíblia.',
    points: 3,
    hints: ['O que a Bíblia diz sobre o tema', 'Um exemplo bíblico do tema', 'Como viver o tema hoje'],
  },
  {
    id: 'textual',
    name: 'Textual',
    icon: 'format_quote',
    description: 'Parte de um ou dois versículos: cada tópico nasce de uma palavra ou expressão do texto.',
    points: 3,
    hints: ['Primeira palavra-chave do versículo', 'Segunda palavra-chave', 'Terceira palavra-chave'],
  },
  {
    id: 'livre',
    name: 'Em branco',
    icon: 'edit',
    description: 'Comece do zero, com a sua própria estrutura.',
    points: 1,
    hints: [''],
  },
];

const STORAGE_KEY = 'biblia.sermons';
const WORDS_PER_MINUTE = 120;

const uid = () => crypto.randomUUID();
const emptyPoint = (): SermonPoint => ({ id: uid(), title: '', refs: '', content: '', illustration: '', application: '' });

/** Esboços de sermão criados pelo usuário. */
@Injectable({ providedIn: 'root' })
export class SermonsService {
  readonly sermons = signal<Sermon[]>(this.load());
  readonly sorted = computed(() => [...this.sermons()].sort((a, b) => b.updatedAt - a.updatedAt));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(`${STORAGE_KEY}.items`, JSON.stringify(this.sermons()));
      } catch {
        // armazenamento indisponível
      }
    });
  }

  create(kind: SermonKind): Sermon {
    const model = SERMON_KINDS.find((k) => k.id === kind)!;
    const now = Date.now();
    const sermon: Sermon = {
      id: uid(),
      kind,
      title: '',
      baseText: '',
      theme: '',
      occasion: new Date().getDay() === 0 ? 'Culto de Domingo' : 'Culto de Ensino',
      date: todayKey(),
      introduction: '',
      points: Array.from({ length: model.points }, emptyPoint),
      conclusion: '',
      appeal: '',
      ready: false,
      createdAt: now,
      updatedAt: now,
    };
    this.sermons.update((list) => [sermon, ...list]);
    return sermon;
  }

  get(id: string): Sermon | undefined {
    return this.sermons().find((s) => s.id === id);
  }

  update(id: string, patch: Partial<Sermon>): void {
    this.sermons.update((list) => list.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s)));
  }

  updatePoint(id: string, pointId: string, patch: Partial<SermonPoint>): void {
    const sermon = this.get(id);
    if (sermon) this.update(id, { points: sermon.points.map((p) => (p.id === pointId ? { ...p, ...patch } : p)) });
  }

  addPoint(id: string): void {
    const sermon = this.get(id);
    if (sermon) this.update(id, { points: [...sermon.points, emptyPoint()] });
  }

  removePoint(id: string, pointId: string): void {
    const sermon = this.get(id);
    if (sermon) this.update(id, { points: sermon.points.filter((p) => p.id !== pointId) });
  }

  movePoint(id: string, pointId: string, direction: -1 | 1): void {
    const sermon = this.get(id);
    if (!sermon) return;
    const points = [...sermon.points];
    const i = points.findIndex((p) => p.id === pointId);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= points.length) return;
    [points[i], points[j]] = [points[j], points[i]];
    this.update(id, { points });
  }

  duplicate(id: string): Sermon | undefined {
    const sermon = this.get(id);
    if (!sermon) return;
    const now = Date.now();
    const copy: Sermon = {
      ...structuredClone(sermon),
      id: uid(),
      title: sermon.title ? `${sermon.title} (cópia)` : '',
      ready: false,
      points: sermon.points.map((p) => ({ ...p, id: uid() })),
      createdAt: now,
      updatedAt: now,
    };
    this.sermons.update((list) => [copy, ...list]);
    return copy;
  }

  remove(id: string): void {
    this.sermons.update((list) => list.filter((s) => s.id !== id));
  }

  /** Apaga sermões criados e deixados totalmente em branco. */
  discardIfEmpty(id: string): void {
    const s = this.get(id);
    if (s && this.isEmpty(s)) this.remove(id);
  }

  /** Tempo estimado de pregação (minutos), contando ~120 palavras por minuto e a leitura dos textos. */
  minutes(s: Sermon): number {
    const text = [s.introduction, s.conclusion, s.appeal, ...s.points.flatMap((p) => [p.title, p.content, p.illustration, p.application])].join(' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    const readings = [s.baseText, ...s.points.map((p) => p.refs)].filter((r) => r.trim()).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE + readings * 0.75));
  }

  /** Texto completo do esboço (para compartilhar ou imprimir). */
  toText(s: Sermon): string {
    const lines = [
      s.title || 'Sermão sem título',
      s.baseText && `Texto base: ${s.baseText}`,
      s.theme && `Tema: ${s.theme}`,
      s.introduction && `\nINTRODUÇÃO\n${s.introduction}`,
      ...s.points.map((p, i) =>
        [
          `\n${i + 1}. ${p.title || 'Tópico ' + (i + 1)}${p.refs ? ` (${p.refs})` : ''}`,
          p.content,
          p.illustration && `Ilustração: ${p.illustration}`,
          p.application && `Aplicação: ${p.application}`,
        ]
          .filter(Boolean)
          .join('\n'),
      ),
      s.conclusion && `\nCONCLUSÃO\n${s.conclusion}`,
      s.appeal && `\nAPELO / ORAÇÃO\n${s.appeal}`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  private isEmpty(s: Sermon): boolean {
    const fields = [s.title, s.baseText, s.theme, s.introduction, s.conclusion, s.appeal, ...s.points.flatMap((p) => [p.title, p.refs, p.content, p.illustration, p.application])];
    return fields.every((f) => !f.trim());
  }

  private load(): Sermon[] {
    try {
      const list = JSON.parse(localStorage.getItem(`${STORAGE_KEY}.items`) ?? '[]') as Sermon[];
      return list.filter((s) => !this.isEmpty(s));
    } catch {
      return [];
    }
  }
}
