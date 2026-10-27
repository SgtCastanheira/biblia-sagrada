import { Component, computed, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AD_STATES, REGIONS } from '../../core/ad-states';
import { findMap } from '../../core/maps';
import { BackButton } from '../../shared/back-button';
import { BibleMapView } from '../../shared/bible-map';

/** A Assembleia de Deus em cada estado: escolha o estado para ler a história completa. */
@Component({
  selector: 'app-ad-states',
  imports: [RouterLink, MatIconModule, MatRippleModule, BibleMapView, BackButton],
  template: `
    <div class="top"><app-back fallback="/artigo/assembleia-de-deus-no-brasil" /></div>
    <header class="page-head">
      <span class="overline">Assembleia de Deus no Brasil</span>
      <h1>A igreja em cada estado</h1>
      <p>Escolha um estado para ler como o evangelho chegou ali, de onde saíram os pioneiros e como a igreja foi sendo construída.</p>
    </header>

    <a class="card map" matRipple routerLink="/mapas/assembleia-de-deus-estados">
      <app-bible-map [map]="map" [compact]="true" />
      <span class="map-label"><mat-icon>map</mat-icon> Ver no mapa, com as setas de onde saiu cada pioneiro <mat-icon class="go">arrow_forward</mat-icon></span>
    </a>

    <a class="card study" matRipple routerLink="/assembleia-de-deus/linha-do-tempo">
      <mat-icon>timeline</mat-icon>
      <span><small>Ano a ano</small>A linha do tempo: a igreja e o que acontecia no Brasil e no mundo</span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>

    <div class="modes" role="group" aria-label="Como organizar os estados">
      <button type="button" [class.on]="mode() === 'regiao'" [attr.aria-pressed]="mode() === 'regiao'" (click)="mode.set('regiao')"><mat-icon>map</mat-icon> Por região</button>
      <button type="button" [class.on]="mode() === 'ano'" [attr.aria-pressed]="mode() === 'ano'" (click)="mode.set('ano')"><mat-icon>schedule</mat-icon> Em ordem de chegada</button>
    </div>
    <p class="hint">Toque numa bolinha para ler a história do estado. Embaixo de cada uma, o ano em que a igreja chegou.</p>

    @for (g of groups(); track g.name) {
      <section class="group">
        <h2 class="section-title">{{ g.name }} <small>{{ g.states.length }} {{ g.states.length === 1 ? 'estado' : 'estados' }}</small></h2>
        <ul class="rings">
          @for (s of g.states; track s.id) {
            <li>
              <a class="ring" [routerLink]="['/assembleia-de-deus', s.id]" [attr.aria-label]="s.state + ', ' + s.year + ', ' + s.city">
                <span class="disc"><span class="uf">{{ s.id.toUpperCase() }}</span></span>
                <span class="lab">{{ s.state }}</span>
                <span class="yr">{{ s.year }}</span>
              </a>
            </li>
          }
        </ul>
      </section>
    }

    <a class="card study" matRipple routerLink="/artigo/assembleia-de-deus-no-brasil">
      <mat-icon>menu_book</mat-icon>
      <span><small>O estudo completo</small>A história da Assembleia de Deus no Brasil</span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .map { margin: 0 0 8px; }
    .map app-bible-map { display: block; aspect-ratio: 16 / 9; overflow: hidden; }
    .map-label { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--mat-sys-outline-variant); font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .map-label .go { margin-left: auto; }
    .modes { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 4px; }
    .modes button { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 22px; cursor: pointer; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 600 14px Inter, sans-serif; }
    .modes button.on { background: var(--mat-sys-primary-container); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary-container); }
    .modes mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .hint { margin: 6px 2px 4px; font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .group .section-title small { margin-left: auto; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    /* Uma bolinha por estado, como as das histórias */
    .rings { list-style: none; margin: 6px 0 14px; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 14px 8px; }
    .ring { display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; text-decoration: none; color: var(--mat-sys-on-surface); }
    .disc { display: grid; place-items: center; width: 68px; height: 68px; padding: 3px; border-radius: 50%; box-sizing: border-box; background: conic-gradient(from 200deg, var(--mat-sys-primary), var(--accent-gold), var(--mat-sys-primary)); transition: transform .15s; }
    .ring:hover .disc { transform: scale(1.06); }
    .uf { display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; box-sizing: border-box; border: 3px solid var(--mat-sys-surface); background: var(--mat-sys-surface); color: var(--mat-sys-primary); font: 700 18px Inter, sans-serif; letter-spacing: .5px; }
    .lab { font: 600 13px/1.25 Inter, sans-serif; }
    .yr { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .study { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 14px 16px; font: 600 16px/1.35 var(--heading-font); }
    .study > mat-icon:first-child { color: var(--accent-gold); }
    .study span { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .study small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .study .go { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class AdStatesPage {
  protected readonly map = findMap('assembleia-de-deus-estados')!;
  protected readonly mode = signal<'regiao' | 'ano'>('regiao');

  /** Os estados agrupados: por região (ordem do app) ou por década de chegada da igreja. */
  protected readonly groups = computed(() => {
    const year = (s: (typeof AD_STATES)[number]) => parseInt(String(s.year), 10) || 9999;
    if (this.mode() === 'regiao') {
      return REGIONS.map((name) => ({ name, states: AD_STATES.filter((s) => s.region === name).sort((a, b) => year(a) - year(b)) }));
    }
    const decades = new Map<number, (typeof AD_STATES)[number][]>();
    for (const s of [...AD_STATES].sort((a, b) => year(a) - year(b))) {
      const d = Math.floor(year(s) / 10) * 10;
      decades.set(d, [...(decades.get(d) ?? []), s]);
    }
    return [...decades].map(([d, states]) => ({ name: `Anos ${d}`, states }));
  });
}
