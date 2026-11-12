import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { distanceKm } from '../../core/atlas';
import type { Lonlat } from '../../core/atlas';
import type { BibleMap, MapPlace, MapStep, MapTerritory } from '../../core/maps';
import { BibleMapView } from '../bible-map';
import { MapStory } from '../map-story';
import { Sheets } from '../sheets';
import * as GEO from './jerusalem-geo';

/**
 * Mapa da Paixão no visualizador de mapas do app (mesma geografia, câmera, marcadores e escala do mapa "A vida de
 * Jesus"). O id 'vida-de-jesus' reaproveita a geografia já gerada em public/maps; o resto (lugares, etapas, texto e o
 * fundo de Jerusalém, de jerusalem-geo.ts) vive nesta pasta (shared/paixao).
 *
 * Fundo e caminhos: © colaboradores do OpenStreetMap (ODbL). Muralhas, igrejas e ruas são as de HOJE, só de referência.
 * O caminho a pé é o do roteador do OpenStreetMap (perfil a pé) pelas ruas de hoje, não o trajeto do século I.
 */
export const BOUNDS: [number, number, number, number] = [30.9, 29.7, 36.3, 33.5];
export const LANDMARK = { name: 'Templo', lon: 35.2353, lat: 31.778 };

export const GOLD = 'var(--accent-gold)';
export const WATER = 'var(--map-river)';
export const WALL = 'color-mix(in srgb, var(--map-ink) 42%, transparent)';
const BUILDING = 'color-mix(in srgb, var(--accent-gold) 55%, var(--map-ink))';
export const ROUTE = 'var(--mat-sys-primary)';
const ROUTE_NOW = 'var(--accent-gold)';
const ROUTE_FUTURE = 'color-mix(in srgb, var(--mat-sys-primary) 30%, transparent)';

const PLACES: MapPlace[] = [
  // Etapas (ganham número)
  { id: 'cenaculo', name: 'Cenáculo', lon: 35.22927, lat: 31.77191, label: 'l', uncertain: true, group: 'Jerusalém' },
  { id: 'getsemani', name: 'Getsêmani', lon: 35.23977, lat: 31.7793, label: 'r', group: 'Jerusalém' },
  { id: 'caifas', name: 'Casa de Caifás', lon: 35.23207, lat: 31.77127, label: 'b', uncertain: true, group: 'Jerusalém' },
  { id: 'antonia', name: 'Fortaleza Antônia', lon: 35.23362, lat: 31.78044, label: 't', uncertain: true, group: 'Jerusalém' },
  { id: 'palacio', name: 'Palácio de Herodes', lon: 35.22799, lat: 31.77516, label: 'l', uncertain: true, group: 'Jerusalém' },
  { id: 'golgota', name: 'Gólgota e o sepulcro', lon: 35.22979, lat: 31.77834, label: 'b', uncertain: true, group: 'Jerusalém' },
  // Regiões (nomes em itálico, só de perto)
  { id: 'oliveiras', name: 'Oliveiras', lon: 35.2432, lat: 31.7766, region: true, detail: true },
  { id: 'cedrom', name: 'Cedrom', lon: 35.2418, lat: 31.7744, region: true, detail: true },
  { id: 'davi', name: 'Cidade de Davi', lon: 35.2372, lat: 31.7728, region: true, detail: true },
  { id: 'siao', name: 'Sião', lon: 35.2288, lat: 31.7694, region: true, detail: true },
  { id: 'hinom', name: 'Hinom', lon: 35.2262, lat: 31.7673, region: true, detail: true },
];

/** Ponto de referência (aparece com "Igrejas e portões de hoje"): o Túmulo do Jardim, que tem localização debatida. O Cenáculo agora é a primeira etapa. */
const REFS: MapPlace[] = [
  { id: 'tumulo-do-jardim', name: 'Túmulo do Jardim', lon: 35.2304, lat: 31.7838, label: 'r', uncertain: true, group: 'Jerusalém' },
];

