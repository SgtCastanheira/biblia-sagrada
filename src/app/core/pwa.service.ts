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
      const openedAt = Date.now();
      this.updates.versionUpdates.pipe(filter((e) => e.type === 'VERSION_READY')).subscribe(() => {
        // Acabou de abrir o link: recarrega já na versão nova (a pessoa ainda não começou a ler)
        if (Date.now() - openedAt < 15_000) {
          document.location.reload();
          return;
        }
        // Com o app em uso, não interrompe: oferece a atualização
        this.snackBar
          .open('Nova versão do app disponível', 'Atualizar', { duration: 15000 })
          .onAction()
          .subscribe(() => document.location.reload());
      });
      // Versão guardada que não dá mais para usar: recarrega da internet
      this.updates.unrecoverable.subscribe(() => document.location.reload());
      // Procura versão nova ao voltar para o app e a cada 30 minutos
      const check = () => this.updates.checkForUpdate().catch(() => false);
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
      setInterval(check, 30 * 60 * 1000);
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
