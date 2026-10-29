import { computed, Injectable, signal } from '@angular/core';

/** Quantas gravações falharam nesta visita (espaço cheio, armazenamento bloqueado): a tela avisa em vez de perder em silêncio. */
export const storageFailures = signal(0);

/** Grava no localStorage; se não conseguir, conta a falha e devolve false. */
export function saveLocal(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    storageFailures.update((n) => n + 1);
    return false;
  }
}

/** Dados que a pessoa escreveu e não voltam se o navegador apagar. */
const PERSONAL_KEYS = ['biblia.notes.', 'biblia.sermons.items', 'biblia.devotional.', 'biblia.favorites', 'biblia.ebd.'];

/** Limite usual do localStorage por site (Chrome, Firefox e Safari): cerca de 5 MB. */
export const LOCAL_LIMIT = 5 * 1024 * 1024;

/** Proteção dos dados guardados neste aparelho. */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /** true: o navegador não apaga os dados sem a pessoa pedir; false: pode apagar se faltar espaço; null: o navegador não informa. */
  readonly persisted = signal<boolean | null>(null);
  /** Espaço ocupado pelos dados do app no localStorage, em bytes. */
  readonly used = signal(0);
  readonly failures = storageFailures.asReadonly();
  readonly canProtect = computed(() => this.persisted() === false && !!navigator.storage?.persist);

  constructor() {
    this.measure();
    void this.start();
  }

  /** Pede ao navegador para não apagar os dados deste site. Devolve se ficou protegido. */
  async protect(): Promise<boolean> {
    try {
      const ok = (await navigator.storage?.persist?.()) ?? false;
      this.persisted.set(ok);
      return ok;
    } catch {
      return false;
    }
  }

  /** Conta o espaço dos dados do app (o localStorage guarda texto em UTF-16: 2 bytes por caractere). */
  measure(): void {
    let chars = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('biblia.')) chars += key.length + (localStorage.getItem(key)?.length ?? 0);
      }
    } catch {
      // armazenamento indisponível
    }
    this.used.set(chars * 2);
  }

  /** Na abertura: quem já escreveu algo (anotação, sermão, devocional, favorito, EBD) ganha a proteção sem precisar ir aos Ajustes. */
  private async start(): Promise<void> {
    try {
      const persisted = await navigator.storage?.persisted?.();
      if (persisted === undefined) return;
      this.persisted.set(persisted);
      if (!persisted && this.hasPersonalData()) await this.protect();
    } catch {
      // navegador sem a API de armazenamento
    }
  }

  private hasPersonalData(): boolean {
    try {
      return Object.keys(localStorage).some(
        (key) => PERSONAL_KEYS.some((p) => key.startsWith(p)) && !['[]', '{}', 'null'].includes(localStorage.getItem(key) ?? 'null'),
      );
    } catch {
      return false;
    }
  }
}
