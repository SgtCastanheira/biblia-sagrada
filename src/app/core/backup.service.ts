import { Injectable, signal } from '@angular/core';
import { todayKey } from './dates';
import { saveLocal } from './storage.service';

const PREFIX = 'biblia.';
const LAST_BACKUP_KEY = 'biblia.backup.last';

interface BackupFile {
  app: 'biblia-sagrada';
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

/** Exporta e importa todos os dados do app guardados neste aparelho. */
@Injectable({ providedIn: 'root' })
export class BackupService {
  readonly lastBackup = signal<string | null>(this.read(LAST_BACKUP_KEY));

  private collect(): BackupFile {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX) && key !== LAST_BACKUP_KEY) {
        data[key] = localStorage.getItem(key) ?? '';
      }
    }
    return { app: 'biblia-sagrada', version: 1, exportedAt: new Date().toISOString(), data };
  }

  /** Gera o arquivo e compartilha (celular) ou baixa (computador). */
  async export(): Promise<void> {
    const backup = this.collect();
    const name = `biblia-backup-${todayKey()}.json`;
    const file = new File([JSON.stringify(backup, null, 1)], name, { type: 'application/json' });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Backup da Bíblia Sagrada' });
        this.markDone();
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }
    const url = URL.createObjectURL(file);
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    link.click();
    URL.revokeObjectURL(url);
    this.markDone();
  }

  /** Lê um arquivo de backup. Lança erro se o arquivo não for válido. */
  async parse(file: File): Promise<BackupFile> {
    let backup: BackupFile;
    try {
      backup = JSON.parse(await file.text());
    } catch {
      throw new Error('O arquivo não é um backup válido.');
    }
    if (backup?.app !== 'biblia-sagrada' || typeof backup.data !== 'object' || backup.data === null) {
      throw new Error('Este arquivo não é um backup da Bíblia Sagrada.');
    }
    if (!Object.values(backup.data).every((value) => typeof value === 'string')) {
      throw new Error('Este backup está danificado: nada foi alterado.');
    }
    return backup;
  }

  /**
   * Substitui os dados atuais pelos do backup e recarrega o app.
   * Se o backup não couber, devolve os dados que estavam aqui e lança erro: nada se perde no meio do caminho.
   */
  restore(backup: BackupFile): void {
    const ownKeys = () => Object.keys(localStorage).filter((k) => k.startsWith(PREFIX) && k !== LAST_BACKUP_KEY);
    const previous = ownKeys().map((key) => [key, localStorage.getItem(key) ?? ''] as const);
    // Apaga antes de gravar para liberar o espaço dos dados antigos
    ownKeys().forEach((key) => localStorage.removeItem(key));
    try {
      for (const [key, value] of Object.entries(backup.data)) {
        if (key.startsWith(PREFIX) && key !== LAST_BACKUP_KEY) localStorage.setItem(key, value);
      }
    } catch {
      ownKeys().forEach((key) => localStorage.removeItem(key));
      previous.forEach(([key, value]) => localStorage.setItem(key, value));
      throw new Error('O backup não coube neste aparelho. Os dados que estavam aqui foram mantidos.');
    }
    location.reload();
  }

  summary(backup: BackupFile): string {
    const count = (key: string, pick: (v: unknown) => number) => {
      try {
        return pick(JSON.parse(backup.data[key] ?? 'null'));
      } catch {
        return 0;
      }
    };
    const favorites = count('biblia.favorites', (v) => (Array.isArray(v) ? v.length : 0));
    const devotionals = count('biblia.devotional.entries', (v) => (v ? Object.keys(v).length : 0));
    const prayers = count('biblia.devotional.prayers', (v) => (Array.isArray(v) ? v.length : 0));
    const notes = count('biblia.notes.items', (v) => (Array.isArray(v) ? v.length : 0));
    const sermons = count('biblia.sermons.items', (v) => (Array.isArray(v) ? v.length : 0));
    const date = new Date(backup.exportedAt).toLocaleDateString('pt-BR');
    return `Backup de ${date}: ${notes} anotações, ${sermons} sermões, ${favorites} favoritos, ${devotionals} devocionais e ${prayers} pedidos de oração.`;
  }

  private markDone(): void {
    const now = new Date().toISOString();
    saveLocal(LAST_BACKUP_KEY, JSON.stringify(now));
    this.lastBackup.set(now);
  }

  private read(key: string): string | null {
    try {
      return JSON.parse(localStorage.getItem(key) ?? 'null');
    } catch {
      return null;
    }
  }
}