/** Portões de hoje, só para a pessoa se localizar (aparecem com "Igrejas e portões de hoje"). */
const GATES: MapPlace[] = [
  { id: 'portao-de-jafa', name: 'Portão de Jafa', lon: 35.22754, lat: 31.77663, label: 'l' },
  { id: 'portao-de-damasco', name: 'Portão de Damasco', lon: 35.23035, lat: 31.78168, label: 'l' },
  { id: 'portao-dos-leoes', name: 'Portão dos Leões', lon: 35.23692, lat: 31.78084, label: 'r' },
];

type Step = MapStep & { short: string; title?: string };

/**
 * As etapas não são só trechos de caminho: há idas e vindas (Pilatos, Herodes, Pilatos de novo). Cada trecho termina numa
 * etapa (LEG_END); a linha da tabela de quilômetros de cada etapa é STEP_ROW. Herodes Antipas fica no pretório porque o
 * Evangelho não diz onde ele estava hospedado. A primeira etapa é o cenáculo (a ceia), de onde parte o primeiro trecho.
 */
const LEG_END = [1, 2, 3, 6];
const STEP_ROW = [0, 1, 2, 3, 3, 3, 4, 4, 4];

interface Leg {
  key: string;
  from: string;
  to: string;
  /** Em linha reta (km, duas casas). */
  straight: number;
  /** A pé, pelas ruas de hoje (km, duas casas). */
  walk: number;
  line: Lonlat[];
}

const r2 = (x: number) => Math.round(x * 100) / 100;
const fmt = (km: number) => km.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km';
const place = (id: string) => [...PLACES, ...REFS, ...GATES].find((p) => p.id === id)!;

function legsFor(western: boolean): Leg[] {
  const pre = western ? 'palacio' : 'antonia';
  const pairs: [string, string, string][] = [
    ['cenaculo', 'getsemani', 'cenaculo-getsemani'],
    ['getsemani', 'caifas', 'getsemani-caifas'],
    ['caifas', pre, western ? 'caifas-palacio' : 'caifas-antonia'],
    [pre, 'golgota', western ? 'palacio-golgota' : 'antonia-golgota'],
  ];
  return pairs.map(([from, to, key]) => ({
    key,
    from,
    to,
    straight: r2(distanceKm(place(from), place(to))),
    walk: r2(GEO.WALKS[key].km),
    line: GEO.WALKS[key].line,
  }));
}

/** Ponto no meio do caminho (pelo comprimento da linha). */
function middle(line: Lonlat[]): Lonlat {
  const seg = line.slice(1).map((p, i) => distanceKm({ lon: line[i][0], lat: line[i][1] }, { lon: p[0], lat: p[1] }));
  const half = seg.reduce((a, b) => a + b, 0) / 2;
  let acc = 0;
  for (let i = 0; i < seg.length; i++) {
    if (acc + seg[i] >= half) {
      const t = seg[i] ? (half - acc) / seg[i] : 0;
      return [line[i][0] + (line[i + 1][0] - line[i][0]) * t, line[i][1] + (line[i + 1][1] - line[i][1]) * t];
    }
    acc += seg[i];
  }
  return line[line.length - 1];
}

const M_LAT = 110574;
const M_LON = 111320 * Math.cos((31.777 * Math.PI) / 180);

/** Faixa estreita em volta de uma linha (largura em metros): dá corpo ao caminho, que o mapa desenha como região. */
export function ribbon(line: Lonlat[], widthM: number): Lonlat[] {
  const half = widthM / 2;
  const left: Lonlat[] = [];
  const right: Lonlat[] = [];
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = (b[0] - a[0]) * M_LON;
    const dy = (b[1] - a[1]) * M_LAT;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    left.push([line[i][0] + (nx * half) / M_LON, line[i][1] + (ny * half) / M_LAT]);
    right.push([line[i][0] - (nx * half) / M_LON, line[i][1] - (ny * half) / M_LAT]);
  }
  return [...left, ...right.reverse()];
}

