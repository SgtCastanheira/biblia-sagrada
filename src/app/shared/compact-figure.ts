import { Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DRAFT_FIGURES } from '../core/draft-content';
import { Figure } from './figure';

/**
 * Figura em modo compacto (estudos privados): uma faixa pequena, colada ao parágrafo, com miniatura, rótulo e título.
 * A figura inteira só aparece, e só carrega, quando a pessoa abre a faixa. A legenda vem de fora (`<ng-content>`).
 */
@Component({
  selector: 'app-compact-figure',
  imports: [MatIconModule, Figure],
  template: `
    <div class="fig-compact" [class.open]="open()">
      <button type="button" class="fig-toggle" [attr.aria-expanded]="open()" (click)="open.set(!open())">
        @if (info().thumb; as thumb) {
          <img class="fig-thumb" [src]="'conteudo/' + thumb" alt="" loading="lazy" />
        } @else {
          <span class="fig-thumb fig-icon" aria-hidden="true"><mat-icon>{{ info().icon ?? 'menu_book' }}</mat-icon></span>
        }
        <span class="fig-text"><span class="fig-kicker">{{ info().kind }}</span><span class="fig-title">{{ info().title }}</span></span>
        <mat-icon class="fig-chevron" aria-hidden="true">expand_more</mat-icon>
      </button>
      @if (open()) {
        <figure class="fig-body">
          <app-figure [id]="id()" />
          <ng-content />
        </figure>
      }
    </div>
  `,
  styleUrl: './compact-figure.scss',
})
export class CompactFigure {
  readonly id = input.required<string>();
  protected readonly open = signal(false);
  /** Rótulo, título e miniatura da figura (uma figura sem cadastro mostra só o id). */
  protected readonly info = computed(() => DRAFT_FIGURES[this.id()] ?? { kind: 'Ilustração', title: this.id() });
}
