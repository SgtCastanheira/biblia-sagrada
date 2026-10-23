import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ATLAS_MAP, ERAS } from '../../core/atlas';
import { findMap } from '../../core/maps';
import { SettingsService } from '../../core/settings.service';
import { BibleMapView } from '../../shared/bible-map';
import { Sheets } from '../../shared/sheets';

/** Atlas histórico: o mundo da Bíblia época por época (reinos, impérios, povos e acontecimentos). */
@Component({
  selector: 'app-atlas',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule, BibleMapView],
  template: `
    <header class="page-head">
      <span class="overline">Geografia bíblica</span>
      <h1>Atlas histórico</h1>
      <p>Os reinos, impérios e povos ao redor da história bíblica — de antes de Abraão ao Império Romano. Escolha a época.</p>
    </header>

    <nav class="eras" aria-label="Épocas">
      @for (e of eras; track e.id; let i = $index) {
        <button [class.active]="e.id === era().id" (click)="go(e.id)">
          <small>{{ e.period }}</small>{{ e.name }}
        </button>
      }
    </nav>

    <div class="map-frame">
      <app-bible-map #mapView [map]="atlas" [interactive]="true" [era]="era()" [nearby]="layers().nearby" [modern]="layers().modern" />
      @if (mapView.zoomed()) {
        <button class="reset" (click)="mapView.reset()" aria-label="Ver o mapa inteiro"><mat-icon>zoom_out_map</mat-icon></button>
      }
    </div>
    <div class="layers">
      <button [class.on]="layers().nearby" [attr.aria-pressed]="layers().nearby" (click)="toggle('nearby')"><mat-icon>location_city</mat-icon> Cidades e lugares</button>
      <button [class.on]="layers().modern" [attr.aria-pressed]="layers().modern" (click)="toggle('modern')"><mat-icon>public</mat-icon> Países de hoje</button>
    </div>
    <p class="hint">Aproxime com dois dedos ou com a roda do mouse para ver as cidades. Fronteiras aproximadas, para estudo.</p>

    <nav class="stepper">
      <button mat-stroked-button [disabled]="index() === 0" (click)="go(eras[index() - 1].id)"><mat-icon>chevron_left</mat-icon> Anterior</button>
      <span>{{ index() + 1 }} de {{ eras.length }}</span>
      <button mat-stroked-button [disabled]="index() === eras.length - 1" (click)="go(eras[index() + 1].id)">Próxima <mat-icon iconPositionEnd>chevron_right</mat-icon></button>
    </nav>

    <article class="era">
      <span class="overline">{{ era().period }}</span>
      <h2>{{ era().name }}</h2>
      <p class="summary">{{ era().summary }}</p>

      <h3>Reinos e impérios</h3>
      <ul class="powers">
        @for (p of era().powers; track p.name) {
          <li><i [style.background]="p.color"></i><span><strong>{{ p.name }}</strong>@if (p.note) { — {{ p.note }} }</span></li>
        }
      </ul>
      @if (era().peoples.length) {
        <p class="peoples"><strong>Povos:</strong> {{ peoples() }}</p>
      }

      <h3>Acontecimentos</h3>
      <ol class="timeline">
        @for (ev of era().events; track ev.text) {
          <li>
            <span class="marker"></span>
            <span class="date">{{ ev.year }}</span>
            <span class="text">{{ ev.text }}
              @if (ev.ref) { <button class="ref" (click)="openRef(ev.ref)">{{ ev.ref }}</button> }
            </span>
          </li>
        }
      </ol>

      @if (maps().length) {
        <h3>Mapas desta época</h3>
        <div class="maps">
          @for (m of maps(); track m.id) {
            <a class="map-link" matRipple [routerLink]="['/mapas', m.id]"><mat-icon>route</mat-icon>{{ m.title }}<mat-icon class="go">chevron_right</mat-icon></a>
          }
        </div>
      }
    </article>
    <p class="credit">Litoral, rios e fronteiras atuais: Natural Earth (domínio público). Fronteiras antigas aproximadas.</p>
  `,
  styleUrl: './atlas.scss',
})
export class AtlasPage {
  readonly epoca = input<string>();
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  private readonly settings = inject(SettingsService);

  protected readonly atlas = ATLAS_MAP;
  protected readonly eras = ERAS;
  protected readonly layers = this.settings.mapLayers;
  protected readonly index = computed(() => Math.max(0, ERAS.findIndex((e) => e.id === this.epoca())));
  protected readonly era = computed(() => ERAS[this.index()]);
  protected readonly peoples = computed(() => this.era().peoples.map((p) => p.name).join(' · '));
  protected readonly maps = computed(() => this.era().maps.map((id) => findMap(id)!).filter(Boolean));

  protected go(id: string): void {
    this.router.navigate([], { queryParams: { epoca: id }, replaceUrl: true });
  }

  protected toggle(key: 'nearby' | 'modern'): void {
    this.layers.update((l) => ({ ...l, [key]: !l[key] }));
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
