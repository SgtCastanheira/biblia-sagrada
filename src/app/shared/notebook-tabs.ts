import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Abas do caderno: Anotações | Favoritos. */
@Component({
  selector: 'app-notebook-tabs',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="tabs" aria-label="Caderno">
      <a routerLink="/anotacoes" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Anotações</a>
      <a routerLink="/sermoes" routerLinkActive="active">Sermões</a>
      <a routerLink="/favoritos" routerLinkActive="active">Favoritos</a>
    </nav>
  `,
  styles: `
    .tabs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; padding: 4px; border-radius: 999px; background: var(--mat-sys-surface-container); }
    a {
      height: 40px; display: grid; place-items: center; border-radius: 999px; text-decoration: none;
      color: var(--mat-sys-on-surface-variant); font: 600 14px Inter, sans-serif;
    }
    a.active { background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface); box-shadow: 0 1px 3px rgb(35 33 30 / .1); }
  `,
})
export class NotebookTabs {}
