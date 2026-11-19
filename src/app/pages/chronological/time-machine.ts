import { afterNextRender, Component, computed, DestroyRef, effect, ElementRef, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BRIDGE_FOCUS, BRIDGE_MAP } from '../../core/atlas';
import { CHRONO_GROUPS, PHASE_COLORS, timelineSegments } from '../../core/bible-chronological';
import { buildLives, type Life, phaseOfLife } from '../../core/contemporaries';
import { ContentService } from '../../core/content.service';
import {
  aliveAt,
  booksOfPhase,
  clampPpy,
  clampYear,
  eraAt,
  eventsNear,
  isInBible,
  packLanes,
  phaseAt,
  phaseMiddle,
  phaseShares,
  rulerTicks,
  timelineEvents,
  TM_DEFAULT_PPY,
  TM_END,
  TM_START,
  yearText,
} from '../../core/time-machine';
import { BibleMapView } from '../../shared/bible-map';
import { Sheets } from '../../shared/sheets';

const LANE = 20; // altura de uma fileira de vidas, em px
const LANE_GAP = 3;
const TICKS_H = 28;
const PHASE_H = 28;
const EVENTS_H = 34;
/** Anos por segundo em cada velocidade do botão de reproduzir. */
const SPEEDS = [30, 80, 200];

/** Escolhe a cor de letra (escura ou clara) que dá mais contraste sobre uma cor de fundo. */
function inkFor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (lum + 0.05) / 0.06 >= 1.05 / (lum + 0.05) ? '#10150f' : '#ffffff';
}

const prefersReducedMotion = (): boolean => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * A Máquina do Tempo: um cursor no ano move tudo junto. O mapa troca para o império daquele tempo, as vidas das pessoas passam por baixo do
 * cursor e acendem as que estavam vivas, e o painel diz quem vivia, o que acontecia no mundo e quais livros contam aquele tempo.
 * Arrasta-se a faixa, usam-se as setas ou aperta-se ▶ para viajar.
 */
