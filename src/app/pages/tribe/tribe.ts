import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { formatKm } from '../../core/atlas';
import { campSideName, daysLabel, distances, findTribe, TRIBES, TRIBES_MAP } from '../../core/tribes';
import { BackButton } from '../../shared/back-button';
import { BibleMapView } from '../../shared/bible-map';
import { PassageView } from '../../shared/passage-view';
import { RichText } from '../../shared/rich-text';
import { Sheets } from '../../shared/sheets';
import { tribeOrigin } from '../tribes/tribes';

/** Uma das tribos de Israel: patriarca, bênçãos, vocação, líderes, território e personagens. */
@Component({
  selector: 'app-tribe',
  imports: [DecimalPipe, RouterLink, MatIconModule, MatRippleModule, BackButton, BibleMapView, PassageView, RichText],
  template: `
    @if (tribe(); as t) {
      <div class="article">
        <div class="top"><app-back fallback="/tribos" label="Voltar às tribos" /></div>

        <span class="overline">Tribo de Israel · {{ origin(t) }}</span>
        <h1 class="title"><i class="swatch" [style.background]="t.color"></i>{{ t.name }}</h1>
        <p class="epithet">{{ t.role }}</p>
        <p class="meaning"><mat-icon>badge</mat-icon><span>O nome significa: <strong>{{ t.meaning }}</strong> <button class="inline-ref" (click)="openRef(t.birthRef)">{{ t.birthRef }}</button></span></p>

        <aside class="hook-box" [style.--c]="t.color">
          <mat-icon>lightbulb</mat-icon>
          <p><strong>Você sabia?</strong> {{ t.hook.text }} <button class="inline-ref" (click)="openRef(t.hook.ref)">{{ t.hook.ref }}</button></p>
        </aside>

        <div class="numbers">
          <span><small>No Sinai</small>{{ t.census.sinai | number: '1.0-0' : 'pt-BR' }} homens</span>
          <span><small>Até o templo</small>{{ territoryDistances()[0]?.temple ?? 'sem território' }}</span>
          <span><small>Acampava</small>{{ sideName(t.camp.side) }}</span>
        </div>

        <dl class="facts">
          <div><dt>Pais</dt><dd>{{ t.father }} e {{ t.mother }}</dd></div>
          <div><dt>Censos</dt><dd>{{ t.census.sinai | number: '1.0-0' : 'pt-BR' }} no Sinai · {{ t.census.moab | number: '1.0-0' : 'pt-BR' }} em Moabe
            <button class="inline-ref" (click)="openRef(t.census.refs)">{{ t.census.refs }}</button></dd></div>
          <div><dt>Acampamento</dt><dd>{{ sideName(t.camp.side) }} — {{ t.camp.text }}</dd></div>
          @for (d of territoryDistances(); track d.name) {
            <div><dt>Até o templo</dt><dd>{{ d.name }}: {{ d.temple }} em linha reta ({{ d.days }} a pé) · {{ d.shiloh }} de Siló</dd></div>
          }
        </dl>
        @if (t.census.note; as note) { <app-rich-text class="small-note" [source]="note" /> }
        @if (patriarch(); as p) {
          <a class="card link" matRipple [routerLink]="['/memorial', p]"><mat-icon>military_tech</mat-icon><span><small>Memorial da Fé</small>O patriarca: {{ p === 'jose' ? 'José' : t.name }}</span><mat-icon class="go">chevron_right</mat-icon></a>
        }

        <h2 class="section-title">A vocação da tribo</h2>
        <app-rich-text [source]="t.calling" />

        <h2 class="section-title">A bênção de Jacó</h2>
        <app-passage-view [refs]="t.jacob.ref" />
        <p class="comment">{{ t.jacob.text }}</p>

        <h2 class="section-title">A bênção de Moisés</h2>
        @if (t.moses.ref; as ref) { <app-passage-view [refs]="ref" /> }
        <app-rich-text class="comment" [source]="t.moses.text" />

        <h2 class="section-title">{{ t.territories.length ? 'O território' : 'A herança' }}</h2>
        @if (t.territories.length) {
          <div class="map-frame"><app-bible-map [map]="map" [interactive]="true" [highlight]="t.id" /></div>
          @for (x of t.territories; track x.id) {
            <p class="territory"><strong>{{ x.name }}</strong> — {{ x.summary }}. <span class="cities">Cidades: {{ x.cities }}.</span>
              <button class="inline-ref" (click)="openRef(x.ref)">{{ x.ref }}</button></p>
          }
        }
        <app-rich-text [source]="t.land" />

        <h2 class="section-title">Os líderes</h2>
        <ul class="leaders">
          @for (l of t.leaders; track l.ref) {
            <li><small>{{ l.office }}</small><span>{{ l.name }}</span><button class="inline-ref" (click)="openRef(l.ref)">{{ l.ref }}</button></li>
          }
        </ul>

        @if (t.people.length) {
          <h2 class="section-title">Personagens da tribo</h2>
          <ul class="people">
            @for (p of t.people; track p.name) {
              <li>
                @if (p.person) { <a [routerLink]="['/memorial', p.person]">{{ p.name }}</a> } @else { <strong>{{ p.name }}</strong> }
                — {{ p.note }} <button class="inline-ref" (click)="openRef(p.ref)">{{ p.ref }}</button>
              </li>
            }
          </ul>
        }

        <h2 class="section-title">Na história de Israel</h2>
        <app-rich-text [source]="t.history" />

        <nav class="neighbours">
          @if (neighbours().prev; as prev) {
            <a class="card" matRipple [routerLink]="['/tribos', prev.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ prev.name }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as next) {
            <a class="card next" matRipple [routerLink]="['/tribos', next.id]"><span><small>Próxima</small>{{ next.name }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
    } @else {
      <p class="empty">Tribo não encontrada. <a routerLink="/tribos">Ver as doze tribos</a></p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    h1.title { display: flex; align-items: center; gap: 12px; }
    .swatch { flex: none; width: 18px; height: 18px; border-radius: 6px; }
    .epithet { margin: 0 0 10px; font: 500 18px/1.4 var(--heading-font); color: var(--mat-sys-primary); }
    .meaning { display: flex; align-items: flex-start; gap: 8px; margin: 0 0 16px; color: var(--mat-sys-on-surface-variant); }
    .meaning mat-icon { flex: none; color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .hook-box {
      display: flex; gap: 12px; margin: 0 0 14px; padding: 14px 16px; border-radius: 18px;
      background: color-mix(in srgb, var(--c) 14%, var(--mat-sys-surface-container-low)); border-left: 4px solid var(--c);
    }
    .hook-box mat-icon { flex: none; color: var(--accent-gold); }
    .hook-box p { margin: 0; font: 400 17px/1.55 var(--reading-font); }
    .numbers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 14px; }
    .numbers span {
      display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 14px; min-width: 0;
      background: var(--mat-sys-surface-container); font: 600 15px/1.3 var(--heading-font);
    }
    .numbers small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .facts { margin: 0 0 12px; border-radius: 16px; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); }
    .facts div { display: grid; grid-template-columns: minmax(96px, 30%) minmax(0, 1fr); gap: 12px; padding: 10px 14px; }
    .facts div + div { border-top: 1px solid var(--mat-sys-outline-variant); }
    dt { font: 600 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    dd { margin: 0; font: 400 15px/1.5 var(--reading-font); }
    .inline-ref {
      display: inline-flex; align-items: center; min-height: 32px; padding: 0 4px; border: 0; background: none; cursor: pointer;
      color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: underline; text-underline-offset: 3px;
    }
    .small-note { display: block; margin: 0 4px 12px; font-size: 14px; color: var(--mat-sys-on-surface-variant); }
    .link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; margin-top: 8px; }
    .link > mat-icon { color: var(--accent-gold); }
    .link span { flex: 1; display: flex; flex-direction: column; font: 600 15px/1.3 var(--heading-font); }
    .link small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .link .go { color: var(--mat-sys-on-surface-variant); }
    .comment { display: block; margin: 10px 4px 0; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .map-frame {
      border-radius: 20px; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); background: var(--map-sea);
      margin-bottom: 12px;
    }
    .map-frame app-bible-map { display: block; aspect-ratio: 4 / 5; max-height: 70vh; }
    .territory { margin: 0 4px 10px; font: 400 16px/1.6 var(--reading-font); }
    .cities { color: var(--mat-sys-on-surface-variant); }
    .leaders, .people { list-style: none; margin: 0; padding: 0; }
    .leaders li {
      display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; align-items: center;
      padding: 10px 4px; border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .leaders small { grid-column: 1 / -1; font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .leaders span { font: 600 16px/1.35 var(--heading-font); }
    .people li { padding: 10px 4px; border-bottom: 1px solid var(--mat-sys-outline-variant); font: 400 16px/1.55 var(--reading-font); }
    .people a { color: var(--mat-sys-primary); font-weight: 600; }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 32px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class TribePage {
  readonly id = input.required<string>();
  private readonly sheets = inject(Sheets);
  protected readonly map = TRIBES_MAP;
  protected readonly origin = tribeOrigin;
  protected readonly sideName = campSideName;

  protected readonly tribe = computed(() => findTribe(this.id()));
  protected readonly patriarch = computed(() => this.tribe()?.person ?? null);

  protected readonly territoryDistances = computed(() =>
    (this.tribe()?.territories ?? []).map((x) => {
      const d = distances(x);
      return { name: x.name, temple: formatKm(d.temple), shiloh: formatKm(d.shiloh), days: daysLabel(d) };
    }),
  );

  protected readonly neighbours = computed(() => {
    const i = TRIBES.findIndex((t) => t.id === this.id());
    return { prev: i > 0 ? TRIBES[i - 1] : null, next: i >= 0 && i < TRIBES.length - 1 ? TRIBES[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const t = this.tribe();
      title.setTitle(t ? `Tribo de ${t.name} · Bíblia Sagrada` : 'Tribos de Israel · Bíblia Sagrada');
    });
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
