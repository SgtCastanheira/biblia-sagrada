import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, input } from '@angular/core';
import type { Inline } from '../core/rich-text-parser';

/**
 * Diálogo (":::dialogo"): uma fala por linha, com o nome de quem fala; a linha sem nome é uma indicação de cena.
 * O texto das falas (referências tocáveis, itálico…) é desenhado pelo modelo `line` do RichText.
 */
@Component({
  selector: 'app-dialog-turns',
  imports: [NgTemplateOutlet],
  template: `
    <section class="dialog" [attr.aria-label]="title() ?? 'Diálogo'">
      @if (title()) { <div class="dialog-title" aria-hidden="true">{{ title() }}</div> }
      @for (t of turns(); track $index) {
        @if (t.who) {
          <p class="turn" [class.jesus]="isJesus(t.who)"><span class="who">{{ t.who }}<span class="pause">: </span></span><span class="said"><ng-container *ngTemplateOutlet="line(); context: { $implicit: t.text }" /></span></p>
        } @else {
          <p class="stage"><ng-container *ngTemplateOutlet="line(); context: { $implicit: t.text }" /></p>
        }
      }
    </section>
  `,
  styleUrl: './dialog-turns.scss',
})
export class DialogTurns {
  readonly title = input<string | undefined>();
  readonly turns = input.required<{ who?: string; text: Inline[] }[]>();
  readonly line = input.required<TemplateRef<{ $implicit: Inline[] }>>();

  /** As falas de Jesus levam a barra dourada. */
  protected isJesus(who: string): boolean {
    return who.trim().toLowerCase() === 'jesus';
  }
}
