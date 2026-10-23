import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { formatKm } from '../../core/atlas';
import {
  CAMP, campSideName, daysLabel, distances, DIVISION_TEXT, PILGRIMAGE_TEXT, TERRITORIES, Tribe, TRIBE_QUESTIONS, TRIBES, TRIBES_MAP,
} from '../../core/tribes';
import { BibleMapView } from '../../shared/bible-map';
import { RichText } from '../../shared/rich-text';
import { SourcesBox } from '../../shared/sources-box';

/** Origem da tribo: "4º filho de Jacó · Lia" ou "Filho de José". */
export const tribeOrigin = (t: Tribe) => (t.order ? `${t.order}º filho de Jacó · ${t.mother.split(',')[0]}` : 'Filho de José, adotado por Jacó');

/** As doze tribos de Israel: os filhos de Jacó, a divisão da terra, o acampamento e as perguntas mais comuns. */
@Component({
  selector: 'app-tribes',
  imports: [DecimalPipe, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, BibleMapView, RichText, SourcesBox],
  template: `
    <header class="page-head">
      <span class="overline">Estudo bíblico</span>
      <h1>As doze tribos de Israel</h1>
      <p>Os filhos de Jacó, as bênçãos de cada um, os líderes, o acampamento no deserto e a divisão da terra — com a distância de cada tribo até o templo.</p>
    </header>

    <section class="hooks" aria-labelledby="hooks-title">
      <h2 id="hooks-title" class="hooks-title"><mat-icon>lightbulb</mat-icon> Você sabia?</h2>
      <div class="scroller">
        @for (t of hooks; track t.id) {
          <a class="hook" matRipple [routerLink]="['/tribos', t.id]" [style.--c]="t.color">
            <span class="tag"><i></i>Tribo de {{ t.name }}</span>
            <span class="text">{{ t.hook.text }}</span>
            <span class="more">{{ t.hook.ref }} · Conhecer a tribo <mat-icon>arrow_forward</mat-icon></span>
          </a>
        }
      </div>
    </section>

    <nav class="toc" aria-label="Partes do estudo">
      @for (s of parts; track s.id) {
        <a [href]="'#' + s.id" (click)="jump($event, s.id)">{{ s.title }}</a>
      }
    </nav>

    <section id="tribos">
      <h2 class="section-title">Os filhos de Jacó</h2>
      <p class="intro">Na ordem em que nasceram (Gênesis 29–35). José não dá nome a uma tribo: os seus dois filhos, Efraim e Manassés, foram adotados por Jacó e se tornaram tribos.</p>
      <div class="grid">
        @for (t of tribes; track t.id) {
          <a class="card row" matRipple [routerLink]="['/tribos', t.id]">
            <span class="badge swatch" [style.--c]="t.color">{{ t.name.charAt(0) }}</span>
            <span class="texts">
              <span class="meta">{{ origin(t) }}</span>
              <span class="name">{{ t.name }}</span>
              <span class="desc">{{ t.role }}</span>
            </span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      </div>
    </section>

    <section id="mapa">
      <h2 class="section-title">A divisão da terra</h2>
      <div class="card map-card">
        <app-bible-map [map]="map" [interactive]="true" [highlight]="focus()" [activeStep]="activeStep()" (activeStepChange)="onStep($event)" />
        <div class="legend" role="group" aria-label="Destacar o território de uma tribo">
          @for (t of mapped; track t.id) {
            <button [class.on]="focus() === t.id" [attr.aria-pressed]="focus() === t.id" (click)="toggle(t.id)">
              <i [style.background]="t.color"></i>{{ t.name }}
            </button>
          }
        </div>
        <a mat-stroked-button class="open-map" routerLink="/mapas/tribos-de-israel"><mat-icon>map</mat-icon> Ver o mapa território por território</a>
      </div>
      <p class="hint">Fronteiras aproximadas, a partir de Josué 13–19. Toque numa tribo para destacar o território. Levi não aparece: recebeu cidades em todas as tribos.</p>
      <app-rich-text [source]="division" />
    </section>

    <section id="jerusalem">
      <h2 class="section-title">Subir a Jerusalém</h2>
      <app-rich-text [source]="pilgrimage" />
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Território</th><th>Até o templo</th><th>A pé</th><th>Até Siló</th></tr></thead>
          <tbody>
            @for (r of distanceRows; track r.id) {
              <tr>
                <td><a [routerLink]="['/tribos', r.tribe]"><i [style.background]="r.color"></i>{{ r.name }}</a></td>
                <td>{{ r.temple }}</td>
                <td>{{ r.days }}</td>
                <td>{{ r.shiloh }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="hint">Em linha reta, do centro aproximado de cada território. A pé, contando estradas cerca de 30% mais longas e uns 25 km por dia.</p>
    </section>

    <section id="acampamento">
      <h2 class="section-title">O acampamento no deserto</h2>
      <app-rich-text class="intro" [source]="campIntro" />
      <div class="camp">
        @for (c of camp; track c.side) {
          <div class="side" [class]="c.side">
            <span class="dir">{{ sideName(c.side) }}</span>
            <span class="names">
              @for (id of c.tribes; track id; let last = $last) {
                <a [routerLink]="['/tribos', id]">{{ nameOf(id) }}</a>{{ last ? '' : ' · ' }}
              }
            </span>
            <small>{{ c.total | number: '1.0-0' : 'pt-BR' }} homens · {{ c.march }}</small>
          </div>
        }
        <div class="side center">
          <mat-icon>holiday_village</mat-icon>
          <span class="names">Tabernáculo</span>
          <small><a routerLink="/tribos/levi">Levitas</a> em volta; Moisés e os sacerdotes a leste</small>
        </div>
      </div>

      <details class="more-box">
      <summary><span>Os dois censos <small>Quem cresceu e quem encolheu em 38 anos de deserto</small></span><mat-icon>expand_more</mat-icon></summary>
      <app-rich-text class="intro" [source]="censusIntro" />
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Tribo</th><th>Sinai</th><th>Moabe</th><th>Diferença</th></tr></thead>
          <tbody>
            @for (t of censusRows; track t.id) {
              <tr>
                <td><a [routerLink]="['/tribos', t.id]"><i [style.background]="t.color"></i>{{ t.name }}</a></td>
                <td>{{ t.sinai | number: '1.0-0' : 'pt-BR' }}</td>
                <td>{{ t.moab | number: '1.0-0' : 'pt-BR' }}</td>
                <td [class.down]="t.diff < 0">{{ t.diff > 0 ? '+' : '' }}{{ t.diff | number: '1.0-0' : 'pt-BR' }}</td>
              </tr>
            }
            <tr class="total"><td>Total</td><td>603.550</td><td>601.730</td><td class="down">−1.820</td></tr>
          </tbody>
        </table>
      </div>
      <p class="hint">Sem Levi, que era contado à parte: 22.000 e 23.000 homens de um mês para cima.</p>
      </details>
    </section>

    <section id="perguntas" class="questions">
      <h2 class="section-title">Perguntas sobre as tribos</h2>
      @for (q of questions; track q.q) {
        <details>
          <summary>{{ q.q }}<mat-icon>expand_more</mat-icon></summary>
          <app-rich-text [source]="q.a" />
        </details>
      }
    </section>
    <app-sources topic="tribos" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .toc { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 8px; }
    .toc a {
      display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 20px; text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
    section { scroll-margin-top: 72px; }
    .intro { display: block; margin: 0 4px 14px; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .swatch { color: #fff !important; background: var(--c) !important; font: 700 18px var(--heading-font); }
    .map-card { padding-bottom: 12px; }
    .map-card app-bible-map { display: block; aspect-ratio: 4 / 5; max-height: 72vh; margin: 0 auto; overflow: hidden; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .legend { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px 12px 4px; }
    .legend button {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer;
      background: none; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    .legend button.on { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-color: transparent; }
    i { display: inline-block; flex: none; width: 12px; height: 12px; border-radius: 4px; }
    .open-map { margin: 8px 12px 0; }
    .hint { margin: 10px 4px 16px; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .table-wrap { border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); overflow: hidden; }
    .data { width: 100%; border-collapse: collapse; font: 400 14px/1.4 Inter, sans-serif; }
    .data th { text-align: left; padding: 10px; font-weight: 600; color: var(--mat-sys-on-surface-variant); background: var(--mat-sys-surface-container); }
    .data td { padding: 9px 10px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .data td:first-child a { display: inline-flex; align-items: center; gap: 8px; color: var(--mat-sys-primary); font-weight: 600; text-decoration: none; }
    .data .down { color: var(--mat-sys-error); }
    .data .total td { font-weight: 600; background: var(--mat-sys-surface-container-low); }
    .camp {
      display: grid; gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-areas: '. norte .' 'oeste center leste' '. sul .';
    }
    .side {
      display: flex; flex-direction: column; gap: 4px; padding: 10px; border-radius: 14px; min-width: 0;
      background: var(--mat-sys-surface-container); text-align: center;
    }
    .side.norte { grid-area: norte; } .side.sul { grid-area: sul; } .side.leste { grid-area: leste; } .side.oeste { grid-area: oeste; }
    .side.center { grid-area: center; align-items: center; justify-content: center; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .side.leste { border: 2px solid var(--accent-gold); }
    .dir { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .center .dir, .center mat-icon { color: inherit; }
    .names { font: 600 15px/1.35 var(--heading-font); overflow-wrap: anywhere; }
    .names a, .side small a { color: inherit; }
    .side small { font: 400 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .center small { color: inherit; }
    .hooks { margin: 0 -20px 18px; }
    .hooks-title { display: flex; align-items: center; gap: 8px; margin: 0 20px 10px; font: 600 20px var(--heading-font); }
    .hooks-title mat-icon { color: var(--accent-gold); }
    .scroller { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 2px 20px 10px; scrollbar-width: none; }
    .scroller::-webkit-scrollbar { display: none; }
    .hook {
      position: relative; overflow: hidden; flex: 0 0 min(78%, 300px); scroll-snap-align: start; display: flex; flex-direction: column; gap: 8px;
      padding: 16px; border-radius: 20px; text-decoration: none; color: inherit; border: 1px solid var(--mat-sys-outline-variant);
      background: linear-gradient(160deg, color-mix(in srgb, var(--c) 16%, var(--mat-sys-surface-container-low)), var(--mat-sys-surface-container-low) 70%);
    }
    .tag { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--mat-sys-on-surface-variant); }
    .tag i { background: var(--c); }
    .hook .text { flex: 1; font: 500 17px/1.45 var(--heading-font); }
    .more { display: inline-flex; align-items: center; gap: 4px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .more mat-icon { font-size: 16px; width: 16px; height: 16px; }
    @media (min-width: 840px) { .hooks { margin: 0 0 18px; } .scroller { padding: 2px 0 10px; } .hooks-title { margin: 0 0 10px; } }
    .more-box { margin-top: 18px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); padding: 0 12px; }
    .more-box summary {
      display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 56px; cursor: pointer; list-style: none;
      font: 600 17px/1.3 var(--heading-font);
    }
    .more-box summary::-webkit-details-marker { display: none; }
    .more-box summary span { display: flex; flex-direction: column; gap: 2px; }
    .more-box summary small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .more-box[open] summary mat-icon { transform: rotate(180deg); }
    .more-box[open] { padding-bottom: 12px; }
    .questions details { border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .questions summary {
      display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 48px; padding: 8px 4px;
      cursor: pointer; list-style: none; font: 600 16px/1.4 var(--heading-font);
    }
    .questions summary::-webkit-details-marker { display: none; }
    .questions details[open] summary mat-icon { transform: rotate(180deg); }
    .questions app-rich-text { display: block; padding: 0 4px 12px; }
  `,
})
export class TribesPage {
  protected readonly tribes = TRIBES;
  /** As curiosidades em ordem diferente a cada visita. */
  protected readonly hooks = [...TRIBES].sort(() => Math.random() - 0.5);
  protected readonly map = TRIBES_MAP;
  protected readonly camp = CAMP;
  protected readonly questions = TRIBE_QUESTIONS;
  protected readonly division = DIVISION_TEXT;
  protected readonly pilgrimage = PILGRIMAGE_TEXT;
  protected readonly campIntro =
    'No deserto, as tribos acampavam em quatro grupos de três, cada uma junto à sua bandeira, com o tabernáculo e os levitas no meio [[Nm 2.1-34]]. A entrada do tabernáculo ficava a leste, e era Judá que acampava ali e marchava na frente [[Nm 10.14]].';
  protected readonly censusIntro =
    'Moisés contou os homens de vinte anos para cima no Sinai [[Nm 1.1-3]] e, 38 anos depois, nas campinas de Moabe, a nova geração [[Nm 26.1-4]] [[Nm 26.63-65]].';
  protected readonly origin = tribeOrigin;
  protected readonly sideName = campSideName;
  protected readonly parts = [
    { id: 'tribos', title: 'As tribos' },
    { id: 'mapa', title: 'A divisão da terra' },
    { id: 'jerusalem', title: 'Subir a Jerusalém' },
    { id: 'acampamento', title: 'O acampamento' },
    { id: 'perguntas', title: 'Perguntas' },
  ];

