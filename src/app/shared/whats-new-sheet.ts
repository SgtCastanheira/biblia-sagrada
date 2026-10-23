import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Release } from '../core/whats-new';

/** Painel com as novidades da última atualização. */
@Component({
  selector: 'app-whats-new-sheet',
  imports: [MatButtonModule, MatIconModule, MatRippleModule],
  template: `
    <div class="content">
      <span class="overline"><mat-icon>celebration</mat-icon> Novidades no app</span>
      <h2>{{ release.title }}</h2>
      <ul>
        @for (i of release.items; track i.title) {
          <li>
            <button matRipple (click)="go(i.link)">
              <mat-icon>{{ i.icon }}</mat-icon>
              <span><strong>{{ i.title }}</strong><small>{{ i.text }}</small>@if (i.tip) { <em>{{ i.tip }}</em> }</span>
              <mat-icon class="go">chevron_right</mat-icon>
            </button>
          </li>
        }
      </ul>
      <div class="actions">
        <button mat-stroked-button (click)="go('/novidades')"><mat-icon>share</mat-icon> Compartilhar</button>
        <button mat-flat-button (click)="ref.dismiss()">Entendi</button>
      </div>
    </div>
  `,
  styles: `
    .content { padding: 4px 20px 20px; }
    .overline { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    .overline mat-icon { font-size: 18px; width: 18px; height: 18px; }
    h2 { margin: 6px 0 12px; font: 600 22px/1.25 var(--heading-font); }
    ul { list-style: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 6px; max-height: 52vh; overflow-y: auto; }
    li button {
      position: relative; overflow: hidden; width: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
      color: inherit; text-align: left; cursor: pointer;
    }
    li mat-icon { color: var(--accent-gold); }
    li span { display: flex; flex-direction: column; gap: 2px; }
    li strong { font: 600 15px var(--heading-font); }
    li small { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    li em { font: 500 13px Inter, sans-serif; font-style: normal; color: var(--mat-sys-primary); }
    li .go { color: var(--mat-sys-on-surface-variant); }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .actions button { height: 48px; }
  `,
})
export class WhatsNewSheet {
  protected readonly release = inject<Release>(MAT_BOTTOM_SHEET_DATA);
  protected readonly ref = inject(MatBottomSheetRef<WhatsNewSheet>);
  private readonly router = inject(Router);

  protected go(link: string): void {
    this.ref.dismiss();
    this.router.navigateByUrl(link);
  }
}
