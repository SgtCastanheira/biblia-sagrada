import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BODIES, StateMinistry } from '../core/ad-states';

/**
 * Os ministérios de um estado, lado a lado e sem tomar partido: a quem pertence hoje a igreja pioneira,
 * as convenções (CGADB), Madureira (CONAMAD) e a CADB. A cor da borda diferencia a convenção.
 */
@Component({
  selector: 'app-state-ministries',
  imports: [MatIconModule, RouterLink],
  template: `
    <section class="ministries" id="ministerios" aria-labelledby="min-title">
      <h2 id="min-title"><mat-icon>account_tree</mat-icon> Os ministérios no estado</h2>
      <p class="intro">A história acima é a da igreja pioneira. Hoje, em {{ stateName() }}, a Assembleia de Deus é uma família de ministérios e convenções, lado a lado.</p>
      @for (m of ministries(); track m.name) {
        <article class="min" [attr.data-body]="m.body">
          <span class="body">{{ bodies[m.body].name }}</span>
          <h3>{{ m.name }}</h3>
          <p>{{ m.text }}</p>
        </article>
      }
      @if (conventions().length) {
        <article class="min" data-body="CGADB">
          <span class="body">{{ bodies.CGADB.name }}</span>
          <h3>Convenções no estado</h3>
          <ul>@for (c of conventions(); track c) { <li>{{ c }}</li> }</ul>
        </article>
      }
      <article class="min" data-body="CONAMAD">
        <span class="body">{{ bodies.CONAMAD.name }}</span>
        <h3>Madureira em {{ stateName() }}</h3>
        <p>A CONAMAD tem convenção em todos os estados, com igrejas ligadas ao Ministério de Madureira.</p>
      </article>
      <article class="min" data-body="CADB">
        <span class="body">{{ bodies.CADB.name }}</span>
        <h3>A CADB</h3>
        <p>{{ bodies.CADB.text }} Ao ser fundada, disse ter pastores em 26 unidades da federação.</p>
      </article>
      <a class="more" routerLink="/artigo/madureira-e-a-separacao">O que são a CGADB, a CONAMAD e a CADB</a>
    </section>
  `,
  styles: `
    :host { display: block; }
    .ministries { margin: 30px 0 0; scroll-margin-top: 72px; }
    h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 600 24px/1.25 var(--heading-font); scroll-margin-top: 72px; }
    h2 mat-icon { color: var(--accent-gold); }
    .intro { margin: 0 0 14px; font: 400 16px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .min { margin: 0 0 10px; padding: 12px 14px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); border-left: 4px solid var(--mat-sys-outline); background: var(--mat-sys-surface-container-low); }
    .min[data-body='CGADB'] { border-left-color: var(--mat-sys-primary); }
    .min[data-body='CONAMAD'] { border-left-color: var(--accent-gold); }
    .min[data-body='CADB'] { border-left-color: var(--mat-sys-tertiary); }
    .body { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .6px; color: var(--mat-sys-on-surface-variant); }
    h3 { margin: 4px 0 4px; font: 600 18px/1.3 var(--heading-font); }
    p { margin: 0; font: 400 15px/1.55 var(--reading-font); }
    ul { margin: 4px 0 0; padding-left: 18px; font: 400 14px/1.5 Inter, sans-serif; }
    .more { display: inline-flex; align-items: center; min-height: 40px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
  `,
})
export class StateMinistries {
  readonly stateName = input.required<string>();
  readonly ministries = input.required<StateMinistry[]>();
  readonly conventions = input.required<string[]>();
  protected readonly bodies = BODIES;
}