@Component({
  selector: 'app-time-machine',
  imports: [RouterLink, MatIconModule, BibleMapView],
  template: `
    <section class="tm" aria-labelledby="tm-title">
      <header class="tm-head">
        <div>
          <span class="kicker">Viagem no tempo</span>
          <h2 id="tm-title">A Máquina do Tempo</h2>
          <p>Arraste a faixa, use as setas do teclado ou aperte ▶: o mapa, as pessoas e o mundo mudam junto com o ano.</p>
        </div>
      </header>

      <div class="tm-grid">
        <figure class="map">
          <div class="frame">
            <app-bible-map [map]="map" [era]="era()" [nearby]="false" [focus]="focus" />
            <span class="year-chip" aria-hidden="true">{{ yearLabel() }}</span>
            <span class="era-chip" aria-hidden="true">{{ era().name }}</span>
          </div>
          <figcaption>Fronteiras antigas aproximadas, para estudo. Litoral: Natural Earth (domínio público).</figcaption>
        </figure>
        <div class="controls" role="group" aria-label="Controles da viagem">
          <button type="button" class="play" (click)="togglePlay()" [attr.aria-pressed]="playing()" [attr.aria-label]="playing() ? 'Pausar a viagem' : 'Reproduzir a viagem'">
            <mat-icon aria-hidden="true">{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon>{{ playing() ? 'Pausar' : 'Viajar' }}
          </button>
          <button type="button" class="speed" (click)="cycleSpeed()" [attr.aria-label]="'Velocidade: ' + rate() + ' anos por segundo. Tocar para mudar.'">{{ rate() }} anos/s</button>
          <span class="spacer"></span>
          <button type="button" class="zoom" (click)="zoom(1 / 1.4)" aria-label="Afastar a faixa" [disabled]="ppy() <= minPpy">−</button>
          <button type="button" class="zoom" (click)="zoom(1.4)" aria-label="Aproximar a faixa" [disabled]="ppy() >= maxPpy">+</button>
        </div>
        <div class="ribbon-wrap">
        <div #ribbon class="ribbon" role="slider" tabindex="0" aria-label="Ano da viagem no tempo" aria-roledescription="linha do tempo"
             [attr.aria-valuemin]="start" [attr.aria-valuemax]="end" [attr.aria-valuenow]="yearInt()" [attr.aria-valuetext]="yearLabel()"
             [style.height.px]="ribbonHeight()" [class.dragging]="dragging()"
             (pointerdown)="onDown($event)" (pointermove)="onMove($event)" (pointerup)="onUp($event)" (pointercancel)="onUp($event)" (keydown)="onKey($event)">
          <div class="world" aria-hidden="true" [style.transform]="worldTransform()" [style.width.px]="worldWidth()">
            <div class="ticks">
              @for (t of ticks(); track t) { <span class="tick" [style.left.px]="x(t)"><b>{{ yearText(t) }}</b></span> }
            </div>
            <div class="phases" [style.top.px]="ticksH">
              @for (s of segments; track s.id) {
                <span class="ph" [style.left.px]="x(s.from)" [style.width.px]="span(s.from, s.to)" [style.--c]="color(s.id)" [style.--ink]="ink(s.id)" [style.padding-left.px]="labelShift(s.from, s.to)" [class.here]="s.id === phaseKey()">
                  @if (span(s.from, s.to) > 150) { {{ phaseName(s.id) }} }
                </span>
              }
              <span class="ph gap" [style.left.px]="x(gap.from)" [style.width.px]="span(gap.from, gap.to)"><mat-icon>hourglass_empty</mat-icon>@if (span(gap.from, gap.to) > 150) { 400 anos sem livros }</span>
            </div>
            <div class="lanes" [style.top.px]="ticksH + phaseH + 8">
              @for (l of dated(); track l.id) {
                <span class="bar" [attr.data-id]="l.id" [attr.title]="l.name + ' · ' + l.text" [class.live]="live().has(l.id)" [class.dot]="l.precision === 'ponto'"
                      [style.left.px]="l.precision === 'ponto' ? x(l.from) - 6 : x(l.from)" [style.width.px]="l.precision === 'ponto' ? 12 : span(l.from, l.to)"
                      [style.top.px]="lane()[l.id] * laneStep" [style.--c]="color(phaseOfLife(l))" [style.--ink]="ink(phaseOfLife(l))">
                  @if (l.precision !== 'ponto' && fits(l)) { {{ l.name }} }
                </span>
              }
              @if (century().length) {
                <span class="bar century" [attr.title]="century().length + ' pessoas do século I, sem anos exatos'" [class.live]="yearInt() >= 1"
                      [style.left.px]="x(1)" [style.width.px]="span(1, end)" [style.top.px]="laneCount() * laneStep">Século I · {{ century().length }} pessoas</span>
              }
            </div>
            <div class="marks" [style.top.px]="ticksH + phaseH + 8 + (laneCount() + 1) * laneStep + 4">
              @for (e of shownMarkers(); track e.id) {
                <span class="mark" [class.out]="!inBible(e)" [attr.data-year]="e.from" [attr.title]="yearText(e.from) + ' · ' + e.title + (inBible(e) ? ' (na Bíblia)' : ' (fora da Bíblia)')"
                      [class.near]="nearIds().has(e.id)" [style.left.px]="x(e.from)"></span>
              }
            </div>
          </div>
          <div class="playhead" aria-hidden="true"><span class="flag">{{ yearLabel() }}</span></div>
          <div class="fade left" aria-hidden="true"></div><div class="fade right" aria-hidden="true"></div>
        </div>
        <p class="tm-hint">
          Toque numa vida para ir até ela. As acesas são as de quem estava vivo no ano do cursor. Embaixo, cada fato do mundo:
          <span class="leg"><i class="sw"></i> o que a Bíblia conta</span> e <span class="leg"><i class="sw out"></i> o que ficou fora dela e atingiu povos de qualquer fé</span>.
        </p>
        </div>
        <div class="info">
          <p class="eyebrow">Neste ano</p>
          <p class="year" aria-hidden="true">{{ yearLabel() }}</p>

          <div class="block era-block">
            <h3>No mapa</h3>
            <p class="era-name"><strong>{{ era().name }}</strong> <span>{{ era().period }}</span></p>
            <ul class="powers">
              @for (p of era().powers; track p.name) { <li><i [style.background]="p.color"></i>{{ p.name }}</li> }
            </ul>
          </div>

          @if (phaseInfo(); as ph) {
            <div class="block">
              <h3>Na Bíblia</h3>
              <p class="phase-line" [style.--c]="color(ph.id)"><mat-icon aria-hidden="true">{{ ph.icon }}</mat-icon><span><strong>{{ ph.name }}</strong> <small>{{ ph.period }}</small></span></p>
              <p class="shares">Ocupa {{ share(ph.id) }}.</p>
              <ul class="chips">
                @for (b of books(); track b.id) {
                  <li><a [routerLink]="['/ler', b.id, b.chapter]" [queryParams]="chronoParam">{{ b.name }}</a></li>
                }
              </ul>
            </div>
          } @else {
            <div class="block silence">
              <h3>Na Bíblia</h3>
              <p class="phase-line"><mat-icon aria-hidden="true">hourglass_empty</mat-icon><span><strong>Os 400 anos de silêncio</strong> <small>entre Malaquias e Jesus</small></span></p>
              <p class="shares">Nenhum livro da Bíblia foi escrito nestes anos. A história continuou: persas, Alexandre, os Macabeus e Roma.</p>
              <p><a class="more" routerLink="/epocas/entre-testamentos">Conhecer este período</a></p>
            </div>
          }

          <div class="block">
            <h3>Quem vivia <span class="count">{{ alive().length }}</span></h3>
            @if (alive().length) {
              <ul class="chips people">
                @for (l of shownAlive(); track l.id) {
                  <li>
                    @if (l.id === 'jesus') { <span class="chip-static">{{ l.name }}</span> }
                    @else { <a [routerLink]="['/memorial', l.id]" [attr.title]="l.text">{{ l.name }}</a> }
                  </li>
                }
                @if (alive().length > previewPeople) {
                  <li><button type="button" class="more" (click)="allAlive.set(!allAlive())" [attr.aria-expanded]="allAlive()">{{ allAlive() ? 'Menos' : '+ ' + (alive().length - previewPeople) }}</button></li>
                }
              </ul>
            } @else {
              <p class="muted">Nenhuma pessoa do Memorial tem anos neste tempo.</p>
            }
          </div>

        </div>
        <div class="events-wrap">
          <div class="block">
            <h3>No mundo</h3>
            <div class="ev-filter" role="group" aria-label="Quais fatos do mundo mostrar">
              <button type="button" class="tog bible" [attr.aria-pressed]="showBible()" (click)="showBible.set(!showBible())">Na Bíblia</button>
              <button type="button" class="tog outside" [attr.aria-pressed]="showOutside()" (click)="showOutside.set(!showOutside())">Fora da Bíblia</button>
            </div>
            @if (events().length) {
              <ul class="events">
                @for (e of events(); track e.id) {
                  <li>
                    <button type="button" class="ev" (click)="goTo(e.from)"><span class="ev-year">{{ yearText(e.from) }}</span><span class="ev-title">{{ e.title }}</span></button>
                    <span class="tag" [class.out]="!inBible(e)">{{ inBible(e) ? 'Na Bíblia' : 'Fora da Bíblia' }}</span>
                    @if (e.ref) { <button type="button" class="ref" (click)="open(e.ref)">{{ e.ref }}</button> }
                  </li>
                }
              </ul>
            } @else {
              <p class="muted">{{ showBible() || showOutside() ? 'Nenhum fato do mundo registrado por perto.' : 'Escolha acima quais fatos mostrar.' }}</p>
            }
          </div>
        </div>
      </div>
      <div class="sr" role="status" aria-live="polite">{{ announce() }}</div>
    </section>
  `,
  styles: `
    :host { display: block; margin-top: 14px; }
    .tm { --gold: var(--accent-gold); --out: color-mix(in srgb, #3aa0bf 55%, var(--mat-sys-on-surface)); --cream: var(--mat-sys-on-surface); --muted: var(--mat-sys-on-surface-variant); --tm-surface: var(--mat-sys-surface-container-low); --tm-soft: var(--mat-sys-surface-container); --tm-border: var(--mat-sys-outline-variant); --tm-plot: var(--mat-sys-surface); position: relative; padding: 18px 16px 16px; border-radius: 24px; color: var(--cream); overflow: hidden;
      background: var(--tm-surface); border: 1px solid var(--tm-border); box-shadow: var(--shadow-soft); }
    .tm-head .kicker { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.6px; color: var(--gold); }
    .tm-head h2 { margin: 2px 0 4px; font: 600 clamp(24px, 4vw, 34px)/1.12 var(--heading-font); color: var(--cream); }
    .tm-head p { margin: 0 0 14px; max-width: 62ch; font: 400 15px/1.55 Inter, sans-serif; color: var(--muted); }

    /* Celular: mapa, controles, faixa e só então o painel (a faixa fica junto do mapa, para ver o que muda ao arrastar). Computador: mapa e fatos à esquerda, painel à direita, faixa embaixo. */
    .tm-grid { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
    @media (min-width: 900px) {
      .tm-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); grid-template-areas: 'map info' 'controls info' 'events info' 'ribbon ribbon'; }
      .map { grid-area: map; } .controls { grid-area: controls; } .events-wrap { grid-area: events; } .info { grid-area: info; align-self: start; } .ribbon-wrap { grid-area: ribbon; }
      .year-chip { display: none; }
    }
    .map { margin: 0; }
    .frame { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 16 / 11; background: var(--map-sea); border: 1px solid var(--tm-border); }
    @media (min-width: 900px) { .frame { aspect-ratio: 4 / 3; } }
    .frame app-bible-map { display: block; width: 100%; height: 100%; }
    .year-chip { position: absolute; left: 10px; top: 10px; padding: 4px 14px; border-radius: 14px; background: color-mix(in srgb, var(--tm-surface) 94%, transparent); color: var(--gold); font: 600 26px/1.2 var(--heading-font); backdrop-filter: blur(4px); }
    .era-chip { position: absolute; left: 10px; bottom: 10px; max-width: calc(100% - 20px); padding: 4px 12px; border-radius: 14px; background: color-mix(in srgb, var(--tm-surface) 94%, transparent); color: var(--cream); font: 600 13px/1.3 Inter, sans-serif; backdrop-filter: blur(4px); }
    figcaption { margin-top: 6px; font: 400 13px/1.4 Inter, sans-serif; color: var(--muted); }

    .info { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
    .eyebrow { margin: 0; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--muted); }
    .year { margin: -6px 0 0; font: 600 clamp(40px, 7vw, 64px)/1 var(--heading-font); color: var(--gold); letter-spacing: -.5px; }
    .block { padding: 10px 12px; border-radius: 14px; background: var(--tm-soft); border: 1px solid var(--tm-border); }
    .block h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.1px; color: var(--muted); }
    .count { display: inline-grid; place-items: center; min-width: 24px; height: 22px; padding: 0 6px; border-radius: 11px; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); letter-spacing: 0; }
    .era-name { margin: 0 0 6px; font: 400 14px/1.4 Inter, sans-serif; } .era-name strong { color: var(--cream); font-family: var(--heading-font); font-size: 16px; } .era-name span { color: var(--muted); margin-left: 8px; }
    .powers { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 12px; font: 400 13px/1.4 Inter, sans-serif; color: var(--cream); }
    .powers li { display: inline-flex; align-items: center; gap: 6px; } .powers i { width: 12px; height: 12px; border-radius: 3px; flex: none; border: 1px solid var(--mat-sys-outline); }
    .phase-line { display: flex; align-items: center; gap: 10px; margin: 0 0 4px; padding-left: 10px; border-left: 4px solid var(--c, var(--gold)); font: 400 15px/1.3 Inter, sans-serif; }
    .phase-line strong { font: 600 17px/1.25 var(--heading-font); color: var(--cream); } .phase-line small { display: block; font: 400 13px Inter, sans-serif; color: var(--muted); }
    .phase-line mat-icon { color: var(--gold); flex: none; }
    .shares, .muted { margin: 0 0 6px; font: 400 14px/1.5 Inter, sans-serif; color: var(--muted); }
    .chips { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
    .chips a, .chip-static, .more {
      display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 20px; text-decoration: none; cursor: pointer;
      background: var(--tm-surface); color: var(--cream); border: 1px solid var(--mat-sys-outline); font: 500 14px Inter, sans-serif;
    }
    .more { background: transparent; color: var(--gold); border-color: var(--gold); }
    .silence p a.more { text-decoration: none; }
    .events { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .events li { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    .ev { display: inline-flex; align-items: baseline; gap: 8px; min-height: 40px; padding: 0 4px; text-align: left; background: none; border: 0; color: var(--cream); cursor: pointer; font: 500 14px/1.3 Inter, sans-serif; }
    .ev-year { color: var(--gold); font-weight: 600; white-space: nowrap; }
    .ref { min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer; background: transparent; color: var(--gold); border: 1px solid var(--gold); font: 600 13px Inter, sans-serif; }

    .controls { display: flex; align-items: center; gap: 8px; }
    .controls .spacer { flex: 1; }
    .controls button { min-height: 44px; border-radius: 22px; cursor: pointer; font: 600 14px Inter, sans-serif; border: 1px solid var(--mat-sys-outline); background: var(--tm-surface); color: var(--cream); }
    .controls button:disabled { opacity: .45; cursor: default; }
    .play { display: inline-flex; align-items: center; gap: 6px; padding: 0 18px 0 12px; background: var(--mat-sys-primary) !important; color: var(--mat-sys-on-primary) !important; border-color: var(--mat-sys-primary) !important; }
    .speed { padding: 0 14px; white-space: nowrap; } .zoom { width: 44px; font-size: 22px !important; line-height: 1; }

    .ribbon { position: relative; overflow: hidden; border-radius: 16px; background: var(--tm-plot); border: 1px solid var(--tm-border); cursor: grab; touch-action: pan-y; user-select: none; outline-offset: 3px; }
    .ribbon.dragging { cursor: grabbing; } .ribbon:focus-visible { outline: 3px solid var(--gold); }
    .world { position: absolute; left: 0; top: 0; bottom: 0; will-change: transform; }
    .ticks { position: absolute; left: 0; right: 0; top: 0; height: 28px; }
    .tick { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px solid var(--tm-border); } .tick b { position: absolute; top: 5px; left: 6px; font: 500 14px Inter, sans-serif; color: var(--muted); white-space: nowrap; }
    .phases { position: absolute; left: 0; right: 0; height: 28px; }
    .ph { position: absolute; top: 0; height: 28px; display: flex; align-items: center; padding: 0 10px; border-radius: 8px; font: 600 13px Inter, sans-serif; overflow: hidden; white-space: nowrap; box-sizing: border-box; background: color-mix(in srgb, var(--c) 22%, var(--tm-plot)); color: var(--cream); }
    .ph.here { background: var(--c); color: var(--ink); box-shadow: 0 0 0 2px var(--tm-surface); z-index: 1; }
    .ph.gap { background: none; border: 1px dashed var(--mat-sys-outline); color: var(--muted); gap: 6px; } .ph.gap mat-icon { width: 18px; height: 18px; font-size: 18px; }
    .lanes, .marks { position: absolute; left: 0; right: 0; }
    .bar { position: absolute; height: 20px; display: flex; align-items: center; padding: 0 8px; border-radius: 10px; font: 600 13px Inter, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; cursor: pointer; transition: background .15s, box-shadow .15s; background: color-mix(in srgb, var(--c) 22%, var(--tm-plot)); color: var(--cream); }
    .bar.dot { padding: 0; border-radius: 50%; width: 12px !important; height: 12px; margin-top: 4px; }
    .bar.live { background: var(--c); color: var(--ink); box-shadow: 0 0 0 2px var(--tm-surface), 0 0 0 3px color-mix(in srgb, var(--c) 65%, var(--tm-plot)); z-index: 2; }
    .bar.century { background: repeating-linear-gradient(135deg, #d0603a 0 6px, #8c3f27 6px 12px) !important; color: #fff !important; }
    .mark { position: absolute; top: 0; width: 12px; height: 12px; margin-left: -6px; background: var(--gold); transform: rotate(45deg); opacity: .75; cursor: pointer; }
    .mark.out { top: 22px; border-radius: 50%; transform: none; background: var(--out); }
    .mark.near { opacity: 1; box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 28%, transparent); } .mark.out.near { box-shadow: 0 0 0 3px color-mix(in srgb, var(--out) 30%, transparent); }
    .ev-filter { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .tog { min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer; font: 600 13px Inter, sans-serif; border: 1px solid var(--tm-border); background: transparent; color: var(--muted); }
    .tog[aria-pressed='true'] { color: var(--cream); } .tog[aria-pressed='true'].bible { background: color-mix(in srgb, var(--gold) 20%, transparent); border-color: var(--gold); }
    .tog[aria-pressed='true'].outside { background: color-mix(in srgb, var(--out) 20%, transparent); border-color: var(--out); }
    .tag { padding: 1px 10px; border-radius: 10px; font: 600 13px Inter, sans-serif; background: color-mix(in srgb, var(--gold) 12%, transparent); color: var(--cream); border: 1.5px solid var(--gold); white-space: nowrap; }
    .tag.out { background: color-mix(in srgb, var(--out) 12%, transparent); border-color: var(--out); }
    .leg { display: inline-flex; align-items: center; gap: 6px; color: var(--cream); } .sw { display: inline-block; width: 11px; height: 11px; background: var(--gold); transform: rotate(45deg); } .sw.out { background: var(--out); border-radius: 50%; transform: none; }
    .playhead { position: absolute; left: 50%; top: 0; bottom: 0; width: 0; border-left: 2px solid var(--mat-sys-primary); pointer-events: none; z-index: 5; }
    .flag { position: absolute; top: 0; left: 0; transform: translateX(-50%); padding: 3px 10px; border-radius: 0 0 10px 10px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 700 14px Inter, sans-serif; white-space: nowrap; }
    .fade { position: absolute; top: 0; bottom: 0; width: 36px; pointer-events: none; z-index: 4; } .fade.left { left: 0; background: linear-gradient(90deg, var(--tm-plot), transparent); } .fade.right { right: 0; background: linear-gradient(270deg, var(--tm-plot), transparent); }
    .tm-hint { margin: 8px 2px 0; font: 400 13px/1.5 Inter, sans-serif; color: var(--muted); }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    @media (prefers-reduced-motion: reduce) { .bar, .ph { transition: none; } }
  `,
})
export class TimeMachine {
  private readonly content = inject(ContentService);
  private readonly sheets = inject(Sheets);
  private readonly destroyRef = inject(DestroyRef);