/** Linha fina: um polígono sem área (vai e volta), que o mapa desenha só com o traço. */
export const thin = (id: string, line: Lonlat[], color: string): MapTerritory => ({ id, name: id, color, polygon: [...line, ...line.slice(0, -1).reverse()] });
export const area = (id: string, ring: Lonlat[], color: string): MapTerritory => ({ id, name: id, color, polygon: ring });

interface View {
  western: boolean;
  mode: 'all' | 'step';
  step: number;
  modern: boolean;
  journey?: boolean;
}

function buildMap(v: View): BibleMap {
  const legs = legsFor(v.western);
  const pre = v.western ? 'palacio' : 'antonia';
  const east = !v.western;
  // Quantos trechos já foram percorridos e qual deles é o da etapa atual
  const done = v.mode === 'all' ? legs.length : LEG_END.filter((end) => end <= v.step).length;
  const now = v.mode === 'step' && LEG_END.includes(v.step) ? LEG_END.indexOf(v.step) : null;

  const steps: Step[] = [
    { place: 'cenaculo', short: 'A ceia', title: 'A ceia no cenáculo', ref: 'Mc 14.12-26; Mt 26.17-30; Jo 13.1-17', text: 'Na quinta-feira, ao anoitecer, Jesus ceia a páscoa com os doze num grande cenáculo mobiliado, na cidade. Ali vêm o lava-pés, a traição anunciada, o pão e o cálice. Ao fim, cantam o hino e saem para o monte das Oliveiras.' },
    { place: 'getsemani', short: 'O jardim', ref: 'Mt 26.30; Lc 22.39-46; Jo 18.1-12', text: `Depois do hino, Jesus sai com os discípulos e atravessa o ribeiro de Cedrom: ${fmt(legs[0].walk)} a pé do cenáculo ao jardim, pelas ruas de hoje. No olival, ao pé do monte das Oliveiras: a oração em angústia, o suor como gotas de sangue, o beijo de Judas e a prisão. Os discípulos fogem.` },
    { place: 'caifas', short: 'Anás e Caifás', ref: 'Jo 18.13-27; Mt 26.57-75', text: `Atravessa o vale de volta e sobe ao bairro alto, no monte Sião: ${fmt(legs[1].walk)} a pé, pelas ruas de hoje. João diz que foi levado primeiro a Anás e depois a Caifás; a casa de Anás não está localizada, e o mapa a junta à de Caifás. Bofetadas, socos, o rosto coberto. No pátio, Pedro nega três vezes e o galo canta. Ao amanhecer, o conselho confirma a decisão (Lc 22.66-71).` },
    { place: pre, short: 'Pilatos, 1ª vez', title: 'Diante de Pilatos, pela primeira vez', ref: 'Jo 18.28-38', text: `De manhã cedo, ao pretório: ${fmt(legs[2].walk)} a pé, pelas ruas de hoje. Os acusadores ficam do lado de fora, para não se contaminarem antes da Páscoa. Pilatos, o prefeito, ouve as acusações e declara: “Não acho nele crime algum”.` },
    { place: pre, short: 'Herodes', title: 'Ida a Herodes Antipas', ref: 'Lc 23.6-12', text: 'Ao saber que Jesus é galileu, Pilatos o manda a Herodes Antipas, tetrarca da Galileia, que estava em Jerusalém para a festa. O Evangelho não diz onde ele estava hospedado, por isso o ponto não está no mapa: a etapa fica no pretório, e a distância desta ida e volta não entra na conta. Antipas zomba de Jesus e o devolve.' },
    { place: pre, short: 'Pilatos, 2ª vez', title: 'Diante de Pilatos, pela segunda vez', ref: 'Lc 23.13-25; Jo 19.1-16', text: 'Jesus volta ao pretório. Aqui vêm Barrabás, o açoite, a coroa de espinhos, o “Eis o homem” e a sentença, no lugar chamado Pavimento. Pilatos tenta soltá-lo, e cede.' },
    { place: 'golgota', short: 'A cruz', ref: 'Jo 19.17-30; Lc 23.26-33', text: `Com a trave, ajudado por Simão de Cirene, segue ao lugar da Caveira, perto da cidade: ${fmt(legs[3].walk)} a pé pelas ruas de hoje${east ? ', que são a Via Dolorosa' : ''}. Ali, a placa, a hora nona, o clamor e a morte.` },
    { place: 'golgota', short: 'O sepultamento', ref: 'Jo 19.38-42', text: 'José de Arimateia e Nicodemos tiram o corpo e o sepultam num túmulo novo, no jardim ao lado do lugar da crucificação.' },
    { place: 'golgota', short: 'O primeiro dia', ref: 'Jo 20.1-18', text: 'No primeiro dia da semana, o sepulcro está aberto. Maria Madalena, chorando no jardim, ouve o próprio nome.' },
  ];

  const territories: MapTerritory[] = [];
  GEO.KIDRON.forEach((l, i) => territories.push(thin(`cedrom-${i}`, l, WATER)));
  GEO.HINNOM.forEach((l, i) => territories.push(thin(`hinom-${i}`, l, WATER)));
  territories.push(area('monte-do-templo', GEO.TEMPLE_MOUNT, GOLD));
  if (v.modern) {
    territories.push(area('cupula-da-rocha', GEO.DOME_OF_THE_ROCK, GOLD), area('al-aqsa', GEO.AL_AQSA, GOLD));
    const churches: [string, Lonlat[]][] = [
      ['santo-sepulcro', GEO.HOLY_SEPULCHRE],
      ['todas-as-nacoes', GEO.ALL_NATIONS],
      ['cenaculo', GEO.CENACLE],
      ['gallicantu', GEO.GALLICANTU],
      ['flagelacao', GEO.FLAGELLATION],
      ['ecce-homo', GEO.ECCE_HOMO],
      ['torre-de-davi', GEO.TOWER_OF_DAVID],
      ['tumulo-do-jardim', GEO.GARDEN_TOMB],
    ];
    churches.forEach(([id, ring]) => territories.push(area(id, ring, BUILDING)));
  }
  GEO.OLD_CITY_WALL.forEach((l, i) => territories.push(thin(`muralha-${i}`, l, WALL)));
  legs.forEach((leg, i) => {
    const color = i < done ? (i === now ? ROUTE_NOW : ROUTE) : ROUTE_FUTURE;
    // O mapa preenche regiões com 30% de opacidade: três camadas iguais deixam o caminho firme
    for (let k = 0; k < 3; k++) territories.push(area(`caminho-${leg.key}-${k}`, ribbon(leg.line, 24), color));
  });

  // Quilômetros do trecho da etapa atual, escritos no meio do caminho (na jornada em tela cheia, de todos os trechos já percorridos)
  const labels: MapPlace[] = legs
    .map((leg, i) => ({ leg, i }))
    .filter(({ i }) => (v.journey ? i < done : i === now))
    .map(({ leg, i }) => {
      const [lon, lat] = middle(leg.line);
      const viaDolorosa = east && i === 3;
      return { id: `km-${i}`, name: `${viaDolorosa ? 'Via Dolorosa · ' : ''}${fmt(leg.walk)}`, lon, lat, label: i === 2 ? 'l' : 'r' } as MapPlace;
    });

  return {
    id: 'vida-de-jesus',
    title: 'Do cenáculo ao sepulcro',
    period: 'Páscoa · século I',
    summary: 'O caminho de Jesus em Jerusalém, do cenáculo ao sepulcro.',
    icon: 'public',
    bounds: BOUNDS,
    // Aproximação máxima de cada etapa e do percurso inteiro (fração da largura do mapa: ~1,5 km e ~1,8 km de largura)
    zoom: 0.0030,
    focusZoom: 0.0033,
    // Na jornada em tela cheia o mapa não desenha a linha reta (o caminho a pé já está nas regiões); na página ela é escondida por CSS
    route: v.journey ? false : true,
    chapters: [],
    landmark: LANDMARK,
    places: [...PLACES, ...(v.modern ? [...REFS, ...GATES] : []), ...labels],
    steps,
    territories,
  };
}

