import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { bookOfRef, positionOfRef } from '../../core/bible-order';
import { findBook } from '../../core/books';
import { DictionaryEntry, DictionaryLang, DOMAINS, fold, KINDS, LANGS } from '../../core/dictionary';

type Filter = 'todos' | 'verbos' | DictionaryLang;

/** Dicionário bíblico com filtros por idioma original. */
@Component({
  selector: 'app-dictionary',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Dicionário bíblico</h1>
      <p>Palavras da Bíblia com o termo original, os sentidos conforme o contexto e os verbos com as formas em que aparecem. No leitor, as palavras do dicionário aparecem sublinhadas: toque nelas para ver o sentido naquele versículo.</p>
      <a class="guide" routerLink="/artigo/idiomas-da-biblia"><mat-icon>school</mat-icon> Como ler as palavras originais (hebraico, aramaico e grego)</a>
    </header>

    <label class="search">
      <mat-icon>search</mat-icon>
      <input type="search" placeholder="Buscar: graça, ágape, shalom, Selá…" [value]="query()" (input)="setQuery($any($event.target).value)"
             aria-label="Buscar no dicionário" />
    </label>

    <div class="order" role="tablist" aria-label="Organizar">
      @for (o of orders; track o.id) {
        <button role="tab" [class.on]="order() === o.id" [attr.aria-selected]="order() === o.id" (click)="setOrder(o.id)"><mat-icon>{{ o.icon }}</mat-icon>{{ o.name }}</button>
      }
    </div>

    <nav class="chips" aria-label="Idioma original">
      @for (f of filters; track f.id) {
        <button [class.active]="filter() === f.id" (click)="setFilter(f.id)">{{ f.name }}</button>
      }
    </nav>

    @if (!all()) {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    } @else {
      <p class="count">{{ results().length }} {{ results().length === 1 ? 'verbete' : 'verbetes' }}</p>
      @for (group of grouped(); track group.letter) {
        <h2 class="letter" [class.long]="order() !== 'az'">{{ group.letter }}</h2>
        <div class="list">
          @for (e of group.entries; track e.id) {
            <a class="card entry" matRipple [routerLink]="['/dicionario', e.id]">
              <span class="term">{{ e.term }}</span>
              @if (e.original?.[0]; as o) {
                <span class="orig"><span [attr.dir]="langs[o.lang].dir">{{ o.word }}</span> · <em>{{ o.translit }}</em></span>
              } @else {
                <span class="orig">{{ kinds[e.kind] }}</span>
              }
              <span class="def">{{ e.definition }}</span>
            </a>
          }
        </div>
      } @empty {
        <p class="empty">Nenhum verbete encontrado.</p>
      }
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .guide { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; min-height: 40px; }
    .guide mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .search {
      display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 16px; margin-bottom: 12px; border-radius: 26px;
      background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant);
    }
    .search input { flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: none; font: 400 16px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .search input::placeholder { color: var(--placeholder); }
    .count { margin: 0 4px 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .letter { font: 600 22px var(--heading-font); color: var(--accent-gold); margin: 18px 4px 8px; }
    .letter.long { font-size: 19px; }
    .order { display: flex; gap: 4px; padding: 4px; margin-bottom: 10px; border-radius: 22px; background: var(--mat-sys-surface-container-high); }
    .order button {
      flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; border: 0; border-radius: 18px;
      cursor: pointer; background: none; color: var(--mat-sys-on-surface-variant); font: 600 14px Inter, sans-serif;
    }
    .order button mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .order button.on { background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); box-shadow: var(--shadow-soft); }
    .entry { display: flex; flex-direction: column; gap: 2px; padding: 12px 16px; border-radius: 16px; }
    .term { font: 600 17px/1.3 var(--heading-font); }
    .orig { font: 400 15px 'Times New Roman', 'Noto Serif', serif; color: var(--mat-sys-primary); }
    .orig em { font-family: Inter, sans-serif; font-size: 13px; color: var(--mat-sys-on-surface-variant); }
    .def {
      font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
  `,
})
export class DictionaryPage {
  readonly q = input<string>();
  readonly lingua = input<string>();
  readonly ordem = input<string>();

  private readonly router = inject(Router);
  protected readonly all = toSignal<DictionaryEntry[]>(inject(ContentService).dictionary);
  protected readonly langs = LANGS;
  protected readonly kinds = KINDS;
  protected readonly filters: { id: Filter; name: string }[] = [
    { id: 'todos', name: 'Todos' },
    { id: 'verbos', name: 'Verbos' },
    ...(Object.keys(LANGS) as DictionaryLang[]).map((id) => ({ id, name: LANGS[id].name })),
  ];

  protected readonly orders = [
    { id: 'az', name: 'A–Z', icon: 'sort_by_alpha' },
    { id: 'assunto', name: 'Por assunto', icon: 'category' },
    { id: 'biblia', name: 'Pela Bíblia', icon: 'menu_book' },
  ];
  protected readonly order = computed(() => (['assunto', 'biblia'].includes(this.ordem() ?? '') ? this.ordem()! : 'az'));

  private readonly typed = signal<string | null>(null);
  protected readonly query = computed(() => this.typed() ?? this.q() ?? '');
  protected readonly filter = computed<Filter>(() => (this.lingua() as Filter) || 'todos');

  protected readonly results = computed(() => {
    const q = fold(this.query().trim());
    const filter = this.filter();
    return (this.all() ?? ([] as DictionaryEntry[]))
      .filter((e) => filter === 'todos' || (filter === 'verbos' ? e.kind === 'verbo' : e.original?.some((o) => o.lang === filter)))
      .filter(
        (e) =>
          !q ||
          fold(e.term).includes(q) ||
          e.original?.some((o) => fold(o.translit).includes(q) || o.word.includes(this.query().trim())) ||
          e.forms?.some((f) => fold(f) === q),
      )
      .sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
  });

  protected readonly grouped = computed(() => {
    const groups: { letter: string; entries: DictionaryEntry[] }[] = [];
    if (this.order() === 'assunto') {
      return DOMAINS.map((d) => ({ letter: d.name, entries: this.results().filter((e) => e.domain === d.id) })).filter((g) => g.entries.length);
    }
    if (this.order() === 'biblia') {
      // Pelo livro da primeira referência do verbete, de Gênesis a Apocalipse
      const sorted = [...this.results()].sort((a, b) => positionOfRef(a.refs?.[0]) - positionOfRef(b.refs?.[0]));
      for (const e of sorted) {
        const name = findBook(bookOfRef(e.refs?.[0]) ?? '')?.name ?? 'Sem referência bíblica';
        const last = groups.at(-1);
        if (last?.letter === name) last.entries.push(e);
        else groups.push({ letter: name, entries: [e] });
      }
      return groups;
    }
    for (const e of this.results()) {
      const letter = fold(e.term).charAt(0).toUpperCase();
      const last = groups.at(-1);
      if (last?.letter === letter) last.entries.push(e);
      else groups.push({ letter, entries: [e] });
    }
    return groups;
  });

  protected setQuery(value: string): void {
    this.typed.set(value);
    this.router.navigate([], { queryParams: { q: value || null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected setOrder(id: string): void {
    this.router.navigate([], { queryParams: { ordem: id === 'az' ? null : id }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected setFilter(id: Filter): void {
    this.router.navigate([], { queryParams: { lingua: id === 'todos' ? null : id }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