  /** Tribos com território (as duas metades de Manassés e as duas partes de Dã destacam juntas). */
  protected readonly mapped = TRIBES.filter((t) => t.territories.length);
  protected readonly focus = signal<string | null>(null);
  protected readonly activeStep = computed(() => {
    const f = this.focus();
    const i = TRIBES_MAP.steps.findIndex((s) => s.place === f);
    return i >= 0 ? i : null;
  });

  protected readonly distanceRows = TERRITORIES.map(({ tribe, territory }) => {
    const d = distances(territory);
    return { id: territory.id, tribe: tribe.id, name: territory.name, color: tribe.color, km: d.temple, temple: formatKm(d.temple), shiloh: formatKm(d.shiloh), days: daysLabel(d) };
  }).sort((a, b) => a.km - b.km);

  protected readonly censusRows = TRIBES.filter((t) => t.id !== 'levi').map((t) => ({
    id: t.id, name: t.name, color: t.color, sinai: t.census.sinai, moab: t.census.moab, diff: t.census.moab - t.census.sinai,
  }));

  protected nameOf(id: string): string {
    return TRIBES.find((t) => t.id === id)?.name ?? id;
  }

  protected toggle(id: string): void {
    this.focus.set(this.focus() === id ? null : id);
  }

  /** Tocar num número do mapa destaca o território daquela etapa. */
  protected onStep(index: number | null): void {
    const place = index === null ? null : TRIBES_MAP.steps[index]?.place;
    const territory = TERRITORIES.find((x) => x.territory.id === place);
    this.focus.set(territory ? territory.tribe.id : null);
  }

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
