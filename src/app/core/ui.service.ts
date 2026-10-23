import { Injectable, signal } from '@angular/core';

/** Estado visual compartilhado entre o shell e as páginas. */
@Injectable({ providedIn: 'root' })
export class UiService {
  /** Barras ocultas enquanto o usuário rola para baixo (modo leitura imersiva). */
  readonly barsHidden = signal(false);
  private lastScroll = 0;

  onScroll(y: number): void {
    const delta = y - this.lastScroll;
    if (y < 80) this.barsHidden.set(false);
    else if (delta > 8) this.barsHidden.set(true);
    else if (delta < -8) this.barsHidden.set(false);
    this.lastScroll = y;
  }
}
