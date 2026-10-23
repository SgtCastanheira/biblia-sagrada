import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { addDays, fromKey, todayKey, toKey } from './dates';
import { NotifyService } from './notify.service';

export interface EbdLesson {
  number: number;
  /** Domingo da aula (AAAA-MM-DD). */
  date: string;
  title: string;
  goldenText: string;
  reading: string;
  /** Referências da leitura diária, de segunda a sábado. */
  daily: string[];
  dailyDone: boolean[];
  notes: string;
  questions: string;
  plan: string;
  done: boolean;
}

export interface EbdQuarter {
  year: number;
  quarter: number;
  className: string;
  theme: string;
  lessons: EbdLesson[];
}

export type LessonStatus = 'done' | 'today' | 'next' | 'past' | 'future';

export const EBD_CLASSES = ['Jovens', 'Adultos', 'Adolescentes', 'Juvenis', 'Pré-adolescentes', 'Juniores', 'Primários', 'Discipulando'];
export const LESSONS_PER_QUARTER = 13;
export const CPAD_URL = 'https://www.cpad.com.br';

const STORAGE_KEY = 'biblia.ebd';

/** Primeiro domingo a partir do início do trimestre. */
export function firstSunday(year: number, quarter: number): string {
  const date = new Date(year, (quarter - 1) * 3, 1);
  date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return toKey(date);
}

export function currentQuarter(): { year: number; quarter: number } {
  const now = new Date();
  return { year: now.getFullYear(), quarter: Math.floor(now.getMonth() / 3) + 1 };
}

@Injectable({ providedIn: 'root' })
export class EbdService {
  private readonly notify = inject(NotifyService);

  readonly quarter = signal<EbdQuarter | null>(this.load('quarter', null));
  readonly teacherMode = signal<boolean>(this.load('teacherMode', false));
  private readonly today = signal(todayKey());

  readonly lessons = computed(() => this.quarter()?.lessons ?? []);
  readonly doneCount = computed(() => this.lessons().filter((l) => l.done).length);

  /** Próxima aula (hoje ou a primeira data futura). */
  readonly nextLesson = computed(() => this.lessons().find((l) => l.date >= this.today()) ?? null);

  readonly title = computed(() => {
    const q = this.quarter();
    return q ? `${q.quarter}º Trimestre ${q.year} · ${q.className}` : '';
  });

  constructor() {
    effect(() => this.save('quarter', this.quarter()));
    effect(() => this.save('teacherMode', this.teacherMode()));
  }

  createQuarter(year: number, quarter: number, className: string, theme: string, startDate: string): void {
    const lessons: EbdLesson[] = Array.from({ length: LESSONS_PER_QUARTER }, (_, i) => ({
      number: i + 1,
      date: addDays(startDate, i * 7),
      title: '',
      goldenText: '',
      reading: '',
      daily: Array(6).fill(''),
      dailyDone: Array(6).fill(false),
      notes: '',
      questions: '',
      plan: '',
      done: false,
    }));
    this.quarter.set({ year, quarter, className, theme: theme.trim(), lessons });
  }

  updateQuarter(patch: Partial<Pick<EbdQuarter, 'theme' | 'className'>>): void {
    this.quarter.update((q) => (q ? { ...q, ...patch } : q));
  }

  deleteQuarter(): void {
    this.quarter.set(null);
  }

  lesson(number: number): EbdLesson | undefined {
    return this.lessons().find((l) => l.number === number);
  }

  updateLesson(number: number, patch: Partial<EbdLesson>): void {
    this.quarter.update((q) =>
      q ? { ...q, lessons: q.lessons.map((l) => (l.number === number ? { ...l, ...patch } : l)) } : q,
    );
  }

  setDaily(number: number, index: number, patch: { ref?: string; done?: boolean }): void {
    const lesson = this.lesson(number);
    if (!lesson) return;
    const daily = [...lesson.daily];
    const dailyDone = [...lesson.dailyDone];
    if (patch.ref !== undefined) daily[index] = patch.ref;
    if (patch.done !== undefined) dailyDone[index] = patch.done;
    this.updateLesson(number, { daily, dailyDone });
  }

  status(lesson: EbdLesson): LessonStatus {
    if (lesson.done) return 'done';
    if (lesson.date === this.today()) return 'today';
    if (lesson.number === this.nextLesson()?.number) return 'next';
    return lesson.date < this.today() ? 'past' : 'future';
  }

  /** Datas da leitura diária (segunda a sábado antes da aula). */
  dailyDates(lesson: EbdLesson): string[] {
    return Array.from({ length: 6 }, (_, i) => addDays(lesson.date, i - 6));
  }

  /** Lembrete: no sábado ("amanhã tem EBD") e no domingo da aula. */
  check(): void {
    this.today.set(todayKey());
    const lesson = this.nextLesson();
    if (!lesson) return;
    const today = this.today();
    const daysUntil = Math.round((fromKey(lesson.date).getTime() - fromKey(today).getTime()) / 86_400_000);
    if (daysUntil > 1) return;

    const when = daysUntil === 0 ? 'Hoje tem EBD' : 'Amanhã tem EBD';
    const name = `Lição ${lesson.number}${lesson.title ? ` — ${lesson.title}` : ''}`;
    const url = `/ebd/licao/${lesson.number}`;
    this.notify.once(`ebd-${lesson.date}-${daysUntil}`, () => {
      this.notify.banner(`${when}! ${name}`, 'Preparar', url);
      this.notify.system(when, name, url);
    });
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}.${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, value: unknown): void {
    try {
      localStorage.setItem(`${STORAGE_KEY}.${key}`, JSON.stringify(value));
    } catch {
      // armazenamento indisponível
    }
  }
}
