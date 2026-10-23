import { inject, Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { WhatsNewSheet } from '../shared/whats-new-sheet';
import { LATEST_RELEASE } from './whats-new';

const SEEN_KEY = 'biblia.novidades.visto';

/** Mostra as novidades da última atualização uma vez em cada aparelho (inclusive na primeira visita). */
@Injectable({ providedIn: 'root' })
export class WhatsNewService {
  private readonly bottomSheet = inject(MatBottomSheet);

  /** Abre as novidades se ainda não foram vistas. Devolve true quando abriu (os outros avisos esperam). */
  check(): boolean {
    try {
      if (localStorage.getItem(SEEN_KEY) === LATEST_RELEASE.id) return false;
      localStorage.setItem(SEEN_KEY, LATEST_RELEASE.id);
    } catch {
      return false;
    }
    this.open();
    return true;
  }

  open(): void {
    this.bottomSheet.open(WhatsNewSheet, { panelClass: 'app-sheet', autoFocus: false, data: LATEST_RELEASE });
  }
}
