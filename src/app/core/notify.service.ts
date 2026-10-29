import { effect, inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { saveLocal } from './storage.service';

const STORAGE_KEY = 'biblia.notify';

interface Banner {
  message: string;
  action: string;
  url: string;
}

/** Avisos dentro do app (em fila) e notificações do sistema. */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly queue: Banner[] = [];
  private showing = false;

  readonly systemEnabled = signal<boolean>(this.load('systemEnabled', false));
  readonly permission = signal<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  constructor() {
    effect(() => this.save('systemEnabled', this.systemEnabled()));
  }

  /** Executa `fn` só uma vez por chave (ex.: uma vez por dia). */
  once(key: string, fn: () => void): void {
    const done = this.load<string[]>('done', []);
    if (done.includes(key)) return;
    this.save('done', [...done.slice(-50), key]);
    fn();
  }

  banner(message: string, action: string, url: string): void {
    this.queue.push({ message, action, url });
    this.next();
  }

  /** `tag`: notificações com a mesma marca se substituem (os lembretes do dia usam uma só). */
  async system(title: string, body: string, url: string, tag = url): Promise<void> {
    if (!this.systemEnabled() || this.permission() !== 'granted') return;
    const options: NotificationOptions = {
      body,
      icon: 'icons/icon-192x192.png',
      badge: 'icons/icon-96x96.png',
      tag,
      // O service worker abre o endereço relativo ao app: com "/" na frente, no site ele sairia de /biblia-sagrada/
      data: { url, onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url: url.replace(/^\//, '') } } },
    };
    try {
      // No Android o Chrome só permite notificações via service worker.
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        this.router.navigateByUrl(url);
        notification.close();
      };
    } catch {
      // navegador não permite notificação neste contexto
    }
  }

  async enableSystem(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    this.permission.set(permission);
    this.systemEnabled.set(permission === 'granted');
    return permission === 'granted';
  }

  disableSystem(): void {
    this.systemEnabled.set(false);
  }

  private next(): void {
    const banner = this.queue.shift();
    if (this.showing || !banner) {
      if (banner) this.queue.unshift(banner);
      return;
    }
    this.showing = true;
    // No celular o aviso fica embaixo, acima do menu, para não tampar o título nem a busca
    const phone = matchMedia('(max-width: 839px)').matches;
    const ref = this.snackBar.open(banner.message, banner.action, {
      duration: 8000,
      verticalPosition: phone ? 'bottom' : 'top',
      panelClass: phone ? ['curiosity-snack', 'above-nav'] : 'curiosity-snack',
    });
    ref.onAction().subscribe(() => this.router.navigateByUrl(banner.url));
    ref.afterDismissed().subscribe(() => {
      this.showing = false;
      setTimeout(() => this.next(), 400);
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