  /** A fase que a página tem aberta: a Máquina vai até ela quando ela muda por fora. */
  readonly phase = input<string>('');
  /** Um ano de partida (de `?ano=`), para o link levar a um tempo certo. */
  readonly startYear = input<number | null>(null);
  /** A pessoa mexeu na faixa e entrou em outra fase: a página abre as seções dela. */
  readonly phaseChange = output<string>();

  protected readonly map = BRIDGE_MAP;
  protected readonly focus = BRIDGE_FOCUS;
  protected readonly start = TM_START;
  protected readonly end = TM_END;
  protected readonly minPpy = 0.7;
  protected readonly maxPpy = 12;
  protected readonly ticksH = TICKS_H;
  protected readonly phaseH = PHASE_H;
  protected readonly laneStep = LANE + LANE_GAP;
  protected readonly chronoParam = { ordem: 'cronologica' };
  protected readonly previewPeople = 14;
  protected readonly segments = timelineSegments();
  protected readonly gap = (() => {
    const retorno = this.segments.find((s) => s.id === 'retorno')!;
    const jesus = this.segments.find((s) => s.id === 'jesus')!;
    return { from: retorno.to, to: jesus.from };
  })();
  protected readonly markers = timelineEvents();
  private readonly inks = new Map(Object.entries(PHASE_COLORS).map(([id, hex]) => [id, inkFor(hex)]));

