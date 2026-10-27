import { Component, computed, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { sameEra, trailStep } from '../core/story-graph';
import { StoryProgressService } from '../core/story-progress.service';

/**
 * Fim de uma história: onde ela está na trilha, a próxima (como o próximo episódio) e o que acontecia na mesma
 * época em outras trilhas. Não sugere de novo o que o texto já citou nem a anterior e a próxima.
 */
@Component({
  selector: 'app-story-journey',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    @if (step(); as s) {
      <section class="journey" aria-labelledby="journey-title">
        <div class="head">
          <span class="over"><mat-icon>route</mat-icon> Trilha · {{ s.trail.name }}</span>
          <h2 id="journey-title">História {{ s.index + 1 }} de {{ s.total }}</h2>
          <div class="dots" aria-hidden="true">
            @for (id of s.ids; track id; let i = $index) {
              <span [class.done]="progress.isDone(id)" [class.here]="i === s.index"></span>
            }
          </div>
          <p class="count">{{ trailDone() }} de {{ s.total }} {{ trailDone() === 1 ? 'lida' : 'lidas' }} nesta trilha</p>
        </div>

        @if (s.next; as n) {
          <a class="up-next" matRipple [routerLink]="['/artigo', n.id]">
            <mat-icon class="mark" aria-hidden="true">{{ n.icon }}</mat-icon>
            <span class="u-over">A seguir · {{ n.period }}</span>
            <span class="u-title">{{ n.title }}</span>
            <span class="u-sub">{{ n.subtitle }}</span>
            <span class="u-go">{{ n.minutes }} min · Ler a próxima história <mat-icon>arrow_forward</mat-icon></span>
          </a>
        } @else if (s.nextTrail; as t) {
          <p class="end"><mat-icon>flag</mat-icon> Você chegou ao fim da trilha {{ s.trail.name }}.</p>
          <a class="up-next" matRipple routerLink="/historia" [queryParams]="{ trilha: t.id }">
            <mat-icon class="mark" aria-hidden="true">{{ t.icon }}</mat-icon>
            <span class="u-over">Próxima trilha</span>
            <span class="u-title">{{ t.name }}</span>
            <span class="u-sub">{{ t.description }}</span>
            <span class="u-go">Ver as histórias <mat-icon>arrow_forward</mat-icon></span>
          </a>
        }
        @if (s.prev; as p) {
          <a class="prev" [routerLink]="['/artigo', p.id]"><mat-icon>arrow_back</mat-icon><span>Anterior: {{ p.title }}</span></a>
        }

        @if (era().length) {
          <h3 class="era-title"><mat-icon>schedule</mat-icon> Na mesma época, em outras trilhas</h3>
          <div class="era">
            @for (m of era(); track m.article.id) {
              <a class="era-card" matRipple [routerLink]="['/artigo', m.article.id]">
                <span class="e-over">{{ m.trail.short }} · {{ m.article.period }}</span>
                <span class="e-title">{{ m.article.title }}</span>
                @if (progress.isDone(m.article.id)) { <span class="e-done"><mat-icon>check_circle</mat-icon> Lida</span> }
              </a>
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .journey { margin-top: 32px; padding-top: 22px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .over { display: inline-flex; align-items: center; gap: 6px; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .over mat-icon { font-size: 18px; width: 18px; height: 18px; }
    h2 { margin: 6px 0 10px; font: 600 24px/1.2 var(--heading-font); }
    .dots { display: flex; flex-wrap: wrap; gap: 6px; }
    .dots span { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--mat-sys-outline); box-sizing: border-box; }
    .dots span.done { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); }
    .dots span.here { width: 22px; border-radius: 6px; border-color: var(--accent-gold); background: var(--accent-gold); }
    .count { margin: 8px 0 16px; font: 500 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    /* A próxima história: escura, como a capa, para dar vontade de continuar */
    .up-next {
      position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; padding: 20px 18px 16px; border-radius: 22px;
      text-decoration: none; color: #fbf4e6;
      background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .28), transparent 60%), linear-gradient(165deg, #45321f, #21180f 75%);
    }
    .mark { position: absolute; right: -14px; bottom: -22px; width: 130px; height: 130px; font-size: 130px; color: rgba(226, 194, 140, .12); }
    .u-over { position: relative; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #e2c28c; }
    .u-title { position: relative; font: 600 23px/1.2 var(--heading-font); color: #fff8ec; }
    .u-sub { position: relative; font: 400 15px/1.5 var(--reading-font); color: #eadfcb; }
    .u-go { position: relative; display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font: 600 14px Inter, sans-serif; color: #f1d9a8; }
    .u-go mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .end { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 600 16px/1.4 var(--heading-font); }
    .end mat-icon { color: var(--accent-gold); }
    .prev { display: flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 8px; padding: 0 4px; text-decoration: none; font: 500 15px/1.35 Inter, sans-serif; color: var(--mat-sys-primary); }
    .prev mat-icon { flex: none; font-size: 20px; width: 20px; height: 20px; }
    .era-title { display: flex; align-items: center; gap: 8px; margin: 26px 0 10px; font: 600 18px var(--heading-font); }
    .era-title mat-icon { color: var(--accent-gold); }
    .era { display: grid; gap: 10px; grid-template-columns: 1fr; }
    @media (min-width: 840px) { .era { grid-template-columns: repeat(3, 1fr); } }
    .era-card {
      display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 16px; text-decoration: none; color: inherit;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .e-over { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .e-title { font: 600 17px/1.3 var(--heading-font); }
    .e-done { display: inline-flex; align-items: center; gap: 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .e-done mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `,
})
export class StoryJourney {
  readonly articleId = input.required<string>();
  /** Histórias que o texto já citou (não se repetem aqui). */
  readonly linked = input<string[]>([]);
  protected readonly progress = inject(StoryProgressService);

  protected readonly step = computed(() => trailStep(this.articleId()));
  protected readonly era = computed(() => sameEra(this.articleId(), this.linked()));
  protected readonly trailDone = computed(() => this.step()?.ids.filter((id) => this.progress.isDone(id)).length ?? 0);
}
