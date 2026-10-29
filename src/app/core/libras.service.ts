import { effect, Injectable, signal } from '@angular/core';

const KEY = 'biblia.libras';
/** Widget oficial do VLibras (governo federal e UFPB): traduz para Libras o texto em que a pessoa toca. */
export const VLIBRAS_SCRIPT = 'https://vlibras.gov.br/app/vlibras-plugin.js';

export type LibrasStatus = 'off' | 'loading' | 'on' | 'error';

/**
 * Libras com o VLibras. Só é carregado quando a pessoa liga em Ajustes: o script vem do servidor do governo,
 * precisa de internet e não funciona sem ela. Desligar esconde o botão (o script já carregado fica até recarregar).
 */
@Injectable({ providedIn: 'root' })
export class LibrasService {
  readonly enabled = signal<boolean>(this.load());
  readonly status = signal<LibrasStatus>('off');
  private loaded = false;

  constructor() {
    effect(() => {
      const on = this.enabled();
      try {
        localStorage.setItem(KEY, JSON.stringify(on));
      } catch { /* sem armazenamento: vale só nesta visita */ }
      document.body.classList.toggle('libras-off', !on);
      if (on) this.start();
      else this.status.set('off');
    });
  }

  private start(): void {
    if (this.loaded) {
      this.status.set('on');
      return;
    }
    this.loaded = true;
    this.status.set('loading');
    const script = document.createElement('script');
    script.src = VLIBRAS_SCRIPT;
    script.async = true;
    script.onload = () => this.status.set('on');
    script.onerror = () => {
      // Sem internet ou serviço fora do ar: tenta de novo na próxima vez que ligar
      this.loaded = false;
      script.remove();
      this.status.set('error');
    };
    document.body.appendChild(script);
  }

  private load(): boolean {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? 'false') === true;
    } catch {
      return false;
    }
  }
}
