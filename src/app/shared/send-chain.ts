import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface Send {
  from: string;
  to: string;
  who: string;
  year: string;
  note?: string;
}

/**
 * Quem enviou quem: cada linha mostra de onde a pessoa saiu e aonde chegou, com o nome, o ano e,
 * quando as fontes dizem, por quem foi enviada. Usado pelo bloco ":::envio" dos textos.
 */
@Component({
  selector: 'app-send-chain',
  imports: [MatIconModule],
  template: `
    <section class="chain" [attr.aria-label]="title() || 'Quem enviou quem'">
      @if (title()) { <h3><mat-icon>alt_route</mat-icon>{{ title() }}</h3> }
      <ol>
        @for (s of sends(); track $index) {
          <li>
            <span class="route">
              <span class="place">{{ s.from }}</span>
              <mat-icon aria-hidden="true">arrow_forward</mat-icon>
              <span class="place to">{{ s.to }}</span>
            </span>
            <span class="who"><strong>{{ s.who }}</strong> <span class="year">{{ s.year }}</span></span>
            @if (s.note) { <span class="note">{{ s.note }}</span> }
          </li>
        }
      </ol>
    </section>
  `,
  styles: `
    :host { display: block; clear: both; }
    .chain { margin: 6px 0 22px; padding: 14px 16px 8px; border-radius: 18px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; font: 600 17px/1.3 var(--heading-font); color: var(--mat-sys-on-surface); }
    h3 mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--accent-gold); }
    ol { list-style: none; margin: 0; padding: 0; }
    li { position: relative; display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 8px 0 10px 18px; border-top: 1px solid var(--mat-sys-outline-variant); }
    li:first-child { border-top: 0; }
    li::before { content: ''; position: absolute; left: 0; top: 14px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent-gold); }
    .route { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font: 600 14px Inter, sans-serif; }
    .route mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); flex: none; }
    .place { padding: 2px 10px; border-radius: 12px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface-variant); }
    .place.to { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .who { font: 400 16px/1.45 var(--reading-font); }
    .year { margin-left: 4px; font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .note { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class SendChain {
  readonly title = input<string | undefined>();
  readonly sends = input.required<Send[]>();
}
