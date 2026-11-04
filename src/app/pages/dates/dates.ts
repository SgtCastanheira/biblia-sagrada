import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { ANNIVERSARIES, byMonth, dateLabel, dayDelta, dayLabel, monthName, photoLabel, toneOf, whenText, yearsLabel, type Anniversary, type DayGroup } from '../../core/anniversaries';
import { anniversaryCard, dayCard } from '../../core/share-card';
import { BackButton } from '../../shared/back-button';
import { Sheets } from '../../shared/sheets';

/**
 * Datas da história: os fatos com dia e mês que os estudos contam, mês a mês, começando pelo mês de hoje. Cada um mostra
 * há quantos anos aconteceu, leva à história completa e monta a imagem de comemoração para compartilhar.
 */
@Component({
  selector: 'app-dates',
  imports: [BackButton, MatIconModule, MatRippleModule, RouterLink],
  template: `
    <div class="top"><app-back fallback="/historia" /></div>
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Datas da História</h1>
      <p>{{ total }} fatos da história da Igreja, dos avivamentos e das igrejas do Brasil, no dia em que aconteceram. Quando um dia tem vários fatos, eles aparecem juntos. Toque em Compartilhar para mandar a imagem da comemoração no WhatsApp ou no Instagram.</p>
    </header>

    @for (m of months(); track m.month) {
      <h2 class="section-title" [id]="'mes-' + m.month">{{ monthTitle(m.month) }}</h2>
      <ul class="list">
        @for (g of m.days; track g.day) {
          <li [class.today]="delta(g) === 0" [style.--tone]="tone(g.events[0])">
            <span class="day" aria-hidden="true"><strong>{{ g.day }}</strong><small>{{ short(g.month) }}</small></span>
            <div class="events">
              @if (g.events.length > 1) {
                <div class="group-head">
                  <strong>{{ g.events.length }} fatos nesse dia</strong>
                  <button type="button" class="share-day" (click)="shareDay(g)" [attr.aria-label]="'Compartilhar a imagem do dia ' + dayText(g)"><mat-icon>ios_share</mat-icon> Compartilhar o dia</button>
                </div>
              }
              @for (e of g.events; track e.id) {
                <article class="ev" [class.has-photo]="!!e.image">
                  <div class="body">
                    <a class="main" matRipple [routerLink]="e.link">
                      <span class="meta">{{ label(e) }} · {{ years(e) }}@if (near(e)) { · <b>{{ when(e) }}</b> }</span>
                      <span class="title">{{ e.title }}</span>
                      <span class="text">{{ e.text }}</span>
                      @if (e.hook) {
                        <span class="hook">{{ e.hook }}</span>
                      }
                    </a>
                    @if (e.credit) {
                      <small class="credit">{{ photoLabel(e) }}: {{ e.credit }}</small>
                    }
                  </div>
                  @if (e.image) {
                    <img class="thumb" [src]="'conteudo/' + e.image" alt="" loading="lazy" />
                  }
                  <button type="button" class="share" (click)="share(e)" [attr.aria-label]="'Compartilhar a imagem: ' + e.title"><mat-icon>ios_share</mat-icon></button>
                </article>
              }
            </div>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .list { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 10px; }
    li { position: relative; display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: start; gap: 12px; padding: 12px; border-radius: 16px; overflow: hidden; background: color-mix(in srgb, var(--tone) 8%, var(--mat-sys-surface-container-low, transparent)); border: 1px solid color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent); }
    li.today { border-color: var(--accent-gold); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-gold) 40%, transparent); }
    .day { display: grid; align-content: center; justify-items: center; align-self: start; min-height: 64px; border-radius: 12px; background: var(--tone); color: #fff8ec; }
    .day strong { font: 700 22px/1 var(--heading-font); }
    .day small { font: 700 13px Inter, sans-serif; text-transform: uppercase; color: #f1d9a8; }
    .events { display: grid; gap: 12px; min-width: 0; }
    .group-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .group-head strong { font: 600 17px var(--heading-font); }
    .share-day { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 1.5px solid var(--accent-gold); border-radius: 999px; background: transparent; color: var(--mat-sys-on-surface); font: 600 14px Inter, sans-serif; cursor: pointer; }
    .share-day mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--accent-gold); }
    .ev { display: grid; grid-template-columns: minmax(0, 1fr) 44px; grid-template-areas: 'body share'; align-items: start; gap: 4px 12px; }
    .ev + .ev { padding-top: 12px; border-top: 1px solid color-mix(in srgb, var(--mat-sys-on-surface) 14%, transparent); }
    .body { grid-area: body; display: grid; gap: 4px; min-width: 0; align-content: start; }
    .main { display: grid; gap: 2px; min-width: 0; min-height: 52px; color: inherit; text-decoration: none; border-radius: 10px; }
    .credit { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .meta { font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .meta b { color: var(--accent-gold); }
    .title { font: 600 17px/1.3 var(--heading-font); }
    .text { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hook { font: 600 italic 15px/1.4 var(--heading-font); color: var(--mat-sys-on-surface); }
    .thumb { grid-area: thumb; display: block; width: 100%; height: 100%; min-height: 120px; max-height: 170px; border-radius: 12px; object-fit: cover; object-position: 50% 20%; background: color-mix(in srgb, var(--tone) 25%, transparent); }
    .share { grid-area: share; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--accent-gold); cursor: pointer; }
    /* Telas largas: a foto grande ao lado do texto, como numa página de jornal. */
    @media (min-width: 640px) {
      .ev.has-photo { grid-template-columns: minmax(0, 1fr) clamp(170px, 26%, 240px) 44px; grid-template-areas: 'body thumb share'; }
    }
    /* Celular: o dia vira uma faixa no alto do cartão, a foto abre cada fato, em faixa, e o resto vem embaixo. */
    @media (max-width: 639px) {
      li { grid-template-columns: minmax(0, 1fr); gap: 10px; }
      .day { display: flex; align-items: baseline; justify-content: center; gap: 6px; min-height: 0; width: fit-content; padding: 6px 14px; border-radius: 999px; }
      .ev.has-photo { grid-template-areas: 'thumb thumb' 'body share'; row-gap: 10px; }
      .thumb { height: 150px; min-height: 0; }
    }
  `,
  styleUrl: '../../shared/study.scss',
})
export class DatesPage {
  private readonly sheets = inject(Sheets);
  private readonly now = new Date();
  protected readonly total = ANNIVERSARIES.length;
  /** Os meses começam pelo de hoje, para o que está por vir ficar no alto. */
  protected readonly months = computed(() => {
    const all = byMonth();
    const current = this.now.getMonth() + 1;
    return [...all.filter((m) => m.month >= current), ...all.filter((m) => m.month < current)];
  });
  protected readonly tone = toneOf;
  protected readonly photoLabel = photoLabel;
  protected readonly when = (a: Anniversary) => whenText(dayDelta(a, this.now));

  protected monthTitle(month: number): string {
    const name = monthName(month);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  protected short(month: number): string {
    return monthName(month).slice(0, 3);
  }
  protected label(a: Anniversary): string {
    return dateLabel(a);
  }
  protected years(a: Anniversary): string {
    return yearsLabel(a, this.now);
  }
  protected delta(g: DayGroup): number {
    return dayDelta(g.events[0], this.now);
  }
  protected dayText(g: DayGroup): string {
    return dayLabel(g.month, g.day);
  }
  /** Só destaca o “Hoje / Em 3 dias” dos fatos que estão por perto. */
  protected near(a: Anniversary): boolean {
    const d = dayDelta(a, this.now);
    return d >= -3 && d <= 30;
  }
  protected share(a: Anniversary): void {
    this.sheets.shareImage(anniversaryCard(a, this.now));
  }
  /** A imagem do compilado: todos os fatos do dia numa só. */
  protected shareDay(g: DayGroup): void {
    this.sheets.shareImage(dayCard(g));
  }
}
