import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Sanfona por tópico (estudos longos): o cabeçalho de um tópico, que abre e fecha o trecho dele. Vive dentro do `h2` do texto.
 * Mostra o título, o tempo de leitura do tópico e a seta; toda a faixa é o botão (alvo de toque de 56 px).
 */
@Component({
  selector: 'app-topic-head',
  imports: [MatIconModule],
  template: `
    <button type="button" class="head" [class.open]="open()" [attr.aria-expanded]="open()" (click)="toggled.emit()">
      <span class="title">{{ title() }}</span>
      <span class="min" data-nolisten>{{ minutes() }} min</span>
      <mat-icon class="chev" aria-hidden="true">expand_more</mat-icon>
    </button>
  `,
  styles: `
    :host { display: block; }
    .head {
      display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 10px 14px;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 14px; cursor: pointer; text-align: left;
      background: var(--mat-sys-surface-container-low); color: inherit; font: inherit;
    }
    .head.open { border-color: var(--accent-gold); }
    .title { flex: 1; font-family: var(--heading-font); font-size: 21px; line-height: 1.25; letter-spacing: -0.2px; }
    .min { flex: none; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chev { flex: none; color: var(--accent-gold); transition: transform 0.2s; }
    .head.open .chev { transform: rotate(180deg); }
    .head:focus-visible { outline: 2px solid var(--accent-gold); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .chev { transition: none; } }
  `,
})
export class TopicHead {
  readonly title = input.required<string>();
  readonly minutes = input.required<number>();
  readonly open = input(false);
  readonly toggled = output<void>();
}

/** Botão do fim de um tópico aberto: fecha este e abre o próximo. */
@Component({
  selector: 'app-topic-next',
  imports: [MatIconModule],
  template: `
    <button type="button" class="next" (click)="advanced.emit()">
      <span class="text"><span class="kicker" data-nolisten>Próximo tópico</span><span class="name">{{ title() }}</span></span>
      <mat-icon aria-hidden="true">arrow_forward</mat-icon>
    </button>
  `,
  styles: `
    :host { display: block; clear: both; margin: 28px 0 8px; }
    .next {
      display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 10px 16px;
      border: 1px solid var(--accent-gold); border-radius: 14px; cursor: pointer; text-align: left;
      background: color-mix(in srgb, var(--accent-gold) 12%, transparent); color: inherit; font: inherit;
    }
    .text { flex: 1; display: grid; gap: 2px; }
    .kicker { font: 700 13px Inter, sans-serif; letter-spacing: 1px; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .name { font-family: var(--heading-font); font-size: 19px; line-height: 1.25; }
    mat-icon { flex: none; color: var(--accent-gold); }
    .next:focus-visible { outline: 2px solid var(--accent-gold); outline-offset: 2px; }
  `,
})
export class TopicNext {
  readonly title = input.required<string>();
  readonly advanced = output<void>();
}

/**
 * Linha “Saiba mais” dentro de um tópico aberto: dobra e abre uma nota de medicina ou uma seção de análise, no mesmo lugar do
 * texto. Mais leve que o cartão do tópico: uma barra dourada à esquerda, o rótulo pequeno e o título.
 */
@Component({
  selector: 'app-fold-head',
  imports: [MatIconModule],
  template: `
    <button type="button" class="fold" [class.open]="open()" [attr.aria-expanded]="open()" (click)="toggled.emit()">
      <span class="text"><span class="kicker" data-nolisten>{{ kicker() }}</span><span class="name">{{ title() }}</span></span>
      <mat-icon class="chev" aria-hidden="true">expand_more</mat-icon>
    </button>
  `,
  styles: `
    :host { display: block; clear: both; }
    .fold {
      display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 8px 12px 8px 14px; cursor: pointer;
      border: 0; border-left: 4px solid var(--accent-gold); border-radius: 4px 12px 12px 4px; text-align: left; color: inherit; font: inherit;
      background: color-mix(in srgb, var(--accent-gold) 9%, var(--mat-sys-surface-container-low));
    }
    .text { flex: 1; display: grid; gap: 1px; }
    .kicker { font: 700 13px Inter, sans-serif; letter-spacing: 1px; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .name { font-family: var(--heading-font); font-size: 19px; line-height: 1.25; }
    .chev { flex: none; color: var(--accent-gold); transition: transform 0.2s; }
    .fold.open .chev { transform: rotate(180deg); }
    .fold:focus-visible { outline: 2px solid var(--accent-gold); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .chev { transition: none; } }
  `,
})
export class FoldHead {
  readonly title = input.required<string>();
  readonly kicker = input('Saiba mais');
  readonly open = input(false);
  readonly toggled = output<void>();
}
