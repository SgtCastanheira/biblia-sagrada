import { computed, effect, Injectable, signal } from '@angular/core';
import { findArticle } from './library';
import { type Trail, trailArticleIds } from './trails';

const STORAGE_KEY = 'biblia.historias';

/** Leitura de uma história: onde a pessoa parou, até onde já chegou e se terminou. */
interface Entry {
  /** Onde parou (fração do texto, de 0 a 1). */
  at: number;
  /** Até onde já leu (a maior fração). */
  max: number;
  done?: boolean;
  /** Quando leu pela última vez (ms). */
  t: number;
}

/** A partir daqui a história conta como lida (o fim do texto já apareceu na tela). */
export const DONE_AT = 0.97;

/**
 * Histórias lidas: guarda, no aparelho, onde a pessoa parou em cada artigo e quais já terminou. Serve para
 * "continuar de onde parou", para o check nas listas e para o progresso de cada trilha. Entra no backup.
 */
@Injectable({ providedIn: 'root' })
export class StoryProgressService {
  private readonly entries = signal<Record<string, Entry>>(this.load());

  /** A história começada mais recente, para a tela inicial ("Continuar a história"). */
  readonly unfinished = computed(() => {
    const open = Object.entries(this.entries())
      .filter(([id, e]) => !e.done && e.max >= 0.05 && findArticle(id))
      .sort((a, b) => b[1].t - a[1].t)[0];
    return open ? { article: findArticle(open[0])!, fraction: open[1].max } : null;
  });

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries()));
      } catch {
        // armazenamento indisponível
      }
    });
  }

  isDone(id: string): boolean {
    return !!this.entries()[id]?.done;
  }

  /** Até onde já leu (0 a 1). */
  fraction(id: string): number {
    const e = this.entries()[id];
    return e?.done ? 1 : (e?.max ?? 0);
  }

  /** Onde parou da última vez, se ainda não terminou (para "continuar de onde parou"). */
  resumeAt(id: string): number | null {
    const e = this.entries()[id];
    return e && !e.done && e.at >= 0.05 && e.at < DONE_AT ? e.at : null;
  }

  /** Registra onde a pessoa está no texto; ao chegar ao fim, a história fica marcada como lida. */
  record(id: string, at: number): void {
    const fraction = Math.min(1, Math.max(0, at));
    const old = this.entries()[id];
    const max = Math.max(old?.max ?? 0, fraction);
    const done = !!old?.done || max >= DONE_AT;
    if (old && Math.abs(old.at - fraction) < 0.02 && old.done === done) return;
    this.entries.update((all) => ({ ...all, [id]: { at: fraction, max, done: done || undefined, t: Date.now() } }));
  }

  /**
   * Progresso de uma trilha: quantas lidas e qual é a próxima. A próxima segue a última história mexida:
   * se ela ficou pela metade, é ela; se terminou, a primeira não lida depois dela (e, no fim, volta ao começo).
   */
  trail(t: Trail): { done: number; total: number; next: string | null; started: boolean } {
    const ids = trailArticleIds(t);
    const all = this.entries();
    const done = ids.filter((id) => all[id]?.done).length;
    const touched = ids.filter((id) => all[id]?.done || (all[id]?.max ?? 0) >= 0.05);
    const recent = touched.sort((a, b) => all[b].t - all[a].t)[0];
    let next: string | null;
    if (recent && !all[recent].done) next = recent;
    else {
      const from = recent ? ids.indexOf(recent) + 1 : 0;
      next = [...ids.slice(from), ...ids.slice(0, from)].find((id) => !all[id]?.done) ?? null;
    }
    return { done, total: ids.length, next, started: !!recent };
  }

  private load(): Record<string, Entry> {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch {
      return {};
    }
  }
}
