import { Component, computed, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ArticleCollection, articlesOf, COLLECTIONS } from '../../core/library';

const ORDER: ArticleCollection[] = ['igreja', 'biblia', 'contexto', 'profecias', 'estudos'];

/** Lista de artigos: História da Igreja, De onde veio a Bíblia e Estudos bíblicos. */
@Component({
  selector: 'app-history',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>{{ info().name }}</h1>
      <p>{{ info().description }}</p>
    </header>

    <nav class="chips" aria-label="Coleções">
      @for (c of collections; track c.id) {
        <a [routerLink]="[]" [queryParams]="{ colecao: c.id }" replaceUrl [class.active]="c.id === current()">
          <mat-icon>{{ c.icon }}</mat-icon>{{ c.name }}
        </a>
      }
    </nav>

    @if (overview(); as o) {
      <a class="overview" matRipple [routerLink]="['/artigo', o.id]">
        <mat-icon class="watermark" aria-hidden="true">{{ o.icon }}</mat-icon>
        <span class="o-over">Comece por aqui · como o livro de Atos</span>
        <span class="o-title">{{ o.title }}</span>
        <span class="o-desc">{{ o.subtitle }}</span>
        <span class="o-go">Ler o panorama <mat-icon>arrow_forward</mat-icon></span>
      </a>
      <h2 class="section-title">As histórias completas</h2>
    }

    <ol class="timeline">
      @for (a of articles(); track a.id) {
        <li>
          <span class="dot"></span>
          <a class="card row" matRipple [routerLink]="['/artigo', a.id]">
            <span class="badge"><mat-icon>{{ a.icon }}</mat-icon></span>
            <span class="texts">
              <span class="meta">{{ a.period }}</span>
              <span class="name">{{ a.title }}</span>
              <span class="desc">{{ a.subtitle }}</span>
            </span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        </li>
      }
    </ol>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .timeline { list-style: none; margin: 0; padding: 0 0 0 18px; position: relative; display: flex; flex-direction: column; gap: 10px; }
    .timeline::before { content: ''; position: absolute; left: 4px; top: 20px; bottom: 20px; width: 1px; background: var(--mat-sys-outline-variant); }
    .timeline li { position: relative; }
    .overview {
      position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px; padding: 20px 18px;
      border-radius: 22px; text-decoration: none; color: #fbf4e6;
      background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .28), transparent 60%), linear-gradient(165deg, #45321f, #21180f 75%);
    }
    .watermark { position: absolute; right: -16px; bottom: -24px; width: 140px; height: 140px; font-size: 140px; color: rgba(226, 194, 140, .12); }
    .o-over { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #e2c28c; }
    .o-title { position: relative; font: 600 24px/1.2 var(--heading-font); }
    .o-desc { position: relative; font: 400 15px/1.5 var(--reading-font); color: #eadfcb; }
    .o-go { position: relative; display: flex; align-items: center; gap: 6px; margin-top: 6px; font: 600 15px Inter, sans-serif; color: #e2c28c; }
    .o-go mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .dot {
      position: absolute; left: -18px; top: 50%; width: 9px; height: 9px; margin-top: -5px; border-radius: 50%;
      background: var(--mat-sys-surface); border: 1.5px solid var(--accent-gold);
    }
  `,
})
export class HistoryPage {
  readonly colecao = input<string>();
  protected readonly collections = ORDER.map((id) => ({ id, ...COLLECTIONS[id] }));
  protected readonly current = computed(() => ORDER.find((c) => c === this.colecao()) ?? 'igreja');
  protected readonly info = computed(() => COLLECTIONS[this.current()]);
  protected readonly overview = computed(() => articlesOf(this.current()).find((a) => a.overview));
  protected readonly articles = computed(() => articlesOf(this.current()).filter((a) => !a.overview));
}
