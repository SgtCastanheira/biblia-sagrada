import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { findBook } from './books';
import { addDays, dayNumber, todayKey } from './dates';
import { EbdService } from './ebd.service';
import { NotifyService } from './notify.service';
import { SettingsService } from './settings.service';
import { saveLocal } from './storage.service';

export type DevotionalBlock = 'observation' | 'application' | 'prayer' | 'gratitude' | 'worship' | 'requests';

export interface DevotionalEntry {
  date: string;
  passage: string;
  keyVerse: string;
  observation: string;
  application: string;
  prayer: string;
  gratitude: string[];
  worship: string;
  done: boolean;
  updatedAt: number;
}

export interface PrayerRequest {
  id: string;
  text: string;
  createdAt: number;
  answeredAt?: number;
}

export interface DevotionalConfig {
  blocks: DevotionalBlock[];
  /** Horário do lembrete diário (HH:MM) ou null. */
  reminder: string | null;
}

export interface PassageSuggestion {
  label: string;
  ref: string;
  icon: string;
}

/** Etapas disponíveis, na ordem em que aparecem. */
export const DEVOTIONAL_BLOCKS: { id: DevotionalBlock; title: string; question: string; icon: string }[] = [
  { id: 'observation', title: 'Observar', question: 'O que o texto diz? Quem fala, para quem, em que situação?', icon: 'visibility' },
  { id: 'application', title: 'Aplicar', question: 'O que Deus está me ensinando? O que vou praticar hoje?', icon: 'directions_walk' },
  { id: 'prayer', title: 'Orar', question: 'Escreva sua oração a partir do que leu.', icon: 'volunteer_activism' },
  { id: 'requests', title: 'Pedidos de oração', question: 'Ore pelos seus pedidos em aberto.', icon: 'favorite' },
  { id: 'gratitude', title: 'Gratidão', question: 'Três motivos de gratidão hoje.', icon: 'sunny' },
  { id: 'worship', title: 'Louvor do dia', question: 'Uma música para acompanhar o seu dia.', icon: 'music_note' },
];

const DEFAULT_CONFIG: DevotionalConfig = {
  blocks: ['observation', 'application', 'prayer', 'gratitude'],
  reminder: '07:00',
};

const STORAGE_KEY = 'biblia.devotional';

@Injectable({ providedIn: 'root' })
export class DevotionalService {
  private readonly notify = inject(NotifyService);
  private readonly settings = inject(SettingsService);
  private readonly ebd = inject(EbdService);

  readonly entries = signal<Record<string, DevotionalEntry>>(this.load('entries', {}));
  readonly prayers = signal<PrayerRequest[]>(this.load('prayers', []));
  readonly config = signal<DevotionalConfig>({ ...DEFAULT_CONFIG, ...this.load('config', {}) });
  private readonly today = signal(todayKey());

  readonly todayEntry = computed<DevotionalEntry | null>(() => this.entries()[this.today()] ?? null);
  readonly openPrayers = computed(() => this.prayers().filter((p) => !p.answeredAt));
  readonly answeredPrayers = computed(() => this.prayers().filter((p) => p.answeredAt));

  readonly history = computed(() =>
    Object.values(this.entries())
      .filter((e) => e.passage || e.done)
      .sort((a, b) => b.date.localeCompare(a.date)),
  );

  /** Dias seguidos com devocional concluído (até hoje ou ontem). */
  readonly streak = computed(() => {
    const entries = this.entries();
    let day = entries[this.today()]?.done ? this.today() : addDays(this.today(), -1);
    let count = 0;
    while (entries[day]?.done) {
      count++;
      day = addDays(day, -1);
    }
    return count;
  });

  /** Os últimos 7 dias, para a faixa da semana. */
  readonly week = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const date = addDays(this.today(), i - 6);
      return { date, done: !!this.entries()[date]?.done, today: date === this.today() };
    }),
  );

  readonly suggestions = computed<PassageSuggestion[]>(() => {
    const list: PassageSuggestion[] = [];
    const today = this.today();

    for (const lesson of this.ebd.lessons()) {
      const index = this.ebd.dailyDates(lesson).indexOf(today);
      if (index >= 0 && lesson.daily[index]) {
        list.push({ label: `Leitura da EBD · Lição ${lesson.number}`, ref: lesson.daily[index], icon: 'school' });
      }
    }

    const last = this.settings.lastRead();
    const book = last && findBook(last.bookId);
    if (book) {
      const next = Math.min(last.chapter + 1, book.chapters);
      list.push({ label: 'Continuar leitura', ref: `${book.name} ${next}`, icon: 'import_contacts' });
    }

    list.push({ label: 'Salmo do dia', ref: `Salmos ${(dayNumber() % 150) + 1}`, icon: 'music_note' });
    list.push({ label: 'Provérbio do dia', ref: `Provérbios ${new Date().getDate()}`, icon: 'lightbulb' });
    return list;
  });

  constructor() {
    effect(() => this.save('entries', this.entries()));
    effect(() => this.save('prayers', this.prayers()));
    effect(() => this.save('config', this.config()));
  }

  entry(date: string): DevotionalEntry {
    return (
      this.entries()[date] ?? {
        date,
        passage: '',
        keyVerse: '',
        observation: '',
        application: '',
        prayer: '',
        gratitude: ['', '', ''],
        worship: '',
        done: false,
        updatedAt: 0,
      }
    );
  }

  update(date: string, patch: Partial<DevotionalEntry>): void {
    this.entries.update((all) => ({ ...all, [date]: { ...this.entry(date), ...patch, updatedAt: Date.now() } }));
  }

  remove(date: string): void {
    this.entries.update(({ [date]: _, ...rest }) => rest);
  }

  addPrayer(text: string): void {
    const clean = text.trim();
    if (!clean) return;
    this.prayers.update((list) => [{ id: crypto.randomUUID(), text: clean, createdAt: Date.now() }, ...list]);
  }

  toggleAnswered(id: string): void {
    this.prayers.update((list) =>
      list.map((p) => (p.id === id ? { ...p, answeredAt: p.answeredAt ? undefined : Date.now() } : p)),
    );
  }

  removePrayer(id: string): void {
    this.prayers.update((list) => list.filter((p) => p.id !== id));
  }

  setBlocks(blocks: DevotionalBlock[]): void {
    const ordered = DEVOTIONAL_BLOCKS.map((b) => b.id).filter((id) => blocks.includes(id));
    this.config.update((c) => ({ ...c, blocks: ordered }));
  }

  setReminder(time: string | null): void {
    this.config.update((c) => ({ ...c, reminder: time }));
  }

  /** Lembrete diário no horário escolhido, se o devocional de hoje ainda não foi feito. */
  check(): void {
    this.today.set(todayKey());
    const reminder = this.config().reminder;
    if (!reminder || this.todayEntry()?.done) return;
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (current < reminder) return;
    const streak = this.streak();
    const body = streak ? `Mantenha sua sequência de ${streak} dia${streak > 1 ? 's' : ''}.` : 'Separe um momento com Deus hoje.';
    this.notify.once(`devocional-${this.today()}`, () => {
      this.notify.banner(`Hora do devocional. ${body}`, 'Começar', '/devocional/hoje');
      this.notify.system('Hora do devocional', body, '/devocional/hoje');
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
    saveLocal(`${STORAGE_KEY}.${key}`, JSON.stringify(value));
  }
}
