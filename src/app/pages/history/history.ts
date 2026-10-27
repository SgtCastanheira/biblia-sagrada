import { Component, computed, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { findArticle } from '../../core/library';
import { StoryRings } from '../../shared/story-rings';
import { findTrail, Trail, TRAILS, trailArticleIds, trailOfCollection } from '../../core/trails';

/**
 * Histórias: uma fileira de círculos (como os destaques do Instagram), um por assunto. Sem escolher nenhum,
 * mostra todos os assuntos; ao escolher um, mostra os seus ramos e as suas histórias.
 */
@Component({
  selector: 'app-history',
  imports: [RouterLink, MatIconModule, MatRippleModule, StoryRings],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Histórias</h1>
      <p>Escolha um assunto. Cada um tem as suas histórias, em ordem, e leva a outras telas do app.</p>
    </header>

    <app-story-rings [active]="trail()?.id" [all]="true" />

    @if (trail(); as t) {
      <section class="cover" [style.--h]="t.hue">
        <mat-icon class="watermark" aria-hidden="true">{{ t.icon }}</mat-icon>
        <span class="c-over">{{ count(t) }} {{ count(t) === 1 ? 'história' : 'histórias' }}</span>
        <h2>{{ t.name }}</h2>
        <p>{{ t.description }}</p>
      </section>

      @for (b of t.branches; track b.title) {
        <h2 class="section-title">{{ b.title }}</h2>
        <div class="grid">
          @for (a of articlesOf(b.ids); track a.id) {
            <a class="card row" matRipple [routerLink]="['/artigo', a.id]">
              <span class="badge"><mat-icon>{{ a.icon }}</mat-icon></span>
              <span class="texts">
                <span class="meta">{{ a.period }}</span>
                <span class="name">{{ a.title }}</span>
                <span class="desc">{{ a.subtitle }}</span>
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
          @for (l of b.links ?? []; track l.link) {
            <a class="card row shortcut" matRipple [routerLink]="l.link">
              <span class="badge"><mat-icon>{{ l.icon }}</mat-icon></span>
              <span class="texts">
                <span class="meta">Atalho</span>
                <span class="name">{{ l.name }}</span>
                <span class="desc">{{ l.description }}</span>
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }

      @if (next(); as n) {
        <a class="next" matRipple [routerLink]="[]" [queryParams]="{ trilha: n.id }" replaceUrl>
          <span><small>Próximo assunto</small>{{ n.name }}</span>
          <mat-icon>arrow_forward</mat-icon>
        </a>
      }
    } @else {
      <div class="grid topics">
        @for (t of trails; track t.id) {
          <a class="topic" matRipple [routerLink]="[]" [queryParams]="{ trilha: t.id }" replaceUrl [style.--h]="t.hue">
            <span class="disc"><mat-icon>{{ t.icon }}</mat-icon></span>
            <span class="texts">
              <span class="name">{{ t.name }}</span>
              <span class="desc">{{ t.description }}</span>
              <span class="meta">{{ count(t) }} {{ count(t) === 1 ? 'história' : 'histórias' }}</span>
            </span>
          </a>
        }
      </div>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .disc {
      --a: hsl(var(--h) 70% 52%); --b: hsl(calc(var(--h) + 40) 75% 58%);
      display: grid; place-items: center; width: 72px; height: 72px; border-radius: 50%; box-sizing: border-box; padding: 3px;
      background: conic-gradient(from 200deg, var(--a), var(--b), var(--a));
    }
    .disc mat-icon { width: 100%; height: 100%; display: grid; place-items: center; border-radius: 50%; font-size: 30px; background: var(--mat-sys-surface); color: hsl(var(--h) 55% 38%); box-sizing: border-box; border: 3px solid var(--mat-sys-surface); }
    .disc { transition: transform .15s; }
    .page-head + app-story-rings { margin-bottom: 18px; }
    .cover {
      position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; margin: 0 0 8px; padding: 22px 20px; border-radius: 24px; color: #fff8ec;
      background: radial-gradient(110% 90% at 100% 0%, hsl(var(--h) 70% 60% / .38), transparent 62%), linear-gradient(165deg, hsl(var(--h) 35% 22%), hsl(var(--h) 40% 11%) 80%);
    }
    .cover h2 { position: relative; margin: 0; font: 600 28px/1.15 var(--heading-font); }
    .cover p { position: relative; margin: 0; max-width: 560px; font: 400 15px/1.5 var(--reading-font); color: #eadfcb; }
    .c-over { position: relative; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #f1d9a8; }
    .watermark { position: absolute; right: -14px; bottom: -22px; width: 140px; height: 140px; font-size: 140px; color: rgba(255, 255, 255, .1); }
    .grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
    @media (min-width: 840px) { .grid { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }
    .grid .card { margin: 0; }
    .shortcut { border-style: dashed; }
    .topic {
      display: flex; gap: 14px; align-items: flex-start; padding: 16px; border-radius: 20px; text-decoration: none; color: inherit;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .topic .disc { flex: none; width: 56px; height: 56px; }
    .topic .disc mat-icon { font-size: 26px; }
    .topic .texts { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .topic .name { font: 600 18px/1.25 var(--heading-font); }
    .topic .desc { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .topic .meta { margin-top: 2px; font: 600 13px Inter, sans-serif; color: hsl(var(--h) 55% 34%); }
    .next { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 22px; padding: 14px 18px; border-radius: 18px; text-decoration: none; color: var(--mat-sys-primary); background: var(--mat-sys-surface-container); font: 600 17px/1.3 var(--heading-font); }
    .next span { display: flex; flex-direction: column; }
    .next small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class HistoryPage {
  readonly trilha = input<string>();
  /** Links antigos, com a coleção. */
  readonly colecao = input<string>();
  protected readonly trails = TRAILS;
  protected readonly trail = computed(() => findTrail(this.trilha()) ?? trailOfCollection(this.colecao()));
  protected readonly next = computed(() => {
    const i = TRAILS.findIndex((t) => t.id === this.trail()?.id);
    return i >= 0 ? TRAILS[(i + 1) % TRAILS.length] : null;
  });

  protected count(t: Trail): number {
    return trailArticleIds(t).length;
  }

  protected articlesOf(ids: string[]) {
    return ids.map((id) => findArticle(id)!).filter(Boolean);
  }
}