@Component({
  selector: 'app-passion-route',
  imports: [MatIconModule, BibleMapView],
  template: `
    <figure class="route">
      <figcaption class="head"><mat-icon>public</mat-icon> Do cenáculo ao sepulcro, em Jerusalém</figcaption>
      <div class="seg" role="group" aria-label="Onde ficava o pretório de Pilatos">
        <span class="seg-title">Onde ficava o pretório?</span>
        <button type="button" [attr.aria-pressed]="!western()" (click)="setWestern(false)">Fortaleza Antônia<small>tradição</small></button>
        <button type="button" [attr.aria-pressed]="western()" (click)="setWestern(true)">Palácio de Herodes<small>hipótese</small></button>
      </div>
      <div class="seg" role="group" aria-label="O que mostrar no mapa">
        <button type="button" [attr.aria-pressed]="mode() === 'all'" (click)="showAll()">Percurso inteiro</button>
        <button type="button" [attr.aria-pressed]="mode() === 'step'" (click)="showSteps()">Etapa por etapa</button>
      </div>
      <div class="frame">
        <app-bible-map [map]="map()" [storyStep]="viewerStep()" [focus]="viewerFocus()" [interactive]="interactive()" />
      </div>
      <div class="kmchip" [class.arrival]="mode() === 'step' && step() >= 6" aria-hidden="true">
        <strong>{{ chip().title }}</strong>
        <span>{{ chip().detail }}</span>
      </div>
      <div class="layers" role="group" aria-label="Opções do mapa">
        <button type="button" class="chip go" (click)="openJourney()"><mat-icon>play_arrow</mat-icon> Viver a jornada</button>
        <button type="button" class="chip" [attr.aria-pressed]="modern()" (click)="modern.set(!modern())">Igrejas e portões de hoje</button>
        <button type="button" class="chip" [attr.aria-pressed]="interactive()" (click)="toggleInteractive()">Mover e aproximar</button>
        @if (interactive()) { <button type="button" class="chip" (click)="reframe()">Voltar ao enquadramento</button> }
      </div>
      <p class="legend">
        <b>Números</b>: etapas. <b>(?)</b>: local debatido. Ponto pequeno: a outra hipótese do pretório. Faixa: caminho a pé de hoje, em dourado o trecho atual. Herodes não tem ponto: o Evangelho não diz onde ele estava.
        @if (interactive()) { Arraste para mover; dois dedos ou Ctrl + roda do mouse aproximam. }
      </p>
      <nav class="steps" aria-label="Etapas do percurso">
        @for (s of steps(); track $index) {
          <button type="button" [class.on]="mode() === 'step' && $index === step()" [attr.aria-current]="mode() === 'step' && $index === step() ? 'step' : null" (click)="go($index)">
            <b>{{ $index + 1 }}</b>
            <span>{{ s.short }}@if (stepWalk()[$index]; as w) { <small>+ {{ w }}</small> }</span>
          </button>
        }
      </nav>
      <article class="card" aria-live="polite">
        @if (mode() === 'all') {
          <header><span class="num">∑</span><strong>O percurso inteiro</strong><span class="count">{{ steps().length }} etapas</span></header>
          <p class="text">Do cenáculo ao sepulcro, em nove etapas. Escolha uma etapa, ou use “Etapa por etapa”, para ver cada momento de perto. A conta dos quilômetros está na tabela abaixo.</p>
        } @else {
          <header><span class="num">{{ step() + 1 }}</span><strong>{{ placeName() }}</strong><span class="count">{{ step() + 1 }} de {{ steps().length }}</span></header>
          <p class="text">{{ current().text }}</p>
          <p class="meta">
            <button type="button" class="ref" (click)="open(current().ref)"><mat-icon>menu_book</mat-icon> {{ current().ref }}</button>
            @if (legIndex() !== null) { <span class="leg">Trecho: {{ fmt(legs()[legIndex()!].walk) }} a pé ({{ fmt(legs()[legIndex()!].straight) }} em linha reta) · percorrido até aqui: {{ fmt(walked()) }}</span> }
          </p>
        }
      </article>
      <div class="controls">
        <button type="button" (click)="go(step() - 1)" [disabled]="mode() === 'all' || step() === 0" aria-label="Etapa anterior"><mat-icon>skip_previous</mat-icon></button>
        <button type="button" class="play" (click)="toggle()"><mat-icon>{{ playing() ? 'pause' : atEnd() ? 'replay' : 'play_arrow' }}</mat-icon> {{ playing() ? 'Pausar' : atEnd() ? 'Recomeçar' : 'Reproduzir percurso' }}</button>
        <button type="button" (click)="go(mode() === 'all' ? 0 : step() + 1)" [disabled]="mode() === 'step' && atEnd()" aria-label="Próxima etapa"><mat-icon>skip_next</mat-icon></button>
      </div>
      <table class="kmtable">
        <caption>Quilômetros de cada trecho (aproximados)</caption>
        <thead><tr><th scope="col">Lugar</th><th scope="col">Em linha reta</th><th scope="col">A pé hoje</th><th scope="col">Soma a pé</th></tr></thead>
        <tbody>
          @for (r of rows(); track r.id; let i = $index) {
            <tr [class.here]="mode() === 'step' && i === rowIndex()">
              <th scope="row"><button type="button" class="rowbtn" (click)="go(i)"><b>{{ i + 1 }}</b> {{ r.name }}</button></th>
              <td>{{ r.straight === null ? '—' : '+ ' + r.straight.toFixed(2).replace('.', ',') }}</td>
              <td>{{ r.walk === null ? '—' : '+ ' + r.walk.toFixed(2).replace('.', ',') }}</td>
              <td>{{ r.walk === null ? 'início' : r.sum.toFixed(2).replace('.', ',') }}</td>
            </tr>
          }
        </tbody>
        <tfoot><tr><th scope="row">Do cenáculo ao Gólgota (km)</th><td><strong>{{ totalStraight().toFixed(2).replace('.', ',') }}</strong></td><td colspan="2"><strong>{{ totalWalk().toFixed(2).replace('.', ',') }}</strong> a pé</td></tr></tfoot>
      </table>
      <p class="note">Com o pretório {{ other().where }}, o total é de {{ fmt(other().walk) }} a pé ({{ fmt(other().straight) }} em linha reta). São ordens de grandeza, não medidas: a Jerusalém do século I tinha outras ruas e nenhum Evangelho dá o número. A ida a Herodes Antipas, cujo endereço não se conhece, não entra nesses totais. Se ele estivesse a cerca de 1,1 km do pretório (a distância a pé entre a Fortaleza Antônia e o palácio de Herodes), a ida e a volta somariam cerca de {{ fmt(herodTrip) }}, e o total iria de {{ fmt(withHerod().low) }} a {{ fmt(withHerod().high) }}. O caminho a pé é o que o roteador do OpenStreetMap calcula para quem caminha hoje entre os mesmos pontos.</p>
      <p class="credit">Fundo e caminhos a pé: © colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> (licença ODbL), consultados em 10 de novembro de 2026 (o trecho do cenáculo ao jardim e a distância da Fortaleza Antônia ao palácio de Herodes, em 12 de novembro). A muralha, as igrejas e os portões são os de hoje, só de referência. Cenáculo, casa de Caifás (a igreja de São Pedro in Gallicantu), pretório e Gólgota têm localização debatida. O Túmulo do Jardim é uma identificação do século XIX adotada por muitos protestantes; a tradição antiga e a maioria dos historiadores indicam o Santo Sepulcro. Litoral e rios do fundo regional: Natural Earth (domínio público). Fontes sobre o pretório: <a href="https://www.terrasanctamuseum.org/en/discover-more/the-praetorium-of-pilate-and-the-house-of-herod/" target="_blank" rel="noopener noreferrer">Terra Sancta Museum</a> e <a href="https://www.tod.org.il/en/event/open-doors-herods-palace/" target="_blank" rel="noopener noreferrer">Torre de Davi</a>.</p>
    </figure>
  `,
  styleUrl: './passion-route.scss',
})
export class PassionRoute {
  private readonly sheets = inject(Sheets);
  private readonly overlay = inject(Overlay);
  private overlayRef: OverlayRef | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly mode = signal<'all' | 'step'>('all');
  protected readonly step = signal(0);
  protected readonly playing = signal(false);
  protected readonly western = signal(false);
  protected readonly modern = signal(false);
  protected readonly interactive = signal(false);
  private readonly reframing = signal(false);
  protected readonly fmt = fmt;

