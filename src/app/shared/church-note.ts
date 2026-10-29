import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { ChurchNote } from '../core/ad-context';

/** "A igreja nesse tempo": a igreja também viveu a crise do fato ao lado, e não ficou de fora. */
@Component({
  selector: 'app-church-note',
  imports: [RouterLink, MatIconModule],
  template: `
    <span class="c-tag"><mat-icon aria-hidden="true">church</mat-icon> A igreja nesse tempo</span>
    <span class="c-text">{{ note().text }}</span>
    @if (note().source; as s) { <span class="c-src">Fonte: {{ s }}</span> }
    @if (note().link; as l) {
      <a [routerLink]="l">{{ note().label ?? 'Ler a história' }} <mat-icon aria-hidden="true">arrow_forward</mat-icon></a>
    }
  `,
  styles: `
    :host {
      display: flex; flex-direction: column; gap: 3px; margin-top: 6px; padding: 10px 12px; border-radius: 12px;
      background: var(--mat-sys-surface-container); border-left: 3px solid var(--accent-gold);
    }
    .c-tag { display: inline-flex; align-items: center; gap: 6px; font: 700 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .c-tag mat-icon, a mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .c-text { font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface); }
    .c-src { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    a { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; min-height: 40px; text-decoration: none; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
  `,
})
export class ChurchNoteView {
  readonly note = input.required<ChurchNote>();
}
