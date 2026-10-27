import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BRIDGE_FOCUS, BRIDGE_MAP, findEra } from '../core/atlas';
import { BibleMapView } from './bible-map';
import { Sheets } from './sheets';

/**
 * Mapa que passa de uma época a outra (no estudo "Entre os Testamentos"): os reinos de cada tempo, Israel em
 * destaque, o que aconteceu e onde a Bíblia fala disso. Os ids são épocas do atlas (ERAS).
 */
@Component({
  selector: 'app-era-map',
  imports: [MatIconModule, RouterLink, BibleMapView],
  template: `
    <figure class="era-map">
      <figcaption class="head"><mat-icon>public</mat-icon> O mapa ao longo do tempo</figcaption>
      <nav class="stages" aria-label="Épocas do mapa">
        @for (e of eras(); track e.id; let i = $index) {
          <button type="button" [class.on]="i === index()" [attr.aria-pressed]="i === index()" (click)="index.set(i)">
            <small>{{ e.period }}</small>
            <span>{{ e.name }}</span>
          </button>
        }
      </nav>
      <div class="frame">
        <app-bible-map [map]="map" [era]="era()" [nearby]="false" [focus]="focus" />
      </div>
      <ul class="legend">
        @for (p of era().powers; track p.name) {
          <li><i [style.background]="p.color"></i><span><strong>{{ p.name }}</strong>@if (p.note) { <span class="note"> — {{ p.note }}</span> }</span></li>
        }
      </ul>
      <p class="summary">{{ era().summary }}</p>
      <ol class="events">
        @for (ev of era().events; track ev.text) {
          <li>
            <span class="date">{{ ev.year }}</span>
            <span>{{ ev.text }} @if (ev.ref) { <button type="button" class="ref" (click)="open(ev.ref)">{{ ev.ref }}</button> }</span>
          </li>
        }
      </ol>
      <div class="foot">
        <button type="button" class="step" [disabled]="index() === 0" (click)="index.set(index() - 1)"><mat-icon>chevron_left</mat-icon> Antes</button>
        <span>{{ index() + 1 }} de {{ eras().length }}</span>
        <button type="button" class="step" [disabled]="index() === eras().length - 1" (click)="index.set(index() + 1)">Depois <mat-icon iconPositionEnd>chevron_right</mat-icon></button>
      </div>
      <a class="atlas" [routerLink]="['/atlas']" [queryParams]="{ epoca: era().id }">Ver no atlas completo <mat-icon>arrow_forward</mat-icon></a>
      <p class="credit">Fronteiras antigas aproximadas, para estudo. Litoral: Natural Earth (domínio público).</p>
    </figure>
  `,
  styles: `
    :host { display: block; margin: 24px 0; }
    .era-map { margin: 0; padding: 14px; border-radius: 20px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    .head mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .stages { display: flex; gap: 8px; margin: 0 -14px 10px; padding: 2px 14px 6px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; }
    .stages::-webkit-scrollbar { display: none; }
    .stages button { flex: none; scroll-snap-align: start; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; min-height: 48px; padding: 6px 12px; border-radius: 14px; cursor: pointer; text-align: left; font: 600 13px/1.25 Inter, sans-serif; color: var(--mat-sys-on-surface); background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); max-width: 190px; }
    .stages small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .stages button.on { background: var(--mat-sys-primary-container); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary-container); }
    .stages button.on small { color: inherit; }
    .frame { border-radius: 14px; overflow: hidden; aspect-ratio: 4 / 3; background: var(--map-sea); border: 1px solid var(--mat-sys-outline-variant); }
    .frame app-bible-map { display: block; width: 100%; height: 100%; }
    .legend { list-style: none; margin: 12px 0 8px; padding: 0; display: grid; gap: 6px; font: 400 14px/1.4 Inter, sans-serif; }
    .legend li { display: flex; gap: 8px; align-items: flex-start; }
    .legend i { flex: none; width: 14px; height: 14px; margin-top: 3px; border-radius: 4px; opacity: .85; }
    .note { color: var(--mat-sys-on-surface-variant); }
    .summary { margin: 8px 0; font: 400 15px/1.55 var(--reading-font); }
    .events { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 6px; font: 400 14px/1.45 Inter, sans-serif; }
    .events li { display: grid; grid-template-columns: 92px 1fr; gap: 8px; }
    .date { font-weight: 700; color: var(--accent-gold); }
    .ref { display: inline; padding: 0; border: 0; background: none; cursor: pointer; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: underline; min-height: 24px; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .step { display: inline-flex; align-items: center; gap: 2px; min-height: 44px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-primary); cursor: pointer; font: 600 14px Inter, sans-serif; }
    .step:disabled { opacity: .4; cursor: default; }
    .atlas { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; margin-top: 4px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }
    .credit { margin: 4px 0 0; font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    @media (min-width: 840px) { .events li { grid-template-columns: 110px 1fr; } }
  `,
})
export class EraMap {
  /** Ids das épocas do atlas, na ordem em que aparecem. */
  readonly ids = input.required<string[]>();
  private readonly sheets = inject(Sheets);
  protected readonly map = BRIDGE_MAP;
  protected readonly focus = BRIDGE_FOCUS;
  protected readonly index = signal(0);
  protected readonly eras = computed(() => this.ids().map((id) => findEra(id)!).filter(Boolean));
  protected readonly era = computed(() => this.eras()[Math.min(this.index(), this.eras().length - 1)]);

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}
