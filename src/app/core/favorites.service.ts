import { computed, effect, Injectable, signal } from '@angular/core';
import { FavoriteVerse, HighlightColor, VerseRef } from './models';

const STORAGE_KEY = 'biblia.favorites';

export const HIGHLIGHT_COLORS: { id: HighlightColor; label: string }[] = [
  { id: 'yellow', label: 'Amarelo' },
  { id: 'green', label: 'Verde' },
  { id: 'blue', label: 'Azul' },
  { id: 'pink', label: 'Rosa' },
  { id: 'purple', label: 'Roxo' },
];

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly favorites = signal<FavoriteVerse[]>(this.load());
  private readonly byKey = computed(() => new Map(this.favorites().map((f) => [this.key(f), f])));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favorites()));
      } catch {
        // armazenamento indisponível
      }
    });
  }

  get(ref: VerseRef): FavoriteVerse | undefined {
    return this.byKey().get(this.key(ref));
  }

  /** Salva (ou muda a cor de) um versículo. */
  save(ref: VerseRef, text: string, color: HighlightColor): void {
    const key = this.key(ref);
    const existing = this.byKey().get(key);
    if (existing) {
      this.favorites.update((list) => list.map((f) => (this.key(f) === key ? { ...f, color } : f)));
    } else {
      this.favorites.update((list) => [{ ...ref, text, color, savedAt: Date.now() }, ...list]);
    }
  }

  remove(ref: VerseRef): void {
    const key = this.key(ref);
    this.favorites.update((list) => list.filter((f) => this.key(f) !== key));
  }

  private key(f: VerseRef): string {
    return `${f.versionId}:${f.bookId}:${f.chapter}:${f.verse}`;
  }

  private load(): FavoriteVerse[] {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as FavoriteVerse[];
      return list.map((f) => ({ ...f, color: f.color ?? 'yellow' }));
    } catch {
      return [];
    }
  }
}
