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
  protected readonly articles = computed(() => articlesOf(this.current()));
}
