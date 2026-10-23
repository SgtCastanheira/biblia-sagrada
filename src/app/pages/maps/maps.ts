import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MAPS_IN_ORDER, mapReference, mapTestament } from '../../core/maps';
import { BibleMapView } from '../../shared/bible-map';

@Component({
  selector: 'app-maps',
  imports: [RouterLink, MatIconModule, MatRippleModule, BibleMapView],
  template: `
    <header class="page-head">
      <span class="overline">Geografia bíblica</span>
      <h1>Mapas</h1>
      <p>Os lugares e caminhos dos grandes momentos da Bíblia, com os versículos de cada etapa.</p>
    </header>

    <a class="atlas" matRipple routerLink="/atlas">
      <mat-icon>public</mat-icon>
      <span><small>Novo</small>Atlas histórico: reinos, impérios e povos, época por época</span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>

    @for (section of sections; track section.name) {
      <h2 class="testament">{{ section.name }}</h2>
      <div class="grid">
        @for (m of section.maps; track m.id) {
          <a class="card" matRipple [routerLink]="['/mapas', m.id]">
            <app-bible-map [map]="m" [compact]="true" />
            <span class="info">
              <span class="ref"><mat-icon>menu_book</mat-icon>{{ reference(m) }}</span>
              <span class="title">{{ m.title }}</span>
              <span class="period">{{ m.period }}</span>
              <span class="summary">{{ m.summary }}</span>
            </span>
          </a>
        }
      </div>
    }
    <p class="credit">Geografia: Natural Earth (domínio público). Traçados aproximados, para fins de estudo.</p>
  `,
  styles: `
    .page-head { margin: 8px 0 20px; }
    .overline { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    h1 { font: 600 32px var(--heading-font); letter-spacing: -.4px; margin: 4px 0 6px; }
    .page-head p { margin: 0; color: var(--mat-sys-on-surface-variant); max-width: 540px; }
    .atlas {
      display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 8px; border-radius: 18px; position: relative; overflow: hidden;
      text-decoration: none; color: inherit; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .atlas span { flex: 1; display: flex; flex-direction: column; font: 600 16px/1.3 var(--heading-font); }
    .atlas small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .testament { display: flex; align-items: center; gap: 10px; margin: 24px 4px 12px; font: 600 20px var(--heading-font); }
    .testament::after { content: ''; flex: 1; height: 1px; background: var(--mat-sys-outline-variant); }
    .ref { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .ref mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); }
    .card {
      display: flex; flex-direction: column; border-radius: 20px; overflow: hidden; position: relative; text-decoration: none; color: inherit;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); box-shadow: var(--shadow-soft);
    }
    app-bible-map { aspect-ratio: 16 / 9; overflow: hidden; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .info { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px 16px; }
    .period { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .title { font: 600 18px/1.3 var(--heading-font); }
    .summary { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .credit { margin: 20px 4px 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
  `,
})
export class MapsPage {
  protected readonly reference = mapReference;
  protected readonly sections = [
    { name: 'Antigo Testamento', maps: MAPS_IN_ORDER.filter((m) => mapTestament(m) === 'AT') },
    { name: 'Novo Testamento', maps: MAPS_IN_ORDER.filter((m) => mapTestament(m) === 'NT') },
  ];
}
