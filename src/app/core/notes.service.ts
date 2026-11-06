import { computed, effect, Injectable, signal } from '@angular/core';
import { todayKey } from './dates';
import { saveLocal } from './storage.service';

export interface ServiceNote {
  id: string;
  date: string;
  type: string;
  title: string;
  preacher: string;
  refs: string;
  body: string;
  application: string;
  createdAt: number;
  updatedAt: number;
}

/** Indicações padrão (o usuário pode criar outras). */
export const DEFAULT_NOTE_TYPES = [
  'Culto de Ensino',
  'Culto de Domingo',
  'Culto de Oração',
  'Santa Ceia',
  'Escola Bíblica',
  'Congresso',
  'Outro',
];

const STORAGE_KEY = 'biblia.notes';

/** Anotações de cultos e pregações. */
@Injectable({ providedIn: 'root' })
export class NotesService {
  // Ao abrir o app, descarta anotações que ficaram totalmente em branco
  readonly notes = signal<ServiceNote[]>(this.load<ServiceNote[]>('items', []).filter((n) => !this.isEmpty(n)));
  readonly customTypes = signal<string[]>(this.load('types', []));

  readonly types = computed(() => [...DEFAULT_NOTE_TYPES.slice(0, -1), ...this.customTypes(), 'Outro']);

  /** Mais recentes primeiro (pela data do culto). */
  readonly sorted = computed(() =>
    [...this.notes()].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
  );

  /** Indicações que têm anotações, com a quantidade. */
  readonly usedTypes = computed(() => {
    const counts = new Map<string, number>();
    for (const n of this.notes()) counts.set(n.type, (counts.get(n.type) ?? 0) + 1);
    return this.types()
      .filter((t) => counts.has(t))
      .map((type) => ({ type, count: counts.get(type)! }));
  });

  constructor() {
    effect(() => this.save('items', this.notes()));
    effect(() => this.save('types', this.customTypes()));
  }

  /** Sugere a indicação pelo dia da semana: domingo → Culto de Domingo; demais → Culto de Ensino. */
  suggestedType(): string {
    return new Date().getDay() === 0 ? 'Culto de Domingo' : 'Culto de Ensino';
  }

  create(type = this.suggestedType()): ServiceNote {
    const now = Date.now();
    const note: ServiceNote = {
      id: crypto.randomUUID(),
      date: todayKey(),
      type,
      title: '',
      preacher: '',
      refs: '',
      body: '',
      application: '',
      createdAt: now,
      updatedAt: now,
    };
    this.notes.update((list) => [note, ...list]);
    return note;
  }

  get(id: string): ServiceNote | undefined {
    return this.notes().find((n) => n.id === id);
  }

  update(id: string, patch: Partial<ServiceNote>): void {
    this.notes.update((list) => list.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));
  }

  remove(id: string): void {
    this.notes.update((list) => list.filter((n) => n.id !== id));
  }

  addType(name: string): string | null {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (!clean) return null;
    const existing = this.types().find((t) => t.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;
    this.customTypes.update((list) => [...list, clean]);
    return clean;
  }

  removeType(name: string): void {
    this.customTypes.update((list) => list.filter((t) => t !== name));
    // Anotações dessa indicação passam para "Outro"
    this.notes.update((list) => list.map((n) => (n.type === name ? { ...n, type: 'Outro' } : n)));
  }

  /** Apaga anotações criadas e deixadas totalmente em branco. */
  discardIfEmpty(id: string): void {
    const n = this.get(id);
    if (n && this.isEmpty(n)) this.remove(id);
  }

  private isEmpty(n: ServiceNote): boolean {
    return !n.title.trim() && !n.preacher.trim() && !n.refs.trim() && !n.body.trim() && !n.application.trim();
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
