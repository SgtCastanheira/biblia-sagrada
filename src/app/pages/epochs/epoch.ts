import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CONTEXT_ICONS, CONTEXT_KIND_NAMES, ContextEvent } from '../../core/ad-context';
import { BIBLE_MAPS } from '../../core/maps';
import { CHURCH_MAPS } from '../../core/church-maps';
import { ContentService } from '../../core/content.service';
import { CURIOSITIES } from '../../core/curiosities';
import { bibleOfEpoch, EPOCHS, epochNeighbours, epochOfCuriosity, epochOfMap, epochOfPerson, epochOfProphecy, findEpoch, timelineOfEpoch } from '../../core/epochs';
import { findArticle } from '../../core/library';
import { parseReferences } from '../../core/reference-parser';
import { BackButton } from '../../shared/back-button';
import { ChurchNoteView } from '../../shared/church-note';
import { SourcesBox } from '../../shared/sources-box';

type Lane = 'tudo' | 'historias' | 'mundo' | 'igreja';

/** Uma época: tudo o que o app tem dela, na ordem do tempo, com as crises do mundo no meio das histórias. */
@Component({
  selector: 'app-epoch',
  imports: [RouterLink, MatIconModule, MatRippleModule, BackButton, ChurchNoteView, SourcesBox],
  template: `
    @if (epoch(); as e) {
      <div class="top"><app-back fallback="/epocas" /></div>
      <header class="hero">
        <mat-icon class="watermark" aria-hidden="true">{{ e.icon }}</mat-icon>
        <span class="h-over">{{ e.part }} · época {{ index() + 1 }} de {{ total }}</span>
        <h1>{{ e.name }}</h1>
        <span class="h-when">{{ e.period }}</span>
        <p>{{ e.summary }}</p>
        @if (e.atlas) {
          <a class="h-link" routerLink="/atlas" [queryParams]="{ epoca: e.atlas }"><mat-icon>map</mat-icon> Ver o mundo desta época no atlas</a>
        }
      </header>

      @if (bible().length) {
        <h2 class="section-title"><mat-icon>menu_book</mat-icon> Na Bíblia</h2>
        <p class="lead">Os livros e os capítulos que contam esta época ou foram escritos nela. Toque para ver o estudo do livro.</p>
        <div class="chips">
          @for (b of bible(); track b.bookId + b.from) {
            <a [routerLink]="['/livro', b.bookId]">{{ b.name }}@if (!b.whole) { <small>{{ b.from }}–{{ b.to }}</small> }</a>
          }
        </div>
      }

      @if (hasStories() || hasEvents()) {
        <h2 class="section-title"><mat-icon>timeline</mat-icon> A época, ano a ano</h2>
        @if (churchCount()) {
          <p class="lead"><mat-icon class="inline">church</mat-icon> A igreja não ficou de fora: em {{ churchCount() }} {{ churchCount() === 1 ? 'fato' : 'fatos' }} desta época, a caixa “A igreja nesse tempo” mostra o que ela viveu.</p>
        }
        @if (shownLanes().length > 2) {
          <div class="seg" role="group" aria-label="O que mostrar">
            @for (l of shownLanes(); track l.id) {
              <button type="button" [class.on]="lane() === l.id" [attr.aria-pressed]="lane() === l.id" (click)="lane.set(l.id)"><mat-icon>{{ l.icon }}</mat-icon>{{ l.name }}</button>
            }
          </div>
        }
        <ol class="years">
          @for (row of rows(); track row.year) {
            <li class="year">
              <span class="yr">{{ yearLabel(row.year) }}</span>
              <div class="cards">
                @for (it of row.items; track $index) {
                  @if (it.story; as a) {
                    <a class="card-ev story" matRipple [routerLink]="['/artigo', a.id]">
                      <span class="tag"><mat-icon>{{ a.icon }}</mat-icon>História · {{ a.period }}</span>
                      <strong>{{ a.title }}</strong>
                      <span class="text">{{ a.subtitle }}</span>
                    </a>
                  } @else if (it.event; as v) {
                    <article class="card-ev" [attr.data-kind]="v.kind">
                      <span class="tag"><mat-icon>{{ icons[v.kind] }}</mat-icon>{{ v.when }} · {{ kinds[v.kind] }}</span>
                      <strong>{{ v.title }}</strong>
                      <span class="text">{{ v.text }}</span>
                      @if (v.church; as c) { <app-church-note [note]="c" /> }
                      @if (refLink(v); as r) {
                        <a class="more" [routerLink]="['/ler', r.bookId, r.chapter]"><mat-icon>menu_book</mat-icon>{{ v.ref }}</a>
                      }
                      @if (storyOf(v); as s) {
                        <a class="more" [routerLink]="['/artigo', s.id]"><mat-icon>{{ s.icon }}</mat-icon>{{ s.title }}</a>
                      }
                    </article>
                  }
                }
              </div>
            </li>
          }
        </ol>
      }

      @if (people().length) {
        <h2 class="section-title"><mat-icon>groups</mat-icon> Personagens</h2>
        <div class="chips">
          @for (p of shownPeople(); track p.id) {
            <a [routerLink]="['/memorial', p.id]">{{ p.name }}</a>
          }
          @if (people().length > 16) {
            <button type="button" class="toggle" (click)="allPeople.set(!allPeople())">{{ allPeople() ? 'Mostrar menos' : 'Mostrar todos os ' + people().length }}</button>
          }
        </div>
      }

      @if (curiosities().length) {
        <h2 class="section-title"><mat-icon>lightbulb</mat-icon> Você sabia?</h2>
        <div class="list">
          @for (c of curiosities(); track c.id) {
            <a class="card row" matRipple [routerLink]="['/curiosidades', c.id]">
              <span class="badge"><mat-icon>{{ c.icon }}</mat-icon></span>
              <span class="texts"><span class="meta">{{ c.topic }}</span><span class="name">{{ c.question }}</span></span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }

      @if (prophecies().length) {
        <h2 class="section-title"><mat-icon>visibility</mat-icon> Promessas e profecias</h2>
        <div class="chips">
          @for (p of prophecies(); track p.id) { <a [routerLink]="['/profecias', p.id]">{{ p.title }}</a> }
        </div>
      }

      @if (maps().length) {
        <h2 class="section-title"><mat-icon>map</mat-icon> Mapas</h2>
        <div class="chips">
          @for (m of maps(); track m.id) { <a [routerLink]="['/mapas', m.id]"><mat-icon>{{ m.icon }}</mat-icon>{{ m.title }}</a> }
        </div>
      }

      <nav class="neigh" aria-label="Outras épocas">
        @if (near().prev; as p) {
          <a class="n-card" matRipple [routerLink]="['/epocas', p.id]"><mat-icon>arrow_back</mat-icon><span><small>Época anterior</small>{{ p.name }}</span></a>
        }
        @if (near().next; as n) {
          <a class="n-card next" matRipple [routerLink]="['/epocas', n.id]"><span><small>Próxima época</small>{{ n.name }}</span><mat-icon>arrow_forward</mat-icon></a>
        }
      </nav>
      <a class="all" routerLink="/epocas"><mat-icon>timeline</mat-icon> Todas as épocas</a>

      <app-sources topic="epocas" />
    } @else {
      <div class="top"><app-back fallback="/epocas" /></div>
      <p class="empty">Não encontrei essa época. <a routerLink="/epocas">Ver todas as épocas</a></p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .hero {
      position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px; padding: 24px 20px; border-radius: 24px; color: #fff8ec;
      background: radial-gradient(110% 90% at 100% 0%, rgba(203, 165, 108, .26), transparent 62%), linear-gradient(165deg, #2f4a3d, #1b2b23 80%);
    }
    .hero > :not(.watermark) { position: relative; }
    .watermark { position: absolute; right: -14px; bottom: -22px; width: 150px; height: 150px; font-size: 150px; color: rgba(255, 255, 255, .1); }
    .h-over { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #f1d9a8; }
    h1 { margin: 0; font: 600 30px/1.15 var(--heading-font); }
    .h-when { font: 600 20px var(--heading-font); color: #e2c28c; }
    .hero p { margin: 4px 0 0; max-width: 600px; font: 400 16px/1.55 var(--reading-font); color: #eadfcb; }
    .h-link { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; min-height: 44px; margin-top: 8px; padding: 0 16px 0 12px; border-radius: 22px; text-decoration: none; background: #f1d9a8; color: #1b2b23; font: 600 14px Inter, sans-serif; }
    .h-link mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .section-title mat-icon { color: var(--accent-gold); }
    .lead { margin: -4px 4px 10px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips a, .chips .toggle {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 20px; text-decoration: none; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    .chips small { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .chips mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    .chips .toggle { border-style: dashed; color: var(--mat-sys-primary); background: none; }
    .lead .inline { font-size: 18px; width: 18px; height: 18px; vertical-align: -4px; color: var(--accent-gold); }
    .seg { display: inline-flex; flex-wrap: wrap; padding: 3px; margin: 0 0 8px; border-radius: 22px; background: var(--mat-sys-surface-container); }
    .seg button { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 0; border-radius: 20px; background: none; cursor: pointer; font: 600 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .seg button.on { background: var(--mat-sys-surface); color: var(--mat-sys-primary); box-shadow: var(--shadow-soft); }
    .seg mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .years { list-style: none; margin: 0; padding: 0; }
    .year { display: grid; grid-template-columns: 68px minmax(0, 1fr); gap: 10px; padding: 10px 0; border-top: 1px solid var(--mat-sys-outline-variant); }
    .yr { font: 700 18px/1.2 var(--heading-font); padding-top: 2px; }
    .cards { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
    .card-ev { display: flex; flex-direction: column; gap: 3px; padding: 11px 14px; border-radius: 14px; text-decoration: none; color: inherit; border: 1px solid var(--mat-sys-outline-variant); border-left: 4px solid var(--mat-sys-outline); background: var(--mat-sys-surface-container-low); }
    .card-ev.story { border-left-color: var(--accent-gold); background: var(--mat-sys-surface); }
    .card-ev[data-kind='guerra'], .card-ev[data-kind='violencia'], .card-ev[data-kind='desastre'] { border-left-color: var(--mat-sys-error); }
    .card-ev[data-kind='saude'], .card-ev[data-kind='clima'] { border-left-color: var(--mat-sys-tertiary); }
    .tag { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .story .tag { color: var(--accent-gold); }
    .tag mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-ev strong { font: 600 17px/1.3 var(--heading-font); }
    .text { font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .more { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; min-height: 40px; text-decoration: none; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .more mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .list { display: grid; gap: 10px; }
    .neigh { display: grid; gap: 10px; margin-top: 26px; }
    .n-card { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 18px; text-decoration: none; color: var(--mat-sys-primary); background: var(--mat-sys-surface-container); font: 600 17px/1.3 var(--heading-font); }
    .n-card.next { justify-content: space-between; }
    .n-card span { display: flex; flex-direction: column; }
    .n-card small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .all { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 8px; text-decoration: none; font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    @media (min-width: 840px) {
      .year { grid-template-columns: 84px minmax(0, 1fr); gap: 16px; }
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
      .neigh { grid-template-columns: 1fr 1fr; }
    }
  `,
})
export class EpochPage {
  private readonly content = inject(ContentService);
  private readonly title = inject(Title);

