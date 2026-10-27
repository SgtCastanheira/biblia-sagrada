import { Component, input, output } from '@angular/core';

/**
 * A fitinha da Bíblia: pendurada no alto da página. Comprida e vermelha, marca o capítulo onde a pessoa parou;
 * curta e discreta, nos outros capítulos, e basta tocar para trazê-la para cá.
 */
@Component({
  selector: 'app-book-ribbon',
  template: `
    <button type="button" class="ribbon" [class.placed]="placed()" (click)="toggle.emit()"
      [attr.aria-label]="placed() ? 'Fitinha marcada neste capítulo. Toque para tirar' : 'Colocar a fitinha neste capítulo'"
      [attr.aria-pressed]="placed()">
      <span class="band"></span>
    </button>
  `,
  styles: `
    :host { position: absolute; top: -8px; right: 22px; z-index: 2; }
    .ribbon { display: block; width: 44px; height: 44px; padding: 0; border: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: height .45s cubic-bezier(.3, 1.5, .5, 1); }
    .ribbon.placed { height: 76px; }
    .band {
      display: block; width: 24px; height: calc(100% - 8px); margin: 8px auto 0; opacity: .55; transform-origin: top; transition: opacity .2s;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
      background: linear-gradient(90deg, #7d1c2b, #b02a3d 45%, #8e2031);
      filter: drop-shadow(0 2px 2px rgba(0, 0, 0, .35));
    }
    .ribbon:hover .band, .ribbon:focus-visible .band { opacity: .85; }
    .placed .band { opacity: 1; animation: drop .6s cubic-bezier(.3, 1.4, .5, 1); }
    .ribbon:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; border-radius: 6px; }
    @keyframes drop { from { transform: scaleY(.3); } to { transform: scaleY(1); } }
    @media (prefers-reduced-motion: reduce) { .ribbon, .band { transition: none; animation: none; } }
  `,
})
export class BookRibbon {
  readonly placed = input(false);
  readonly toggle = output<void>();
}
