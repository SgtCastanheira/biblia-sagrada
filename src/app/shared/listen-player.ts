import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LISTEN_RATES, ListenService } from '../core/listen.service';

/** Controles de "Ouvir": ficam flutuando acima do menu enquanto algo está sendo lido. */
@Component({
  selector: 'app-listen-player',
  imports: [MatIconModule],
  template: `
    @if (listen.state() !== 'idle') {
      <section class="player" role="region" aria-label="Ouvir">
        <div class="head">
          <span class="title"><mat-icon>headphones</mat-icon>{{ listen.title() }}</span>
          <span class="count">{{ listen.index() + 1 }} de {{ listen.items().length }}</span>
          <button type="button" class="icon" (click)="listen.stop()" aria-label="Parar e fechar"><mat-icon>close</mat-icon></button>
        </div>
        <div class="bar" aria-hidden="true"><span [style.width.%]="((listen.index() + 1) / listen.items().length) * 100"></span></div>
        <div class="controls">
          <button type="button" class="icon" (click)="listen.previous()" aria-label="Trecho anterior"><mat-icon>skip_previous</mat-icon></button>
          <button type="button" class="play" (click)="listen.toggle()" [attr.aria-label]="listen.state() === 'playing' ? 'Pausar' : 'Continuar a ouvir'">
            <mat-icon>{{ listen.state() === 'playing' ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>
          <button type="button" class="icon" (click)="listen.next()" aria-label="Próximo trecho"><mat-icon>skip_next</mat-icon></button>
          <span class="rates" role="group" aria-label="Velocidade">
            @for (r of rates; track r) {
              <button type="button" [class.on]="listen.rate() === r" (click)="listen.setRate(r)" [attr.aria-pressed]="listen.rate() === r">{{ r }}×</button>
            }
          </span>
        </div>
      </section>
    }
  `,
  styles: `
    .player {
      position: fixed; z-index: 30; left: 12px; right: 12px; bottom: calc(var(--nav-height) + 10px + env(safe-area-inset-bottom)); max-width: 560px; margin: 0 auto;
      padding: 10px 12px 8px; border-radius: 22px; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container-high); box-shadow: 0 8px 28px rgba(0, 0, 0, .16);
    }
    @media (min-width: 840px) { .player { left: calc(var(--rail-width) + 16px); right: auto; bottom: 20px; width: 460px; margin: 0; } }
    .head { display: flex; align-items: center; gap: 8px; }
    .title { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; font: 600 14px/1.3 Inter, sans-serif; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .title mat-icon { flex: none; color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .count { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .bar { height: 3px; margin: 2px 0 6px; border-radius: 2px; background: var(--mat-sys-outline-variant); overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--accent-gold); transition: width .3s; }
    .controls { display: flex; align-items: center; gap: 4px; }
    button { border: 0; background: none; color: var(--mat-sys-on-surface); cursor: pointer; font: inherit; }
    .icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; }
    .icon:hover { background: var(--mat-sys-surface-container-highest); }
    .play { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .rates { margin-left: auto; display: flex; gap: 2px; }
    .rates button { min-width: 44px; height: 44px; border-radius: 12px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .rates button.on { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    button:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
  `,
})
export class ListenPlayer {
  protected readonly listen = inject(ListenService);
  protected readonly rates = LISTEN_RATES;
}
