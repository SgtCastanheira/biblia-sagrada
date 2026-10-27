import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/** Convite no fim de um capítulo ou de uma história: "Você lembra o que leu?". */
@Component({
  selector: 'app-quiz-prompt',
  imports: [RouterLink, MatIconModule],
  template: `
    <a class="prompt" [routerLink]="link()">
      <span class="badge"><mat-icon>quiz</mat-icon></span>
      <span class="texts"><strong>Você lembra o que leu?</strong><span>{{ text() }}</span></span>
      <mat-icon class="go">arrow_forward</mat-icon>
    </a>
  `,
  styles: `
    :host { display: block; margin: 22px 0 6px; }
    .prompt { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 20px; text-decoration: none; color: var(--mat-sys-on-surface); background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); border-left: 5px solid var(--accent-gold); }
    .badge { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .texts { display: flex; flex-direction: column; gap: 2px; font: 400 14px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .texts strong { font: 600 17px/1.25 var(--heading-font); color: var(--mat-sys-on-surface); }
    .go { color: var(--mat-sys-primary); }
  `,
})
export class QuizPrompt {
  readonly link = input.required<(string | number)[]>();
  readonly text = input('Responda 5 perguntas e confira.');
}
