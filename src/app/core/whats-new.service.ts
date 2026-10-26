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
    let welcome: boolean;
    try {
      const seen = localStorage.getItem(SEEN_KEY);
      if (seen === LATEST_RELEASE.id) return false;
      // Nunca viu nenhuma novidade: é a primeira visita, e o painel vira boas-vindas
      welcome = seen === null;
      localStorage.setItem(SEEN_KEY, LATEST_RELEASE.id);
    } catch {
      return false;
    }
    this.open(welcome);
    return true;
  }

  open(welcome = false): void {
    this.bottomSheet.open(WhatsNewSheet, { panelClass: 'app-sheet', autoFocus: false, data: { release: LATEST_RELEASE, welcome } });
  }
}
