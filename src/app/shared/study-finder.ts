import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { HitKind, KIND_INFO, search, SearchHit } from '../core/study-search';
import { StudySearchService } from '../core/study-search.service';

/**
 * Campo de pesquisa do estudo (títulos e textos de histórias, memorial, dicionário, profecias, curiosidades,
 * hinos, épocas e fatos). Enquanto há uma pesquisa, mostra os resultados no lugar do que vem dentro dele
 * (a biblioteca); sem pesquisa, mostra o conteúdo. O texto vai para o endereço (?q=).
 */
@Component({
  selector: 'app-study-finder',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <form class="finder" role="search" (submit)="$event.preventDefault()">
      <mat-icon aria-hidden="true">search</mat-icon>
      <input type="search" [value]="term()" (input)="setTerm($any($event.target).value)" placeholder="Pesquisar: Niceia, Madureira, dízimo…" aria-label="Pesquisar na biblioteca" autocomplete="off" enterkeyhint="search" />
      @if (term()) { <button type="button" class="clear" (click)="setTerm('')" aria-label="Limpar a pesquisa"><mat-icon>close</mat-icon></button> }
    </form>

    @if (searching()) {
      @if (!prepared()) {
        <p class="status" role="status"><mat-icon>hourglass_top</mat-icon> Preparando a pesquisa…</p>
      } @else {
        <p class="status" role="status">
          @if (hits().length) { {{ hits().length }} {{ hits().length === 1 ? 'resultado' : 'resultados' }} para “{{ term().trim() }}” }
          @else { Nada encontrado para “{{ term().trim() }}”. Tente outra palavra ou só uma parte dela. }
        </p>
        @if (kinds().length > 1) {
          <div class="chips" role="group" aria-label="Filtrar por tipo">
            <button type="button" [class.on]="!kind()" [attr.aria-pressed]="!kind()" (click)="kind.set(null)">Tudo {{ hits().length }}</button>
            @for (k of kinds(); track k.kind) {
              <button type="button" [class.on]="kind() === k.kind" [attr.aria-pressed]="kind() === k.kind" (click)="kind.set(k.kind)"><mat-icon>{{ k.icon }}</mat-icon>{{ k.label }} {{ k.count }}</button>
            }
          </div>
        }
        <div class="list">
          @for (h of shown(); track h.doc.kind + h.doc.id) {
            <a class="card row hit" matRipple [routerLink]="h.doc.link">
              <span class="badge"><mat-icon>{{ info[h.doc.kind].icon }}</mat-icon></span>
              <span class="texts">
                <span class="meta">{{ info[h.doc.kind].label }}@if (h.doc.subtitle) { · {{ h.doc.subtitle }} }</span>
                <span class="name">{{ h.doc.title }}</span>
                @if (h.snippet; as sn) { <span class="desc">{{ sn.before }}<mark>{{ sn.hit }}</mark>{{ sn.after }}</span> }
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }
    } @else {
      <ng-content />
    }
  `,
  styleUrl: './study.scss',
  styles: `
    .finder { display: flex; align-items: center; gap: 8px; min-height: 52px; margin: 0 0 14px; padding: 0 8px 0 14px; border-radius: 26px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low, var(--mat-sys-surface)); }
    .finder:focus-within { border-color: var(--mat-sys-primary); outline: 2px solid var(--mat-sys-primary); outline-offset: 1px; }
    .finder > mat-icon { color: var(--accent-gold); }
    .finder input { flex: 1; min-width: 0; height: 48px; border: 0; outline: 0; background: none; color: var(--mat-sys-on-surface); font: 400 16px Inter, sans-serif; }
    .finder input::placeholder { color: var(--mat-sys-on-surface-variant); }
    .clear { display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: none; cursor: pointer; color: var(--mat-sys-on-surface-variant); }
    .status { display: flex; align-items: center; gap: 8px; margin: 4px 2px 12px; font: 500 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
    .chips button { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer; border: 1px solid var(--mat-sys-outline-variant); background: none; color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif; }
    .chips button.on { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-color: transparent; }
    .chips mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    .hit mark { background: color-mix(in srgb, var(--accent-gold) 35%, transparent); color: inherit; border-radius: 3px; padding: 0 2px; }
  `,
})
export class StudyFinder {
  private readonly router = inject(Router);
  private readonly searcher = inject(StudySearchService);

  /** Texto da pesquisa; vem do endereço (?q=) e volta para ele. */
  readonly q = input<string>();
  protected readonly term = signal('');
  protected readonly kind = signal<HitKind | null>(null);
  protected readonly info = KIND_INFO;
  protected readonly prepared = signal<ReturnType<typeof import('../core/study-search').prepare> | null>(null);
  protected readonly searching = computed(() => this.term().trim().length >= 2);
  private readonly all = computed<SearchHit[]>(() => {
    const idx = this.prepared();
    return idx && this.searching() ? search(idx, this.term(), 400) : [];
  });
  protected readonly hits = this.all;
  protected readonly kinds = computed(() => {
    const counts = new Map<HitKind, number>();
    for (const h of this.all()) counts.set(h.doc.kind, (counts.get(h.doc.kind) ?? 0) + 1);
    return [...counts].map(([kind, count]) => ({ kind, count, ...KIND_INFO[kind] }));
  });
  protected readonly shown = computed(() => this.all().filter((h) => !this.kind() || h.doc.kind === this.kind()).slice(0, 60));

  constructor() {
    effect(() => { const q = this.q(); if (q !== undefined && q !== this.term()) this.term.set(q); });
    effect(() => {
      if (this.searching() && !this.prepared()) this.searcher.index.subscribe((i) => this.prepared.set(i));
    });
  }

  protected setTerm(value: string): void {
    this.term.set(value);
    this.kind.set(null);
    void this.router.navigate([], { queryParams: { q: value.trim() || null }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
