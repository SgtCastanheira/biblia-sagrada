import { inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Instalação na tela inicial, atualizações e estado da conexão. */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly updates = inject(SwUpdate);
  private installEvent: InstallPromptEvent | null = null;

  readonly online = signal(navigator.onLine);
  readonly canInstall = signal(false);
  readonly installed = signal(
    window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true,
  );
  /** iPhone/iPad não têm botão de instalar: é pelo menu Compartilhar do Safari. */
  readonly isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installEvent = event as InstallPromptEvent;
      this.canInstall.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.installed.set(true);
      this.canInstall.set(false);
    });

    if (this.updates.isEnabled) {
      this.updates.versionUpdates.pipe(filter((e) => e.type === 'VERSION_READY')).subscribe(() => {
        this.snackBar
          .open('Nova versão do app disponível', 'Atualizar', { duration: 15000 })
          .onAction()
          .subscribe(() => document.location.reload());
      });
    }
  }

  async install(): Promise<boolean> {
    if (!this.installEvent) return false;
    await this.installEvent.prompt();
    const { outcome } = await this.installEvent.userChoice;
    this.installEvent = null;
    this.canInstall.set(false);
    return outcome === 'accepted';
  }
}
