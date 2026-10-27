import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ATLAS_MAP } from '../../core/atlas';
import { HitKind, KIND_INFO, search, SearchHit } from '../../core/study-search';
import { StudySearchService } from '../../core/study-search.service';
import { BibleMapView } from '../../shared/bible-map';

interface Shelf {
  link: string;
  queryParams?: Record<string, string>;
  icon: string;
  name: string;
  description: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  shelves: Shelf[];
}

/**
 * Biblioteca de estudo, em seis seções — cada estudo aparece em um só lugar.
 * O ensino (EBD, IBUC, sermões) fica na aba Ensino; o que é pessoal, em Meu espaço.
 */
@Component({
  selector: 'app-study',
  imports: [RouterLink, MatIconModule, MatRippleModule, BibleMapView],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Estudo</h1>
      <p>Personagens, mapas, contexto histórico, profecias, idiomas originais, a igreja e os ministérios e a história — tudo ligado ao texto bíblico.</p>
    </header>

    <form class="finder" role="search" (submit)="$event.preventDefault()">
      <mat-icon aria-hidden="true">search</mat-icon>
      <input type="search" [value]="term()" (input)="setTerm($any($event.target).value)" placeholder="Pesquisar no estudo: Niceia, Madureira, dízimo…" aria-label="Pesquisar no estudo" autocomplete="off" enterkeyhint="search" />
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
    <nav class="toc" aria-label="Seções do estudo">
      @for (s of sections; track s.id) {
        <a [href]="'#' + s.id" (click)="jump($event, s.id)"><mat-icon>{{ s.icon }}</mat-icon>{{ s.title }}</a>
      }
    </nav>

    <a class="card hero" matRipple routerLink="/atlas">
      <app-bible-map [map]="atlas" [compact]="true" />
      <span class="hero-info">
        <span class="overline">Atlas histórico</span>
        <span class="hero-title">O mundo da Bíblia, época por época</span>
        <span class="hero-sub">Reinos, impérios e povos — de antes de Abraão ao Império Romano.</span>
      </span>
    </a>

    <details class="howto card">
      <summary><mat-icon>route</mat-icon> Como estudar pelo leitor<mat-icon class="chevron">expand_more</mat-icon></summary>
      <ol>
        <li><strong>Leia o capítulo.</strong> No topo, abra <em>Estudar este capítulo</em> para saber quem escreveu, quando e o que acontecia na época.</li>
        <li><strong>Toque numa palavra sublinhada.</strong> O dicionário mostra o termo original e o sentido naquele versículo.</li>
        <li><strong>Toque num versículo.</strong> Veja as referências cruzadas e abra o mesmo texto em outras versões.</li>
        <li><strong>Siga os cartões do capítulo.</strong> Mapas, aulas de contexto e estudos aparecem onde o texto pede.</li>
      </ol>
    </details>

    @for (s of sections; track s.id; let i = $index) {
      <section [id]="s.id">
        <h2 class="section-title"><span class="n">{{ i + 1 }}</span>{{ s.title }}</h2>
        <div class="grid">
          @for (sh of s.shelves; track sh.name) {
            <a class="card row" matRipple [routerLink]="sh.link" [queryParams]="sh.queryParams">
              <span class="badge"><mat-icon>{{ sh.icon }}</mat-icon></span>
              <span class="texts">
                <span class="name">{{ sh.name }}</span>
                <span class="desc">{{ sh.description }}</span>
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      </section>
    }

    <a class="sources" matRipple routerLink="/fontes">
      <mat-icon>library_books</mat-icon>
      <span><strong>Fontes das informações</strong> De onde vêm os textos de estudo: a Bíblia, fontes antigas, arqueologia e obras de referência.</span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>
    }
  `,
  styleUrl: '../../shared/study.scss',
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
    /* No celular, o índice desliza numa linha; no computador, quebra em linhas */
    .toc { display: flex; gap: 8px; margin: -4px -16px 14px; padding: 2px 16px; overflow-x: auto; scrollbar-width: none; }
    .toc::-webkit-scrollbar { display: none; }
    .toc a { flex: none; }
    @media (min-width: 840px) { .toc { flex-wrap: wrap; overflow: visible; margin: -4px 0 14px; padding: 2px 0; } }
    .toc a {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 20px; text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    .toc mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    section { scroll-margin-top: 72px; }
    .hero { margin-bottom: 12px; }
    .hero app-bible-map { display: block; aspect-ratio: 21 / 9; overflow: hidden; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .hero-info { display: flex; flex-direction: column; gap: 4px; padding: 14px 18px 16px; }
    .hero-title { font: 600 22px/1.25 var(--heading-font); }
    .hero-sub { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .howto { padding: 0 18px; border-left: 3px solid var(--accent-gold); }
    .howto summary { display: flex; align-items: center; gap: 8px; min-height: 52px; cursor: pointer; list-style: none; font: 600 17px var(--heading-font); }
    .howto summary::-webkit-details-marker { display: none; }
    .howto summary mat-icon { color: var(--accent-gold); }
    .howto .chevron { margin-left: auto; color: var(--mat-sys-on-surface-variant); }
    .howto[open] .chevron { transform: rotate(180deg); }
    .howto ol { margin: 0 0 12px; padding-left: 22px; font: 400 15px/1.6 var(--reading-font); }
    .howto li { margin-bottom: 6px; }
    .howto li::marker { color: var(--accent-gold); font-weight: 600; }
    .section-title .n {
      flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
      font: 600 14px Inter, sans-serif; color: var(--mat-sys-on-primary); background: var(--accent-gold);
    }
    .sources {
      position: relative; overflow: hidden; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
      margin-top: 28px; padding: 14px 16px; border-radius: 16px; text-decoration: none; color: inherit;
      border: 1px dashed var(--mat-sys-outline-variant);
    }
    .sources > mat-icon { color: var(--accent-gold); }
    .sources span { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .sources strong { display: block; font: 600 16px var(--heading-font); color: var(--mat-sys-on-surface); }
    .sources .go { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class StudyPage {
  private readonly router = inject(Router);
  private readonly searcher = inject(StudySearchService);

  /** Texto da pesquisa; vem do endereço (?q=) e volta para ele. */
  readonly q = input<string>();
  protected readonly term = signal('');
  protected readonly kind = signal<HitKind | null>(null);
  protected readonly info = KIND_INFO;
  protected readonly prepared = signal<ReturnType<typeof import('../../core/study-search').prepare> | null>(null);
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
  protected readonly atlas = ATLAS_MAP;

  protected readonly sections: Section[] = [
    {
      id: 'personagens',
      title: 'Personagens',
      icon: 'groups',
      shelves: [
        { link: '/memorial', icon: 'military_tech', name: 'Memorial da Fé', description: 'Patriarcas, juízes, profetas, reis, nazireus, mulheres de fé e apóstolos.' },
        { link: '/memorial', queryParams: { grupo: 'linha-do-tempo' }, icon: 'timeline', name: 'Linha do tempo', description: 'Todos os personagens na ordem da história, de Adão aos apóstolos.' },
        { link: '/memorial', queryParams: { grupo: 'dois-reinos' }, icon: 'compare_arrows', name: 'Os dois reinos', description: 'Os reis de Israel e de Judá lado a lado, com a avaliação de cada um.' },
        { link: '/tribos', icon: 'diversity_3', name: 'As doze tribos de Israel', description: 'Os filhos de Jacó, as bênçãos, os líderes e a vocação de cada tribo.' },
        { link: '/genealogia', icon: 'account_tree', name: 'Genealogia de Jesus', description: 'De Adão a Maria: as linhas de Mateus e de Lucas, com os reis.' },
      ],
    },
    {
      id: 'mapas',
      title: 'Mapas e lugares',
      icon: 'map',
      shelves: [
        { link: '/mapas', icon: 'map', name: 'Mapas das jornadas', description: 'Abraão, Moisés, o Êxodo, os cativeiros, Jesus, os discípulos e Paulo.' },
      ],
    },
    {
      id: 'contexto',
      title: 'Contexto histórico e cultural',
      icon: 'history_edu',
      shelves: [
        { link: '/estudo/livros', icon: 'menu_book', name: 'Contexto dos livros', description: 'Autor, data e cenário de cada livro, de Gênesis a Apocalipse, com tudo o que há para estudar nele.' },
        { link: '/curiosidades', icon: 'lightbulb', name: 'Você sabia?', description: 'Curiosidades bíblicas, com os versículos.' },
        { link: '/quiz', icon: 'quiz', name: 'Você lembra o que leu?', description: 'Jogo de perguntas com alternativas A, B, C e D sobre um capítulo, um livro inteiro ou uma história.' },
      ],
    },
    {
      id: 'profecias',
      title: 'Profecias e palavras',
      icon: 'visibility',
      shelves: [
        { link: '/profecias', icon: 'star', name: 'Promessas e profecias', description: 'Do anúncio ao cumprimento — e o que ainda é esperado.' },
        { link: '/dicionario', icon: 'translate', name: 'Dicionário bíblico', description: 'Hebraico, aramaico, grego e latim, com os sentidos e as conjugações.' },
      ],
    },
    {
      id: 'historia',
      title: 'Histórias e sermões',
      icon: 'account_balance',
      shelves: [
        { link: '/historia', icon: 'auto_stories', name: 'Histórias por assunto', description: 'Histórias da Bíblia, de onde veio a Bíblia, contexto, profecias, história da Igreja, avivamentos, o evangelho no Brasil e a Harpa Cristã.' },
        { link: '/avivamento', icon: 'campaign', name: 'Sermões que marcaram a história', description: 'Wesley, Edwards, Spurgeon, Moody — e pregadores de hoje.' },
      ],
    },
  ];

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
