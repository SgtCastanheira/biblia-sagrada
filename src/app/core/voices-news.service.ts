import { computed, Injectable, isDevMode, signal } from '@angular/core';
import { saveLocal } from './storage.service';

const KEY = 'biblia.vozes.vistas';

function load(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Matéria nova no jornal Novas Vozes da Palavra: sermões e pregações à mostra que a pessoa ainda não abriu neste aparelho.
 * Enquanto houver, o ícone do jornal na barra de baixo pisca. O que foi aberto fica em `biblia.vozes.vistas` (entra no backup).
 */
@Injectable({ providedIn: 'root' })
export class VoicesNewsService {
  private readonly seen = signal<string[]>(load());
  /**
   * Quais matérias estão à mostra. Os dados dos sermões (notas, textos em seis idiomas) pesam mais que o resto do app e só a página do
   * jornal precisa deles inteiros: aqui chegam depois da abertura, num pacote à parte, para não entrar no pacote inicial.
   */
  private readonly shown = signal<string[]>([]);
  /** Quantas matérias à mostra ainda não foram abertas. */
  readonly unread = computed(() => this.shown().filter((id) => !this.seen().includes(id)).length);

  constructor() {
    void import('./guest-sermons').then((m) => this.shown.set(m.visibleGuestSermons(isDevMode()).map((s) => s.id)));
  }

  isUnread(id: string): boolean {
    return !this.seen().includes(id);
  }

  markSeen(id: string): void {
    if (!this.isUnread(id)) return;
    const next = [...this.seen(), id];
    this.seen.set(next);
    saveLocal(KEY, JSON.stringify(next));
  }
}