  readonly id = input<string>();
  protected readonly total = EPOCHS.length;
  protected readonly icons = CONTEXT_ICONS;
  protected readonly kinds = CONTEXT_KIND_NAMES;
  protected readonly lanes: { id: Lane; name: string; icon: string }[] = [
    { id: 'tudo', name: 'Tudo', icon: 'view_timeline' },
    { id: 'historias', name: 'Histórias', icon: 'auto_stories' },
    { id: 'mundo', name: 'Crises e fatos do mundo', icon: 'public' },
    { id: 'igreja', name: 'A igreja nas crises', icon: 'church' },
  ];
  protected readonly lane = signal<Lane>('tudo');
  protected readonly allPeople = signal(false);

  protected readonly epoch = computed(() => findEpoch(this.id()));
  protected readonly index = computed(() => EPOCHS.findIndex((e) => e.id === this.id()));
  protected readonly near = computed(() => (this.epoch() ? epochNeighbours(this.epoch()!) : { prev: null, next: null }));
  protected readonly bible = computed(() => bibleOfEpoch(this.id() ?? ''));
  private readonly entries = computed(() => timelineOfEpoch(this.id() ?? ''));
  protected readonly hasStories = computed(() => this.entries().some((x) => x.story));
  protected readonly hasEvents = computed(() => this.entries().some((x) => x.event));
  protected readonly churchCount = computed(() => this.entries().filter((x) => x.event?.church).length);
  /** Só os filtros que mostram alguma coisa nesta época. */
  protected readonly shownLanes = computed(() =>
    this.lanes.filter((l) => l.id === 'tudo' || (l.id === 'historias' ? this.hasStories() : l.id === 'mundo' ? this.hasEvents() : this.churchCount() > 0)),
  );

