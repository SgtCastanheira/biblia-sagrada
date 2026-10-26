import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { BackButton } from '../../shared/back-button';
import { PassageView } from '../../shared/passage-view';
import { RichText } from '../../shared/rich-text';

/** Um hino da Harpa Cristã: quem escreveu ou traduziu, a origem (quando documentada) e as fontes. */
@Component({
  selector: 'app-hymn',
  imports: [RouterLink, MatIconModule, MatRippleModule, BackButton, PassageView, RichText],
  template: `
    @if (hymn(); as h) {
      <div class="article">
        <div class="top"><app-back fallback="/harpa" label="Voltar à Harpa" /></div>
        <span class="overline">Harpa Cristã · Hino {{ h.n }}</span>
        <h1 class="title">{{ h.title }}</h1>
        @if (person(); as p) {
          <p class="byline"><mat-icon>edit</mat-icon> {{ h.origin ? 'Versão em português' : 'Autor na Harpa' }}: <strong>{{ p.name }}</strong>@if (h.author && h.author !== p.name) { <span class="initials">({{ h.author }})</span> }</p>
        } @else if (h.author) {
          <p class="byline"><mat-icon>edit</mat-icon> Na Harpa: <strong>{{ h.author === '***' ? 'autor desconhecido' : h.author }}</strong></p>
        }
        <p class="lyrics-note"><mat-icon>music_note</mat-icon> A letra não aparece no app: pertence à CPAD e aos autores. Cante pela sua Harpa.</p>

        @if (h.origin; as o) {
          <h2 class="section-title">A origem do hino</h2>
          <dl class="facts">
            <div><dt>Original</dt><dd><cite>{{ o.title }}</cite> ({{ o.language }})</dd></div>
            <div><dt>Letra</dt><dd>{{ o.author }}@if (o.year) {, {{ o.year }}}</dd></div>
            @if (o.composer) { <div><dt>Música</dt><dd>{{ o.composer }}</dd></div> }
          </dl>
          <app-rich-text [source]="o.story" />
          @if (o.bible) {
            <h2 class="section-title">O texto bíblico do hino</h2>
            <app-passage-view [refs]="o.bible" />
          }
        } @else {
          <aside class="pending"><mat-icon>travel_explore</mat-icon><p>A origem deste hino ainda não foi documentada nas fontes consultadas. Se você conhece a história dele (com a fonte), ela pode entrar aqui.</p></aside>
        }

        @if (person()?.bio; as bio) {
          <h2 class="section-title">Quem foi {{ person()!.name }}</h2>
          <app-rich-text [source]="bio" />
        }

        <h2 class="section-title">Fontes</h2>
        <ul class="sources">
          @for (s of h.sources; track s.label) {
            <li>@if (s.url) { <a [href]="s.url" target="_blank" rel="noopener">{{ s.label }}</a> } @else { {{ s.label }} }</li>
          }
          @for (s of h.origin?.sources ?? []; track s.label) {
            <li>@if (s.url) { <a [href]="s.url" target="_blank" rel="noopener">{{ s.label }}</a> } @else { {{ s.label }} }</li>
          }
          @for (s of person()?.sources ?? []; track s.label) {
            <li>@if (s.url) { <a [href]="s.url" target="_blank" rel="noopener">{{ s.label }}</a> } @else { {{ s.label }} }</li>
          }
        </ul>

        <nav class="neighbours">
          @if (neighbours().prev; as prev) {
            <a class="card" matRipple [routerLink]="['/harpa', prev.n]"><mat-icon>arrow_back</mat-icon><span><small>Hino {{ prev.n }}</small>{{ prev.title }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as next) {
            <a class="card next" matRipple [routerLink]="['/harpa', next.n]"><span><small>Hino {{ next.n }}</small>{{ next.title }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
    } @else if (data()) {
      <p class="empty">Hino não encontrado. <a routerLink="/harpa">Ver a Harpa</a></p>
    } @else {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .byline { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0 0 10px; font: 400 16px/1.5 var(--reading-font); }
    .byline mat-icon, .lyrics-note mat-icon { color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .initials { color: var(--mat-sys-on-surface-variant); }
    .lyrics-note { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .facts { margin: 0 0 12px; border-radius: 16px; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); }
    .facts div { display: grid; grid-template-columns: minmax(80px, 26%) minmax(0, 1fr); gap: 12px; padding: 10px 14px; }
    .facts div + div { border-top: 1px solid var(--mat-sys-outline-variant); }
    dt { font: 600 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    dd { margin: 0; font: 400 15px/1.5 var(--reading-font); }
    .pending { display: flex; gap: 12px; padding: 14px 16px; border-radius: 16px; background: var(--mat-sys-surface-container); }
    .pending mat-icon { flex: none; color: var(--mat-sys-on-surface-variant); }
    .pending p { margin: 0; font: 400 15px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .sources { margin: 0; padding-left: 20px; font: 400 15px/1.6 var(--reading-font); }
    .sources a { color: var(--mat-sys-primary); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 32px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px/1.3 var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class HymnPage {
  readonly n = input.required<string>();
  protected readonly data = toSignal(inject(ContentService).harpa);
  protected readonly hymn = computed(() => this.data()?.hymns.find((h) => h.n === Number(this.n())));
  protected readonly person = computed(() => {
    const id = this.hymn()?.person;
    return id ? this.data()?.people[id] : undefined;
  });
  protected readonly neighbours = computed(() => {
    const hymns = this.data()?.hymns ?? [];
    const i = hymns.findIndex((h) => h.n === Number(this.n()));
    return { prev: i > 0 ? hymns[i - 1] : null, next: i >= 0 && i < hymns.length - 1 ? hymns[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const h = this.hymn();
      title.setTitle(h ? `${h.n}. ${h.title} · Harpa Cristã` : 'Harpa Cristã');
    });
  }
}
