import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CURIOSITIES } from './curiosities';
import { NotifyService } from './notify.service';
import { dayNumber, todayKey } from './dates';

const STORAGE_KEY = 'biblia.curiosities';

@Injectable({ providedIn: 'root' })
export class CuriositiesService {
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  readonly all = CURIOSITIES;
  private readonly day = signal(dayNumber());
  readonly today = computed(() => CURIOSITIES[this.day() % CURIOSITIES.length]);

  readonly readIds = signal<string[]>(this.load());
  readonly unreadToday = computed(() => !this.readIds().includes(this.today().id));

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(`${STORAGE_KEY}.read`, JSON.stringify(this.readIds()));
      } catch {
        // armazenamento indisponível
      }
    });
  }

  isRead(id: string): boolean {
    return this.readIds().includes(id);
  }

  markRead(id: string): void {
    if (!this.isRead(id)) {
      this.readIds.update((ids) => [...ids, id]);
    }
  }

  /** Avisa sobre a curiosidade do dia (uma vez por dia). */
  check(): void {
    this.day.set(dayNumber());
    const curiosity = this.today();
    if (this.isRead(curiosity.id) || this.router.url.startsWith('/curiosidades')) return;
    const text = curiosity.question.replace(/^Você sabia que /, '').replace(/^./, (c) => c.toUpperCase());
    const url = `/curiosidades/${curiosity.id}`;
    this.notify.once(`curiosidade-${todayKey()}`, () => {
      this.notify.banner(`Você sabia? ${text}`, 'Ver', url);
      this.notify.system('Você sabia?', text, url);
    });
  }

  private load(): string[] {
    try {
      return JSON.parse(localStorage.getItem(`${STORAGE_KEY}.read`) ?? '[]');
    } catch {
      return [];
    }
  }
}
