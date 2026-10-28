import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TRAILS } from '../core/trails';

/**
 * Fileira de círculos, um por assunto das histórias (como os destaques do Instagram). Cada círculo leva à
 * tela de histórias já no assunto. No celular rola de lado; no computador quebra em linhas.
 */
@Component({
  selector: 'app-story-rings',
  imports: [RouterLink, MatIconModule],
  template: `
    <nav class="rings" aria-label="Assuntos das histórias">
      @if (all()) {
        <a class="ring" [class.active]="!active()" routerLink="/historia">
          <span class="disc"><mat-icon>apps</mat-icon></span>
          <span class="lab">Todos</span>
        </a>
      }
      @for (t of trails; track t.id) {
        <a class="ring" [class.active]="t.id === active()" routerLink="/historia" [queryParams]="{ trilha: t.id }" [attr.aria-label]="t.name">
          <span class="disc"><mat-icon>{{ t.icon }}</mat-icon></span>
          <span class="lab">{{ t.short }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    :host { display: block; }
    .rings { display: flex; gap: 14px; margin: 0 -20px; padding: 4px 20px 6px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; }
    .rings::-webkit-scrollbar { display: none; }
    @media (min-width: 840px) { .rings { margin: 0; padding: 4px 0 6px; flex-wrap: wrap; overflow: visible; gap: 18px 16px; } }
    .ring { flex: none; width: 84px; display: flex; flex-direction: column; align-items: center; gap: 6px; scroll-snap-align: start; text-decoration: none; color: var(--mat-sys-on-surface); }
    /* Uma só família de cores: sálvia com um fio dourado. O que distingue cada assunto é o ícone, não a cor. */
    .disc {
      display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; box-sizing: border-box; padding: 3px; transition: transform .15s;
      background: conic-gradient(from 200deg, var(--mat-sys-primary), var(--accent-gold), var(--mat-sys-primary));
    }
    .disc mat-icon { width: 100%; height: 100%; display: grid; place-items: center; border-radius: 50%; font-size: 30px; background: var(--mat-sys-surface); color: var(--mat-sys-primary); box-sizing: border-box; border: 3px solid var(--mat-sys-surface); }
    .ring.active .disc mat-icon { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .ring:hover .disc { transform: scale(1.04); }
    .lab { font: 500 13px/1.25 Inter, sans-serif; text-align: center; max-width: 84px; }
    .ring.active .lab { font-weight: 700; }
  `,
})
export class StoryRings {
  /** Id do assunto aberto (para destacar o círculo). */
  readonly active = input<string | undefined>();
  /** Mostra o círculo "Todos" (na tela de histórias; na tela inicial não precisa). */
  readonly all = input(false);
  protected readonly trails = TRAILS;
}
