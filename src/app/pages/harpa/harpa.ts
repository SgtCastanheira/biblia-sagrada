import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { fold } from '../../core/dictionary';
import { searchHymns } from '../../core/harpa';
import { SourcesBox } from '../../shared/sources-box';

/** Harpa Cristã: os 640 hinos, com quem escreveu ou traduziu cada um e a origem dos já pesquisados. */
@Component({
  selector: 'app-harpa',
  imports: [RouterLink, MatIconModule, MatRippleModule, SourcesBox],
  template: `
    <header class="page-head">
      <span class="overline">História da Igreja</span>
      <h1>Harpa Cristã</h1>
      <p>A história dos hinos do hinário das Assembleias de Deus: quem escreveu ou traduziu, de onde veio e por quê. As letras não aparecem aqui — use a sua Harpa.</p>
    </header>

    <a class="card row" matRipple routerLink="/artigo/harpa-crista">
      <span class="badge"><mat-icon>history_edu</mat-icon></span>
      <span class="texts"><span class="meta">1921–hoje</span><span class="name">A história da Harpa Cristã</span><span class="desc">Do Cantor Pentecostal aos 640 hinos: quem organizou, traduziu e escreveu.</span></span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>

    @if (people().length) {
      <h2 class="section-title">Quem escreveu e traduziu</h2>
      <nav class="chips" aria-label="Autores e tradutores">
        <button [class.active]="!person()" (click)="person.set(null)">Todos</button>
        @for (p of people(); track p.id) {
          <button [class.active]="person() === p.id" (click)="person.set(person() === p.id ? null : p.id)">{{ p.name }} <small>{{ p.count }}</small></button>
        }
      </nav>
    }

    <h2 class="section-title">Os hinos</h2>
    <div class="search">
      <mat-icon>search</mat-icon>
      <input placeholder="Número ou título (ex.: 15, Chuvas de graça)" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Buscar hino" />
    </div>
    <label class="only"><input type="checkbox" [checked]="onlyStories()" (change)="onlyStories.set(!onlyStories())" /> Só os hinos com a história da origem ({{ storyCount() }})</label>

    @if (!data()) {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    } @else {
      <p class="count">{{ list().length }} {{ list().length === 1 ? 'hino' : 'hinos' }} — a Harpa tem 640; os outros entram aqui à medida que a história de cada um é confirmada em fontes públicas.</p>
      <ol class="hymns">
        @for (h of shown(); track h.n) {
          <li>
            <a matRipple [routerLink]="['/harpa', h.n]">
              <span class="n">{{ h.n }}</span>
              <span class="texts"><span class="name">{{ h.title }}</span>@if (h.author) { <span class="desc">{{ nameOf(h) }}</span> }</span>
              @if (h.origin) { <mat-icon class="story" aria-label="Tem a história da origem">auto_stories</mat-icon> }
            </a>
          </li>
        }
      </ol>
      @if (list().length > shown().length) {
        <button class="more" (click)="limit.set(limit() + 100)">Mostrar mais ({{ list().length - shown().length }})</button>
      }
    }

    <app-sources topic="harpa" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .chips { flex-wrap: wrap; overflow: visible; margin: 0 0 8px; padding: 0 4px; }
    .chips button.active { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-color: transparent; }
    .chips small { margin-left: 4px; color: var(--mat-sys-on-surface-variant); }
    .search {
      display: flex; align-items: center; gap: 8px; height: 46px; padding: 0 12px; border-radius: 14px;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface-variant);
    }
    .search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: none; color: var(--mat-sys-on-surface); font: 500 15px Inter, sans-serif; }
    .only { display: flex; align-items: center; gap: 8px; min-height: 44px; margin: 4px 4px 0; font: 500 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .only input { width: 20px; height: 20px; }
    .count { margin: 4px 4px 8px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hymns { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
    .hymns a {
      position: relative; overflow: hidden; display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; align-items: center; gap: 10px;
      min-height: 52px; padding: 6px 12px; border-radius: 14px; text-decoration: none; color: inherit;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .hymns .n { font: 600 17px var(--heading-font); color: var(--accent-gold); text-align: center; }
    .hymns .texts { display: flex; flex-direction: column; min-width: 0; }
    .hymns .name { font: 600 15px/1.3 var(--heading-font); }
    .hymns .desc { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hymns .story { color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .more { display: block; width: 100%; min-height: 48px; margin-top: 10px; border-radius: 14px; cursor: pointer; background: none; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 15px Inter, sans-serif; }
  `,
})
export class HarpaPage {
  protected readonly data = toSignal(inject(ContentService).harpa);
  protected readonly query = signal('');
  protected readonly person = signal<string | null>(null);
  protected readonly onlyStories = signal(false);
  protected readonly limit = signal(100);

  protected readonly storyCount = computed(() => (this.data()?.hymns ?? []).filter((h) => h.origin).length);
  /** Autores e tradutores com mais hinos primeiro. */
  protected readonly people = computed(() => {
    const d = this.data();
    if (!d) return [];
    const counts = new Map<string, number>();
    for (const h of d.hymns) if (h.person) counts.set(h.person, (counts.get(h.person) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([id]) => d.people[id])
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id, name: d.people[id].name, count }));
  });
  protected readonly list = computed(() => {
    let hymns = searchHymns(this.data()?.hymns ?? [], this.query(), fold);
    if (this.person()) hymns = hymns.filter((h) => h.person === this.person());
    if (this.onlyStories()) hymns = hymns.filter((h) => h.origin);
    return hymns;
  });
  protected readonly shown = computed(() => this.list().slice(0, this.limit()));

  protected nameOf(h: { person?: string; author?: string }): string {
    return (h.person && this.data()?.people[h.person]?.name) || h.author || '';
  }
}
