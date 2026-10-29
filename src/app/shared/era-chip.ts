import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { Epoch } from '../core/epochs';

/** "Quando aconteceu": leva da história, do personagem, da curiosidade ou do livro à época dele na linha do tempo. */
@Component({
  selector: 'app-era-chip',
  imports: [RouterLink, MatIconModule],
  template: `
    @for (e of list(); track e.id) {
      <a class="chip" [routerLink]="['/epocas', e.id]">
        <mat-icon aria-hidden="true">timeline</mat-icon>
        <span><small>{{ label() }}</small>{{ e.name }} · {{ e.period }}</span>
        <mat-icon class="go" aria-hidden="true">chevron_right</mat-icon>
      </a>
    }
  `,
  styles: `
    :host { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
    .chip {
      display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 6px 12px 6px 14px; border-radius: 24px; text-decoration: none; color: var(--mat-sys-on-surface);
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); font: 600 15px/1.25 var(--heading-font);
    }
    .chip > mat-icon:first-child { color: var(--accent-gold); }
    .chip span { display: flex; flex-direction: column; }
    .chip small { font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .go { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class EraChip {
  /** Uma época, ou várias (um livro que passa por mais de uma). */
  readonly epoch = input<Epoch | null | undefined>(null);
  readonly epochs = input<Epoch[]>([]);
  readonly label = input('Quando aconteceu');
  protected readonly list = computed(() => [...(this.epoch() ? [this.epoch()!] : []), ...this.epochs()]);
}
