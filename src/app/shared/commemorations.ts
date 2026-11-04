import { afterNextRender, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { dateLabel, dayLabel, featured, monthName, photoLabel, toneOf, whenText, yearsLabel, type Anniversary, type FeaturedDay } from '../core/anniversaries';
import { anniversaryCard, dayCard } from '../core/share-card';
import { Sheets } from './sheets';

/** Segundos que cada destaque fica na tela antes de passar ao próximo. */
const SECONDS = 9;

/**
 * Destaques da tela inicial: os fatos da história que fazem aniversário neste mês, com foto e o selo dos anos
 * (“116 anos · Em 15 dias”). Quando o mês vira, a lista troca sozinha pela do mês novo. Quando um dia tem vários fatos
 * (15 de novembro: São Paulo em 1927 e Madureira em 1929), eles aparecem juntos, num compilado do dia. Passam sozinhos, a cada poucos
 * segundos, e param quando a pessoa toca, passa o mouse, usa o teclado ou aperta pausar; com “reduzir movimento” ligado, não passam sozinhos. O botão leva à história
 * completa e o outro monta a imagem de comemoração para mandar no WhatsApp e no Instagram.
 */
@Component({
  selector: 'app-commemorations',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <section class="dates" aria-labelledby="dates-title" aria-roledescription="carrossel">
      <div class="head">
        <h2 id="dates-title">{{ heading() }}</h2>
        <a routerLink="/datas">Ver todas as datas</a>
      </div>
      @if (current(); as f) {
        <div class="stage" (pointerenter)="hover.set(true)" (pointerleave)="hover.set(false)" (focusin)="hover.set(true)" (focusout)="hover.set(false)" (touchstart)="touch($event)" (touchend)="swipe($event)">
          <article class="slide" [style.--tone]="tone(f.events[0])" [attr.aria-label]="'Destaque ' + (index() + 1) + ' de ' + items.length">
            <figure class="photo" [class.plain]="f.events.length > 1 || !photoOf(f)">
              @if (f.events.length === 1 && photoOf(f); as p) {
                <img [src]="'conteudo/' + p.image" alt="" loading="lazy" />
              } @else {
                <mat-icon class="big" aria-hidden="true">{{ f.events[0].icon }}</mat-icon>
                <span class="year" aria-hidden="true">{{ f.events.length > 1 ? shortDay(f) : f.events[0].year }}</span>
              }
              <span class="badge">
                @if (f.events.length > 1) {
                  <strong>{{ f.events.length }} fatos</strong>
                } @else {
                  <strong>{{ years(f.events[0]) }}</strong>
                }
                {{ when(f.delta) }}
              </span>
              @if (f.events.length === 1 && photoOf(f); as p) {
                <figcaption>{{ p.label }}: {{ p.credit }}</figcaption>
              }
            </figure>
            <div class="body">
              @if (f.events.length === 1) {
                <span class="when">{{ label(f.events[0]) }}</span>
                <h3>{{ f.events[0].title }}</h3>
                <p>{{ f.events[0].text }}</p>
                @if (f.events[0].hook) {
                  <p class="hook">{{ f.events[0].hook }}</p>
                }
                <div class="actions">
                  <a class="read" [routerLink]="f.events[0].link"><mat-icon>auto_stories</mat-icon> Ler a história</a>
                  <button class="share" type="button" (click)="share(f)" aria-label="Compartilhar a imagem desta data"><mat-icon>ios_share</mat-icon></button>
                </div>
              } @else {
                <span class="when">{{ dayText(f) }}</span>
                <h3>{{ f.events.length }} fatos nesse dia</h3>
                <ul class="events">
                  @for (e of f.events; track e.id) {
                    <li>
                      <a [routerLink]="e.link">
                        @if (e.image) {
                          <img class="ev-img" [src]="'conteudo/' + e.image" alt="" loading="lazy" />
                        }
                        <span class="ev">
                          <span class="ev-head"><strong>{{ e.year }}</strong><span class="ev-title">{{ e.title }}</span></span>
                          <span class="ev-text">{{ e.text }}</span>
                          @if (e.hook) {
                            <span class="ev-hook">{{ e.hook }}</span>
                          }
                        </span>
                      </a>
                      @if (e.credit) {
                        <small class="ev-credit">{{ label2(e) }}: {{ e.credit }}</small>
                      }
                    </li>
                  }
                </ul>
                <div class="actions">
                  <button class="share" type="button" (click)="share(f)" aria-label="Compartilhar a imagem desta data"><mat-icon>ios_share</mat-icon></button>
                </div>
              }
            </div>
          </article>
        </div>
        <div class="dots" role="group" aria-label="Escolher o destaque">
          @for (it of items; track it.day; let i = $index) {
            <button type="button" class="dot" [attr.aria-label]="'Destaque ' + (i + 1) + ' de ' + items.length + ': ' + (it.events.length > 1 ? dayText(it) + ', ' + it.events.length + ' fatos' : it.events[0].title)" [attr.aria-current]="i === index() ? 'true' : null" (click)="go(i)"><span></span></button>
          }
          @if (canPlay) {
            <button type="button" class="pause" (click)="playing.set(!playing())" [attr.aria-label]="playing() ? 'Pausar a troca dos destaques' : 'Retomar a troca dos destaques'">
              <mat-icon>{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
          }
        </div>
      }
    </section>
  `,
  styles: `
    :host { display: block; }
    .dates { margin: 4px 0 18px; }
    .head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    h2 { margin: 0; font: 600 20px/1.25 var(--heading-font); }
    .head a { color: var(--accent-gold); font: 600 14px Inter, sans-serif; min-height: 40px; display: inline-flex; align-items: center; }
    .stage { touch-action: pan-y; }
    .slide { display: grid; overflow: hidden; border-radius: 18px; background: var(--tone); color: #fff8ec; box-shadow: 0 6px 20px rgba(0, 0, 0, .18); animation: slide-in .5s ease both; }
    @keyframes slide-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .slide { animation: none; } }
    .photo { position: relative; margin: 0; background: #0006; }
    .photo img { display: block; width: 100%; height: 210px; object-fit: cover; object-position: 50% 20%; }
    .photo.plain { display: grid; place-items: center; align-content: center; gap: 6px; height: 170px; padding-top: 28px; background: radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--tone) 85%, #fff 15%), color-mix(in srgb, var(--tone) 65%, #000)); }
    .big { font-size: 56px; width: 56px; height: 56px; color: #f1d9a8; }
    .year { font: 700 40px/1 var(--heading-font); letter-spacing: 2px; color: #fff8ec; }
    .badge { position: absolute; left: 12px; top: 12px; display: inline-flex; align-items: baseline; gap: 6px; padding: 6px 12px; border-radius: 999px; background: var(--tone); color: #f1d9a8; font: 600 14px/1.2 Inter, sans-serif; }
    .badge strong { font: 700 18px var(--heading-font); color: #fff8ec; }
    figcaption { padding: 6px 14px; background: color-mix(in srgb, var(--tone) 80%, #000); color: #fff8ec; font: 400 13px/1.35 Inter, sans-serif; }
    .body { display: grid; gap: 6px; padding: 14px 16px 16px; }
    .when { color: #f1d9a8; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; }
    h3 { margin: 0; font: 600 21px/1.25 var(--heading-font); text-wrap: balance; }
    p { margin: 0; font: 400 15px/1.5 Inter, sans-serif; color: #fff8ec; }
    .hook { color: #f1d9a8; font: 700 italic 17px/1.4 var(--heading-font); }
    .events { list-style: none; margin: 2px 0 0; padding: 0; display: grid; gap: 8px; }
    .events li { display: grid; gap: 2px; padding: 6px; border-radius: 12px; background: color-mix(in srgb, #000 22%, transparent); }
    .events a { display: grid; grid-template-columns: 84px minmax(0, 1fr); gap: 10px; align-items: start; min-height: 44px; border-radius: 10px; color: #fff8ec; text-decoration: none; }
    .ev-img { display: block; width: 84px; height: 84px; border-radius: 10px; object-fit: cover; object-position: 50% 20%; background: #0004; }
    .ev { display: grid; gap: 2px; min-width: 0; align-content: start; padding: 2px 4px 0 0; }
    .ev-head { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
    .ev-head strong { font: 700 18px/1.3 var(--heading-font); color: #f1d9a8; }
    .ev-title { font: 600 16px/1.3 var(--heading-font); }
    .ev-text, .ev-hook { display: none; font: 400 14px/1.45 Inter, sans-serif; }
    .ev-hook { color: #f1d9a8; font-style: italic; font-weight: 600; }
    .ev-credit { padding: 0 4px 2px; font: 400 13px/1.4 Inter, sans-serif; color: rgba(255, 248, 236, 0.85); }
    .actions { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
    .read { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 999px; background: #f1d9a8; color: #2a1d08; font: 700 14px Inter, sans-serif; text-decoration: none; }
    .read mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .share { display: grid; place-items: center; width: 44px; height: 44px; border: 1.5px solid #f1d9a8; border-radius: 50%; background: transparent; color: #f1d9a8; cursor: pointer; }
    .dots { display: flex; align-items: center; justify-content: center; gap: 0; margin-top: 4px; flex-wrap: wrap; }
    .dot, .pause { display: grid; place-items: center; width: 40px; height: 40px; padding: 0; border: 0; background: transparent; color: var(--mat-sys-on-surface-variant); cursor: pointer; }
    .dot span { width: 10px; height: 10px; border-radius: 50%; background: color-mix(in srgb, var(--mat-sys-on-surface) 30%, transparent); transition: all .2s; }
    .dot[aria-current='true'] span { width: 22px; border-radius: 6px; background: var(--accent-gold); }
    @media (min-width: 840px) {
      .slide { grid-template-columns: minmax(0, 44%) minmax(0, 1fr); }
      .photo img { height: 100%; min-height: 280px; }
      .photo.plain { height: auto; min-height: 280px; padding-top: 0; }
      .body { align-content: center; padding: 22px 26px; }
      .ev-text, .ev-hook { display: block; }
      .ev-img { width: 116px; height: 96px; }
      .events a { grid-template-columns: 116px minmax(0, 1fr); }
      h3 { font-size: 26px; }
    }
  `,
})
export class Commemorations {
  private readonly sheets = inject(Sheets);
  private readonly now = new Date();
  protected readonly items = featured(this.now);
  protected readonly index = signal(0);
  protected readonly playing = signal(true);
  protected readonly hover = signal(false);
  /** Sem “reduzir movimento” ligado, os destaques passam sozinhos (e há o botão de pausar). */
  protected readonly canPlay = typeof matchMedia !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches && this.items.length > 1;
  protected readonly current = computed(() => this.items[this.index()] ?? null);
  protected readonly heading = computed(() => (this.items[0]?.delta === 0 ? 'Hoje na História' : `Datas de ${monthName(this.now.getMonth() + 1)}`));
  private startX = 0;

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.canPlay) return;
      const timer = setInterval(() => {
        if (this.playing() && !this.hover()) this.index.update((i) => (i + 1) % this.items.length);
      }, SECONDS * 1000);
      destroy.onDestroy(() => clearInterval(timer));
    });
  }

  protected tone = toneOf;
  protected label(a: Anniversary): string {
    return dateLabel(a);
  }
  /** “15 de novembro”, no alto do compilado de um dia. */
  protected dayText(f: FeaturedDay): string {
    return dayLabel(f.month, f.day);
  }
  /** “15 nov”, no cartão sem foto. */
  protected shortDay(f: FeaturedDay): string {
    return `${f.day} ${monthName(f.month).slice(0, 3)}`;
  }
  /** A primeira foto do dia (com o ano a que pertence, para o crédito), quando algum dos fatos tem uma. */
  protected photoOf(f: FeaturedDay): { image: string; credit: string; label: string } | null {
    const e = f.events.find((x) => x.image && x.credit);
    return e ? { image: e.image!, credit: e.credit!, label: photoLabel(e) } : null;
  }
  protected label2 = photoLabel;
  protected years(a: Anniversary): string {
    return yearsLabel(a, this.now);
  }
  protected when = whenText;

  protected go(i: number): void {
    this.index.set(i);
    this.playing.set(false);
  }

  protected touch(e: TouchEvent): void {
    this.hover.set(true);
    this.startX = e.changedTouches[0].clientX;
  }

  protected swipe(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.startX;
    this.hover.set(false);
    if (Math.abs(dx) < 48) return;
    this.playing.set(false);
    this.index.update((i) => (i + (dx < 0 ? 1 : -1) + this.items.length) % this.items.length);
  }

  protected share(f: FeaturedDay): void {
    this.playing.set(false);
    this.sheets.shareImage(f.events.length > 1 ? dayCard(f) : anniversaryCard(f.events[0], this.now));
  }
}