  protected readonly legs = computed(() => legsFor(this.western()));
  protected readonly map = computed(() => buildMap({ western: this.western(), mode: this.mode(), step: this.step(), modern: this.modern() }));
  protected readonly steps = computed(() => this.map().steps as Step[]);
  protected readonly current = computed(() => this.steps()[this.step()]);
  protected readonly atEnd = computed(() => this.mode() === 'step' && this.step() === this.steps().length - 1);
  protected readonly placeName = computed(() => this.current().title ?? place(this.current().place).name);

  private readonly pretorio = computed(() => (this.western() ? 'palacio' : 'antonia'));
  private readonly focusIds = computed(() => ['cenaculo', 'getsemani', 'caifas', this.pretorio(), 'golgota']);
  protected readonly viewerStep = computed(() => (this.reframing() || this.mode() === 'all' ? null : this.step()));
  protected readonly viewerFocus = computed(() => (this.reframing() || this.mode() === 'step' ? null : this.focusIds()));

  /** O total na outra hipótese do pretório, para a pessoa comparar sem precisar trocar. */
  protected readonly other = computed(() => {
    const west = !this.western();
    const legs = legsFor(west);
    return { where: west ? 'no palácio de Herodes' : 'na Fortaleza Antônia', walk: r2(legs.reduce((a, l) => a + l.walk, 0)), straight: r2(legs.reduce((a, l) => a + l.straight, 0)) };
  });