  protected readonly year = signal(TM_START);
  protected readonly ppy = signal(TM_DEFAULT_PPY);
  protected readonly playing = signal(false);
  protected readonly dragging = signal(false);
  protected readonly allAlive = signal(false);
  protected readonly speed = signal(0);
  protected readonly announce = signal('');
  private readonly width = signal(900);
  private readonly ribbonEl = viewChild<ElementRef<HTMLElement>>('ribbon');

  protected readonly yearInt = computed(() => Math.round(this.year()));
  protected readonly yearLabel = computed(() => yearText(this.yearInt()));
  protected readonly era = computed(() => eraAt(this.yearInt()));
  protected readonly phaseKey = computed(() => phaseAt(this.yearInt()));
  /** A fase do ano (ou nada, nos 400 anos sem livros). */
  protected readonly phaseInfo = computed(() => CHRONO_GROUPS.find((g) => g.id === this.phaseKey()) ?? null);
  protected readonly books = computed(() => (this.phaseKey() ? booksOfPhase(this.phaseKey()!) : []));

  private readonly people = toSignal(this.content.memorial, { initialValue: [] });
  private readonly lives = computed(() => buildLives(this.people()));
  private readonly plan = computed(() => packLanes(this.lives()));
  protected readonly dated = computed(() => this.lives().filter((l) => l.precision !== 'seculo'));
  protected readonly century = computed(() => this.lives().filter((l) => l.precision === 'seculo'));
  protected readonly lane = computed(() => this.plan().lane);
  protected readonly laneCount = computed(() => this.plan().count);
  protected readonly alive = computed(() => aliveAt(this.lives(), this.yearInt()));
  protected readonly live = computed(() => new Set(this.alive().map((l) => l.id)));
  protected readonly shownAlive = computed(() => (this.allAlive() ? this.alive() : this.alive().slice(0, this.previewPeople)));
  protected readonly showBible = signal(true);
  protected readonly showOutside = signal(true);
  private readonly wanted = (e: { ref?: string }) => (e.ref ? this.showBible() : this.showOutside());
  protected readonly events = computed(() => eventsNear(this.yearInt(), 60, 3, this.wanted));
  protected readonly shownMarkers = computed(() => this.markers.filter(this.wanted));
  protected readonly inBible = isInBible;
  protected readonly nearIds = computed(() => new Set(this.events().map((e) => e.id)));
  protected readonly ribbonHeight = computed(() => TICKS_H + PHASE_H + 8 + (this.laneCount() + 1) * this.laneStep + 4 + EVENTS_H + 20);
  protected readonly ticks = computed(() => rulerTicks(TM_START, TM_END, this.ppy()));
  protected readonly worldWidth = computed(() => (TM_END - TM_START) * this.ppy());
  protected readonly worldTransform = computed(() => `translate3d(${this.width() / 2 - (this.year() - TM_START) * this.ppy()}px, 0, 0)`);
  protected readonly rate = computed(() => SPEEDS[this.speed()]);

