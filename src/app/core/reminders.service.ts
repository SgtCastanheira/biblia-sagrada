import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { addDays, todayKey } from './dates';
import { NotifyService } from './notify.service';
import { dueReminder, Reminder, reminderTime, remindersFor } from './reminders';
import { SettingsService } from './settings.service';

const STORAGE_KEY = 'biblia.lembretes';
/** Cache que o service worker (public/sw.js) lê para avisar com o app fechado. */
const CACHE = 'biblia-lembretes';
const SYNC_TAG = 'lembretes';

/** Sincronização periódica (Chrome e Edge, com o app instalado): ainda não está nos tipos do TypeScript. */
interface PeriodicSync {
  register(tag: string, options: { minInterval: number }): Promise<void>;
  unregister(tag: string): Promise<void>;
}

const cacheUrl = (name: string) => new URL(`lembretes/${name}`, document.baseURI).href;
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/**
 * Três lembretes por dia para orar, ler e pensar em Deus. Com o app aberto, o da vez aparece na hora (aviso no
 * app e, se as notificações estiverem ativas, na tela do aparelho). Com o app fechado, o service worker usa a
 * agenda dos próximos dias quando o sistema o acorda (sincronização periódica; quem decide quando é o navegador).
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly notify = inject(NotifyService);
  private readonly settings = inject(SettingsService);
  readonly enabled = signal<boolean>(this.load());
  /** Relógio dos lembretes: anda a cada verificação (uma por minuto). */
  private readonly now = signal(new Date());
  /** O lembrete da vez (o último cujo horário já passou hoje), para o cartão da tela inicial. */
  readonly current = computed(() => {
    if (!this.enabled()) return null;
    const now = this.now();
    return dueReminder(remindersFor(todayKey(), this.readUrl()), hhmm(now));
  });
  private syncedDay = '';

  constructor() {
    effect(() => {
      const on = this.enabled() && this.notify.systemEnabled() && this.notify.permission() === 'granted';
      this.save(this.enabled());
      untracked(() => void this.syncBackground(on));
    });
  }

  /** Os três de hoje, para mostrar nos Ajustes. */
  today(): Reminder[] {
    return remindersFor(todayKey(), this.readUrl());
  }

  /** Chamado a cada minuto: mostra o lembrete da vez, uma vez só; os que passaram sem aviso não voltam. */
  async check(): Promise<void> {
    if (!this.enabled()) return;
    const day = todayKey();
    if (this.syncedDay !== day) void this.syncBackground(this.notify.systemEnabled() && this.notify.permission() === 'granted');
    const list = remindersFor(day, this.readUrl());
    const now = new Date();
    this.now.set(now);
    const due = dueReminder(list, hhmm(now));
    if (!due) return;
    for (const r of list.filter((x) => x.slot < due.slot)) this.notify.once(`lembrete-${r.id}`, () => undefined);
    // Se o service worker já avisou com o app fechado, não repete aqui dentro
    if ((await this.shownByWorker()).includes(due.id)) {
      this.notify.once(`lembrete-${due.id}`, () => undefined);
      return;
    }
    this.notify.once(`lembrete-${due.id}`, () => {
      this.notify.banner(`${due.title} ${due.body}`, due.action, due.url);
      void this.notify.system(due.title, due.body, due.url, 'lembrete');
      void this.markShown(due.id);
    });
  }

  private readUrl(): string {
    const last = this.settings.lastRead();
    return `/ler/${last?.bookId ?? 'JHN'}/${last?.chapter ?? 1}`;
  }

  /** Agenda dos próximos dias para o service worker e pedido de sincronização periódica (onde existe). */
  private async syncBackground(on: boolean): Promise<void> {
    if (!('caches' in window)) return;
    this.syncedDay = todayKey();
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      const periodic = (registration as unknown as { periodicSync?: PeriodicSync } | undefined)?.periodicSync;
      if (!on) {
        await periodic?.unregister(SYNC_TAG);
        await caches.delete(CACHE);
        return;
      }
      const start = this.syncedDay;
      const agenda = [0, 1, 2, 3].flatMap((offset) => {
        const key = addDays(start, offset);
        return remindersFor(key, this.readUrl()).map((r) => ({
          id: r.id, at: reminderTime(key, r.at), title: r.title, body: r.body, url: r.url.replace(/^\//, ''),
        }));
      });
      const cache = await caches.open(CACHE);
      await cache.put(cacheUrl('agenda.json'), new Response(JSON.stringify(agenda), { headers: { 'Content-Type': 'application/json' } }));
      if (!periodic) return;
      const state = await navigator.permissions.query({ name: 'periodic-background-sync' as PermissionName });
      if (state.state === 'granted') await periodic.register(SYNC_TAG, { minInterval: 60 * 60 * 1000 });
    } catch {
      // navegador sem cache, sem service worker ou sem sincronização periódica
    }
  }

  private async shownByWorker(): Promise<string[]> {
    if (!('caches' in window)) return [];
    try {
      const response = await (await caches.open(CACHE)).match(cacheUrl('mostrados.json'));
      return response ? ((await response.json()) as string[]) : [];
    } catch {
      return [];
    }
  }

  private async markShown(id: string): Promise<void> {
    if (!('caches' in window)) return;
    try {
      const shown = await this.shownByWorker();
      const cache = await caches.open(CACHE);
      await cache.put(cacheUrl('mostrados.json'), new Response(JSON.stringify([...shown, id].slice(-40))));
    } catch {
      // sem cache
    }
  }

  private load(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as boolean) : true;
    } catch {
      return true;
    }
  }

  private save(value: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // armazenamento indisponível
    }
  }
}