  protected readonly totalStraight = computed(() => r2(this.legs().reduce((s, l) => s + l.straight, 0)));
  protected readonly totalWalk = computed(() => r2(this.legs().reduce((s, l) => s + l.walk, 0)));

  /** Ida e volta a Herodes Antipas, se ele estivesse a cerca de 1,1 km do pretório (o endereço dele é desconhecido): duas vezes 1,114 km, a distância a pé entre a Fortaleza Antônia e o palácio de Herodes no roteador do OpenStreetMap, em 12/11/2026. Ordem de grandeza, não medida. */
  protected readonly herodTrip = r2(2 * 1.114);
  protected readonly withHerod = computed(() => {
    const here = this.totalWalk();
    const there = this.other().walk;
    return { low: r2(Math.min(here, there) + this.herodTrip), high: r2(Math.max(here, there) + this.herodTrip) };
  });

  /** Cinco lugares da conta, com o trecho, a soma a pé e os dois modos de medir. */
  protected readonly rows = computed(() => {
    const legs = this.legs();
    const ids = ['cenaculo', 'getsemani', 'caifas', this.pretorio(), 'golgota'];
    let sum = 0;
    return ids.map((id, i) => {
      const leg = i === 0 ? null : legs[i - 1];
      sum = r2(sum + (leg?.walk ?? 0));
      const name = i === 3 ? `Pretório · ${place(id).name}` : place(id).name;
      return { id, name, straight: leg?.straight ?? null, walk: leg?.walk ?? null, sum };
    });
  });
  protected readonly rowIndex = computed(() => STEP_ROW[Math.min(this.step(), STEP_ROW.length - 1)]);
  protected readonly walked = computed(() => this.rows()[this.rowIndex()].sum);
  /** Trecho que leva à etapa atual (null no cenáculo e nas etapas que não andam, como Herodes). */
  protected readonly legIndex = computed(() => {
    const k = LEG_END.indexOf(this.step());
    return k >= 0 ? k : null;
  });
  /** Trecho a pé de cada etapa, escrito nos botões das etapas. */
  protected readonly stepWalk = computed(() => this.steps().map((_, i) => (LEG_END.includes(i) ? fmt(this.legs()[LEG_END.indexOf(i)].walk) : null)));