  private raf = 0;
  private tween = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private lastPhase = '';
  /** Só quem mexe na faixa abre as seções da página; o salto que a página pede não volta para ela. */
  private userMoved = false;
  private drag: { id: number; x: number; year: number; moved: boolean; lastX: number; lastT: number; v: number } | null = null;
  private announceTimer: ReturnType<typeof setTimeout> | undefined;
  private started = false;
  private appliedWanted: number | null = null;
  private phaseSeen = false;

  constructor() {
    // o ano pedido no link (que pode chegar depois do primeiro cálculo, quando o roteador entrega a consulta)
    effect(() => {
      const wanted = this.startYear();
      untracked(() => {
        if (wanted === null || !Number.isFinite(wanted) || wanted === this.appliedWanted) return;
        this.appliedWanted = wanted;
        this.started = true;
        const y = clampYear(wanted);
        this.year.set(y);
        // o link manda: a página (que ainda estava na fase da leitura) passa a mostrar a fase do ano pedido
        const phase = phaseAt(Math.round(y));
        if (phase) {
          this.lastPhase = phase;
          queueMicrotask(() => this.phaseChange.emit(phase));
        }
      });
    });
    // a fase que a página mostra: na partida, a faixa abre no meio dela; depois, se a fase muda por fora (a pessoa tocou numa fase da jornada), vai até ela
    effect(() => {
      const phase = this.phase();
      untracked(() => {
        if (!phase) return;
        const firstTime = !this.phaseSeen;
        this.phaseSeen = true;
        if (firstTime && this.started) return; // o ano do link já valeu: a primeira fase que a página mostra não puxa a faixa de volta
        if (!this.started) {
          this.started = true;
          const y = phaseMiddle(phase);
          this.year.set(y);
          this.lastPhase = phaseAt(Math.round(y)) ?? phase;
          return;
        }
        if (phase === this.lastPhase) return;
        this.lastPhase = phase;
        if (phaseAt(this.yearInt()) !== phase) this.goTo(phaseMiddle(phase), true);
      });
    });
    // o texto para o leitor de tela só muda quando a viagem para (senão ele leria cada ano que passa)
    effect(() => {
      const text = `${this.yearLabel()}. ${this.era().name}. ${this.phaseInfo() ? this.phaseInfo()!.name : 'Os 400 anos de silêncio'}. ${this.alive().length} pessoas vivas neste ano.`;
      untracked(() => {
        clearTimeout(this.announceTimer);
        this.announceTimer = setTimeout(() => this.announce.set(text), 700);
      });
    });
    afterNextRender(() => {
      const el = this.ribbonEl()!.nativeElement;
      const measure = () => this.width.set(el.clientWidth);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      // a roda do mouse com Ctrl aproxima a faixa; a roda sozinha continua rolando a página
      const wheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);
        } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          this.setYear(this.year() + e.deltaX / this.ppy());
          this.userMoved = true;
        }
      };
      el.addEventListener('wheel', wheel, { passive: false });
      this.destroyRef.onDestroy(() => { observer.disconnect(); el.removeEventListener('wheel', wheel); });
    });
    this.destroyRef.onDestroy(() => { cancelAnimationFrame(this.raf); cancelAnimationFrame(this.tween); clearInterval(this.timer); clearTimeout(this.announceTimer); });
  }

  /** O nome da fase fica junto da borda esquerda da tela enquanto a fase passa por baixo (e não some quando o começo dela já saiu). */
  protected labelShift(from: number, to: number): number {
    const edge = (this.year() - TM_START) * this.ppy() - this.width() / 2; // a borda esquerda da faixa, em px do mundo
    const room = this.span(from, to) - 190;
    return 10 + Math.max(0, Math.min(room, edge - this.x(from) + 8));
  }
  protected readonly yearText = yearText;
  protected readonly phaseOfLife = phaseOfLife;
  protected x = (year: number): number => (year - TM_START) * this.ppy();
  protected span = (from: number, to: number): number => Math.max((to - from) * this.ppy(), 3);
  protected color = (id: string): string => PHASE_COLORS[id] ?? '#888888';
  protected ink = (id: string): string => this.inks.get(id) ?? '#ffffff';
  protected phaseName = (id: string): string => CHRONO_GROUPS.find((g) => g.id === id)?.name ?? id;
  /** O nome cabe dentro da barra? (13 px, mais ou menos 7,3 px por letra.) */
  protected fits = (l: Life): boolean => (l.to - l.from) * this.ppy() >= l.name.length * 7.3 + 18;
  protected share(phase: string): string {
    const s = phaseShares(phase);
    const pct = (v: number) => (v < 1 ? 'menos de 1%' : `cerca de ${Math.round(v)}%`);
    return s.time === null ? `${pct(s.text)} do texto` : `${pct(s.time)} do tempo e ${pct(s.text)} do texto`;
  }

  /** Muda o ano (sem passar das pontas) e, se a pessoa mexeu e entrou em outra fase, avisa a página. */
  private setYear(y: number): void {
    const year = clampYear(y);
    this.year.set(year);
    if (!this.userMoved) return;
    const phase = phaseAt(Math.round(year));
    if (phase && phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.phaseChange.emit(phase);
    }
  }

  /** Vai até um ano (devagar, a menos que a pessoa peça menos movimento); `quiet` é o salto que a página pediu. */
  protected goTo(target: number, quiet = false): void {
    this.stopPlay();
    cancelAnimationFrame(this.tween);
    cancelAnimationFrame(this.raf);
    if (!quiet) this.userMoved = true;
    const to = clampYear(target);
    if (prefersReducedMotion()) {
      this.setYear(to);
      return;
    }
    const from = this.year();
    const t0 = performance.now();
    const duration = Math.min(1400, 350 + Math.abs(to - from) * 1.1);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      this.setYear(from + (to - from) * eased);
      if (k < 1) this.tween = requestAnimationFrame(step);
    };
    this.tween = requestAnimationFrame(step);
  }

  protected zoom(factor: number): void {
    this.ppy.set(clampPpy(this.ppy() * factor));
  }

  protected togglePlay(): void {
    if (this.playing()) { this.stopPlay(); return; }
    cancelAnimationFrame(this.tween);
    this.userMoved = true;
    if (this.year() >= TM_END - 1) this.year.set(TM_START);
    this.playing.set(true);
    if (prefersReducedMotion()) {
      // quem pediu menos movimento vê saltos de tempos em tempos, e não a faixa deslizando
      this.timer = setInterval(() => { this.setYear(this.year() + this.rate() * 0.7); if (this.year() >= TM_END) this.stopPlay(); }, 700);
      return;
    }
    let last = performance.now();
    const loop = (now: number) => {
      this.setYear(this.year() + ((now - last) / 1000) * this.rate());
      last = now;
      if (this.year() >= TM_END) { this.stopPlay(); return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  private stopPlay(): void {
    if (!this.playing()) return;
    this.playing.set(false);
    cancelAnimationFrame(this.raf);
    clearInterval(this.timer);
  }
  protected cycleSpeed(): void {
    this.speed.set((this.speed() + 1) % SPEEDS.length);
  }

  protected onDown(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.stopPlay();
    cancelAnimationFrame(this.tween);
    this.drag = { id: e.pointerId, x: e.clientX, year: this.year(), moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
  }
  protected onMove(e: PointerEvent): void {
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      this.userMoved = true;
      this.ribbonEl()!.nativeElement.setPointerCapture(e.pointerId);
      this.dragging.set(true);
    }
    if (!d.moved) return;
    this.setYear(d.year - dx / this.ppy());
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.v = (-(e.clientX - d.lastX) / this.ppy()) / dt; // anos por ms
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
  }
  protected onUp(e: PointerEvent): void {
    const d = this.drag;
    if (!d || d.id !== e.pointerId) return;
    this.drag = null;
    this.dragging.set(false);
    if (d.moved) {
      // solta com um pouco de embalo, que vai parando
      if (!prefersReducedMotion() && Math.abs(d.v) > 0.01 && e.timeStamp - d.lastT < 80) {
        let v = d.v;
        let last = performance.now();
        const glide = (now: number) => {
          const dt = now - last;
          last = now;
          this.setYear(this.year() + v * dt);
          v *= 0.94 ** (dt / 16);
          if (Math.abs(v) > 0.004 && this.year() > TM_START && this.year() < TM_END) this.tween = requestAnimationFrame(glide);
        };
        this.tween = requestAnimationFrame(glide);
      }
      return;
    }
    // um toque, e não um arrasto: leva à vida ou ao fato que foi tocado
    const target = e.target as HTMLElement;
    const bar = target.closest<HTMLElement>('[data-id]');
    if (bar) {
      const life = this.lives().find((l) => l.id === bar.dataset['id']);
      if (life) this.goTo((life.from + life.to) / 2);
      return;
    }
    const mark = target.closest<HTMLElement>('[data-year]');
    if (mark) this.goTo(Number(mark.dataset['year']));
  }

  protected onKey(e: KeyboardEvent): void {
    const big = e.shiftKey ? 10 : 1;
    let handled = true;
    switch (e.key) {
      case 'ArrowRight': this.nudge(big); break;
      case 'ArrowLeft': this.nudge(-big); break;
      case 'PageUp': this.nudge(50); break;
      case 'PageDown': this.nudge(-50); break;
      case 'Home': this.nudge(TM_START - this.year()); break;
      case 'End': this.nudge(TM_END - this.year()); break;
      case '+': case '=': this.zoom(1.4); break;
      case '-': case '_': this.zoom(1 / 1.4); break;
      case ' ': this.togglePlay(); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  }
  private nudge(years: number): void {
    this.stopPlay();
    this.userMoved = true;
    this.setYear(this.year() + years);
  }

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}