  /** Os itens da época, no filtro escolhido, agrupados por ano. */
  protected readonly rows = computed(() => {
    const lane = this.lane();
    const rows: { year: number; items: ReturnType<typeof timelineOfEpoch> }[] = [];
    for (const it of this.entries()) {
      if ((lane === 'historias' && !it.story) || (lane === 'mundo' && !it.event) || (lane === 'igreja' && !it.event?.church)) continue;
      const last = rows.at(-1);
      if (last?.year === it.year) last.items.push(it);
      else rows.push({ year: it.year, items: [it] });
    }
    return rows;
  });

  private readonly allPeopleData = toSignal(this.content.memorial, { initialValue: [] });
  private readonly allProphecies = toSignal(this.content.prophecies, { initialValue: [] });
  protected readonly people = computed(() => this.allPeopleData().filter((p) => epochOfPerson(p)?.id === this.id()));
  protected readonly shownPeople = computed(() => (this.allPeople() ? this.people() : this.people().slice(0, 16)));
  protected readonly prophecies = computed(() => this.allProphecies().filter((p) => epochOfProphecy(p)?.id === this.id()));
  protected readonly curiosities = computed(() => CURIOSITIES.filter((c) => epochOfCuriosity(c)?.id === this.id()));
  protected readonly maps = computed(() => [...BIBLE_MAPS, ...CHURCH_MAPS].filter((m) => epochOfMap(m)?.id === this.id()));

  constructor() {
    effect(() => {
      const e = this.epoch();
      this.title.setTitle(e ? `${e.name} · Linha do tempo · Bíblia Sagrada` : 'Linha do tempo · Bíblia Sagrada');
    });
    // Ao trocar de época, volta ao filtro "Tudo"
    effect(() => { this.id(); this.lane.set('tudo'); this.allPeople.set(false); });
  }

  protected yearLabel(year: number): string {
    return year < 0 ? `${-year} a.C.` : `${year}`;
  }

  protected refLink(e: ContextEvent) {
    return e.ref ? parseReferences(e.ref).refs[0] : undefined;
  }

  protected storyOf(e: ContextEvent) {
    return e.article ? findArticle(e.article) : undefined;
  }
}