  protected readonly chip = computed(() => {
    const totalWalk = fmt(this.totalWalk());
    const totalStraight = fmt(this.totalStraight());
    if (this.mode() === 'all') return { title: 'Percurso inteiro', detail: `A pé ≈ ${totalWalk} · reta ${totalStraight}` };
    const i = this.step();
    if (i === 0) return { title: 'Começa no cenáculo', detail: `Até o Gólgota: ≈ ${totalWalk} a pé` };
    if (i === 4) return { title: 'Ida a Herodes Antipas', detail: 'Local desconhecido: não entra na conta' };
    if (i === 5) return { title: 'Pilatos, pela segunda vez', detail: 'No mesmo pretório: sem trecho novo no mapa' };
    if (i >= 6) return { title: 'Chegada ao Gólgota', detail: `Total ≈ ${totalWalk} a pé · reta ${totalStraight}` };
    const leg = this.legs()[LEG_END.indexOf(i)];
    return { title: `Este trecho: ${fmt(leg.walk)} a pé`, detail: `Reta: ${fmt(leg.straight)} · soma: ${this.walked().toFixed(2).replace('.', ',')} de ${totalWalk}` };
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.closeJourney();
    });
  }

  protected setWestern(value: boolean): void {
    this.western.set(value);
  }

  protected showAll(): void {
    this.stop();
    this.mode.set('all');
  }

  protected showSteps(): void {
    this.stop();
    this.mode.set('step');
  }

  protected go(index: number): void {
    this.stop();
    this.mode.set('step');
    this.step.set(Math.max(0, Math.min(this.steps().length - 1, index)));
  }

  protected toggle(): void {
    if (this.playing()) {
      this.stop();
      return;
    }
    if (this.mode() === 'all' || this.atEnd()) {
      this.mode.set('step');
      this.step.set(0);
    }
    this.playing.set(true);
    this.schedule();
  }

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }

  protected toggleInteractive(): void {
    const on = !this.interactive();
    this.interactive.set(on);
    if (!on) this.reframe();
  }

  /** Volta a câmera ao enquadramento da etapa (ou do percurso inteiro): o mapa só refaz o enquadramento quando a entrada muda. */
  protected reframe(): void {
    this.reframing.set(true);
    setTimeout(() => this.reframing.set(false), 80);
  }

  /** A jornada em tela cheia (câmera, versículo e narração) abre fora do artigo: o texto prende elementos de tela cheia. */
  protected openJourney(): void {
    if (this.overlayRef) return;
    this.stop();
    const ref = this.overlay.create({ positionStrategy: this.overlay.position().global(), scrollStrategy: this.overlay.scrollStrategies.noop(), panelClass: 'passion-journey' });
    const component = ref.attach(new ComponentPortal(MapStory));
    component.setInput('map', buildMap({ western: this.western(), mode: 'all', step: 0, modern: this.modern(), journey: true }));
    component.instance.closed.subscribe(() => this.closeJourney());
    this.overlayRef = ref;
  }

  private closeJourney(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }

  private stop(): void {
    this.playing.set(false);
    clearTimeout(this.timer);
  }

  private schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.playing()) return;
      if (this.atEnd()) {
        this.playing.set(false);
        return;
      }
      this.step.update((s) => s + 1);
      this.schedule();
    }, 7000);
  }
}
