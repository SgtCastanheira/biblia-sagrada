import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CONTEXT_ICONS, CONTEXT_KIND_NAMES, ContextEvent } from '../core/ad-context';

/**
 * O tempo em que a história aconteceu: guerras, epidemias, secas, crises e leis do Brasil e do mundo.
 * Os pioneiros não viviam fora do seu tempo, e isto ajuda a entender o que enfrentaram.
 */
@Component({
  selector: 'app-context-list',
  imports: [MatIconModule, RouterLink],
  template: `
    <section class="ctx" id="contexto" aria-labelledby="ctx-title">
      <h2 id="ctx-title"><mat-icon>history_toggle_off</mat-icon> {{ title() }}</h2>
      <p class="intro">{{ intro() }}</p>
      <ol>
        @for (e of events(); track e.id) {
          <li [attr.data-kind]="e.kind">
            <span class="badge"><mat-icon>{{ icons[e.kind] }}</mat-icon></span>
            <span class="body">
              <span class="when">{{ e.when }} · {{ kinds[e.kind] }}</span>
              <strong>{{ e.title }}</strong>
              <span class="text">{{ e.text }}</span>
            </span>
          </li>
        }
      </ol>
      @if (timelineLink()) {
        <a class="more" routerLink="/assembleia-de-deus/linha-do-tempo">Ver tudo na linha do tempo<mat-icon>arrow_forward</mat-icon></a>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .ctx { margin: 30px 0 0; scroll-margin-top: 72px; }
    h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 600 24px/1.25 var(--heading-font); scroll-margin-top: 72px; }
    h2 mat-icon { color: var(--accent-gold); }
    .intro { margin: 0 0 14px; font: 400 16px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; padding: 12px 14px; border-radius: 16px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    .badge { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; color: var(--mat-sys-on-secondary-container); background: var(--mat-sys-secondary-container); }
    li[data-kind='guerra'] .badge, li[data-kind='violencia'] .badge { background: color-mix(in srgb, var(--mat-sys-error) 16%, var(--mat-sys-surface)); color: var(--mat-sys-error); }
    li[data-kind='saude'] .badge, li[data-kind='clima'] .badge { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    .body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .when { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    strong { font: 600 17px/1.3 var(--heading-font); }
    .text { font: 400 15px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .more { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; margin-top: 6px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }
    .more mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `,
})
export class ContextList {
  readonly events = input.required<ContextEvent[]>();
  readonly title = input('O Brasil naquele tempo');
  readonly intro = input('Os pioneiros não viviam fora do seu tempo. Guerras, epidemias, secas e crises também moldaram o que enfrentaram.');
  readonly timelineLink = input(true);
  protected readonly icons = CONTEXT_ICONS;
  protected readonly kinds = CONTEXT_KIND_NAMES;
}
