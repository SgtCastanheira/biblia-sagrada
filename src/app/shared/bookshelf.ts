import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { StoryProgressService } from '../core/story-progress.service';
import { Trail, TRAILS, trailArticleIds } from '../core/trails';

/** Tempo, em ms, que a capa leva para abrir antes de entrar no assunto (igual ao da animação no CSS). */
const OPEN_MS = 700;

/**
 * Estante de livros: cada assunto das histórias é um livro, com a sua cor (`Trail.tone`) e um fio dourado.
 * Ao tocar, a capa se abre como um livro e a tela entra no assunto. Com "reduzir movimento", entra direto.
 */
@Component({
  selector: 'app-bookshelf',
  imports: [MatIconModule],
  template: `
    <div class="shelves">
      @for (row of rows(); track $index) {
        <div class="row">
          <div class="books" [style.--n]="perRow()">
            @for (t of row; track t.id) {
              <button type="button" class="book" [class.opening]="opening() === t.id" [style.--tone]="t.tone" [attr.aria-label]="label(t)" (click)="open(t)">
                <span class="inside" aria-hidden="true"></span>
                <span class="cover" aria-hidden="true">
                  <span class="front">
                    @if (state(t).started && state(t).next) { <span class="ribbon"></span> }
                    <span class="foil"><mat-icon>{{ t.icon }}</mat-icon></span>
                    <span class="title">{{ t.short }}</span>
                    <span class="count">{{ count(t) }} {{ count(t) === 1 ? 'história' : 'histórias' }}</span>
                    @if (state(t).done) {
                      <span class="bar"><span [style.width.%]="(100 * state(t).done) / state(t).total"></span></span>
                    }
                  </span>
                  <span class="back"></span>
                </span>
              </button>
            }
          </div>
          <div class="plank"></div>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .shelves { padding: 20px 0 6px; border-radius: 22px; background: radial-gradient(120% 80% at 50% 0%, #3b2a1d, #20150e 75%); box-shadow: inset 0 2px 18px rgba(0, 0, 0, .5); }
    .row { margin-bottom: 26px; }
    .books { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); align-items: end; gap: 12px; padding: 0 16px; }
    .plank { height: 14px; margin-top: -1px; background: linear-gradient(#9a7650, #6a4e31 70%, #54391f); box-shadow: 0 12px 14px -6px rgba(0, 0, 0, .65); }

    .book {
      position: relative; display: block; width: 100%; aspect-ratio: 3 / 4.2; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; color: inherit;
      perspective: 900px; -webkit-tap-highlight-color: transparent; transition: transform .35s ease;
    }
    .book:nth-child(3n + 2) { aspect-ratio: 3 / 4.45; }
    .book:nth-child(3n) { aspect-ratio: 3 / 4; }
    .book:focus-visible { outline: 3px solid #f1d9a8; outline-offset: 4px; border-radius: 4px; }

    /* Miolo: as páginas que aparecem quando a capa gira */
    .inside {
      position: absolute; inset: 2px 0 2px 3px; border-radius: 2px 5px 5px 2px; background: #f6ecd6;
      background-image: repeating-linear-gradient(#f6ecd6 0 13px, #e3d5b4 13px 14px); box-shadow: 3px 0 0 -1px #d9c9a4, 5px 0 0 -2px #cdbb92;
    }

    .cover { position: absolute; inset: 0; transform-style: preserve-3d; transform-origin: left center; transition: transform .7s cubic-bezier(.3, .7, .2, 1); }
    .front, .back { position: absolute; inset: 0; border-radius: 3px 6px 6px 3px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .front {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 10px 8px 12px 12px; box-sizing: border-box; text-align: center;
      background:
        linear-gradient(90deg, rgba(0, 0, 0, .45) 0, rgba(0, 0, 0, 0) 9%, rgba(255, 255, 255, .08) 11%, rgba(0, 0, 0, 0) 16%),
        linear-gradient(165deg, var(--tone), color-mix(in srgb, var(--tone) 62%, #000));
      box-shadow: 0 6px 12px rgba(0, 0, 0, .45), inset 0 0 0 1px rgba(255, 255, 255, .06);
    }
    .front::before { content: ''; position: absolute; inset: 7px 6px 7px 12px; border: 1px solid rgba(241, 217, 168, .55); border-radius: 2px; pointer-events: none; }
    .back { transform: rotateY(180deg); background: color-mix(in srgb, var(--tone) 14%, #f1e6cc); }

    .foil { display: grid; place-items: center; width: 38px; height: 38px; border: 1.5px solid #f1d9a8; border-radius: 50%; color: #f1d9a8; }
    .foil mat-icon { width: 24px; height: 24px; font-size: 24px; }
    .title { font: 600 15px/1.2 var(--heading-font); color: #fff8ec; text-wrap: balance; overflow-wrap: anywhere; }
    .count { font: 600 13px/1.2 Inter, sans-serif; color: #f1d9a8; }
    .bar { position: absolute; left: 16px; right: 12px; bottom: 11px; height: 4px; border-radius: 2px; background: rgba(255, 248, 236, .22); overflow: hidden; }
    .bar span { display: block; height: 100%; background: #f1d9a8; }
    .ribbon { position: absolute; top: 0; right: 16px; width: 12px; height: 30px; background: #f1d9a8; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%); }

    @media (hover: hover) {
      .book:hover:not(.opening) { transform: translateY(-5px); }
      .book:hover:not(.opening) .cover { transform: rotateY(-14deg); }
    }
    .book.opening { z-index: 2; transform: translateY(-6px) scale(1.14); }
    .book.opening .cover { transform: rotateY(-158deg); }

    @media (min-width: 840px) {
      .shelves { padding: 28px 0 8px; }
      .books { gap: 22px; padding: 0 28px; }
      .title { font-size: 17px; }
      .foil { width: 46px; height: 46px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .book, .cover { transition: none; }
      .book:hover:not(.opening), .book.opening { transform: none; }
    }
  `,
})
export class Bookshelf {
  private readonly router = inject(Router);
  private readonly progress = inject(StoryProgressService);
  protected readonly trails = TRAILS;
  /** Id do livro que está abrindo (só durante a animação). */
  protected readonly opening = signal<string | null>(null);
  /** 3 livros por prateleira no celular; 6 na tela larga. */
  protected readonly perRow = signal(3);
  protected readonly rows = computed(() => {
    const n = this.perRow();
    const rows: Trail[][] = [];
    for (let i = 0; i < this.trails.length; i += n) rows.push(this.trails.slice(i, i + n));
    return rows;
  });
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const wide = matchMedia('(min-width: 840px)');
    const update = () => this.perRow.set(wide.matches ? 6 : 3);
    update();
    wide.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => {
      wide.removeEventListener('change', update);
      clearTimeout(this.timer);
    });
  }

  protected count(t: Trail): number {
    return trailArticleIds(t).length;
  }

  protected state(t: Trail) {
    return this.progress.trail(t);
  }

  protected label(t: Trail): string {
    const s = this.state(t);
    const n = this.count(t);
    const lidas = s.done ? `, ${s.done} ${s.done === 1 ? 'lida' : 'lidas'}` : '';
    return `Abrir o livro ${t.name}: ${n} ${n === 1 ? 'história' : 'histórias'}${lidas}`;
  }

  protected open(t: Trail): void {
    if (this.opening()) return;
    const go = () => this.router.navigate(['/historia'], { queryParams: { trilha: t.id }, replaceUrl: true });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go();
      return;
    }
    this.opening.set(t.id);
    this.timer = setTimeout(go, OPEN_MS);
  }
}
