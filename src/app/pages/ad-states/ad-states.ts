import { Component } from '@angular/core';
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

    @for (r of regions; track r.name) {
      <h2 class="section-title">{{ r.name }}</h2>
      <div class="list">
        @for (s of r.states; track s.id) {
          <a class="card row" matRipple [routerLink]="['/assembleia-de-deus', s.id]">
            <span class="badge uf">{{ s.id.toUpperCase() }}</span>
            <span class="texts">
              <span class="meta">{{ s.year }} · {{ s.city }}</span>
              <span class="name">{{ s.state }}</span>
              <span class="desc">{{ s.origin }}</span>
            </span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      </div>
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
    .uf { font: 700 15px Inter, sans-serif; letter-spacing: .5px; }
    .study { display: flex; align-items: center; gap: 12px; margin-top: 12px; padding: 14px 16px; font: 600 16px/1.35 var(--heading-font); }
    .study > mat-icon:first-child { color: var(--accent-gold); }
    .study span { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .study small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .study .go { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class AdStatesPage {
  protected readonly map = findMap('assembleia-de-deus-estados')!;
  protected readonly regions = REGIONS.map((name) => ({ name, states: AD_STATES.filter((s) => s.region === name) }));
}
