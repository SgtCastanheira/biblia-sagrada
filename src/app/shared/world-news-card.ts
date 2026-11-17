import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** Atalho da tela inicial para o Mundo Cristão, que mora no Jornal (/vozes). Não busca nada: só abre a tela, que lê as fontes. */
@Component({
  selector: 'app-world-news-card',
  imports: [RouterLink, MatIconModule],
  template: `
    <a class="world" routerLink="/vozes">
      <span class="ic" aria-hidden="true"><mat-icon>public</mat-icon></span>
      <span class="tx">
        <span class="over">Mundo Cristão</span>
        <span class="ti">Missões e igreja perseguida, ao vivo</span>
        <span class="sub">Notícias de hoje, com a matéria original a um toque</span>
      </span>
      <mat-icon class="go" aria-hidden="true">arrow_forward</mat-icon>
    </a>
  `,
  styles: `
    :host { display: block; margin: 16px 0; }
    .world { display: flex; align-items: center; gap: 14px; min-height: 72px; padding: 14px 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; background: var(--mat-sys-surface-container-low); color: inherit; text-decoration: none; box-shadow: var(--shadow-soft); }
    .world:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
    .ic { display: grid; place-items: center; width: 48px; height: 48px; flex: none; border-radius: 50%; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .tx { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
    .over { font: 600 13px Inter, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; color: var(--accent-gold); }
    .ti { font: 700 17px/1.25 var(--heading-font); }
    .sub { font: 400 14px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .go { color: var(--mat-sys-primary); }
  `,
})
export class WorldNewsCard {}
