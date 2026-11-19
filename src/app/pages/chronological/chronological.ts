import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import {
  CHRONO_CHAPTERS,
  CHRONO_GROUPS,
  CHRONO_SECTIONS,
  type ChronoSection,
  sectionRefs,
  sectionSize,
} from '../../core/bible-chronological';
import { findBook } from '../../core/books';
import { SettingsService } from '../../core/settings.service';
import { BackButton } from '../../shared/back-button';
import { SourcesBox } from '../../shared/sources-box';
import { BooksOrder } from './books-order';
import { Contemporaries } from './contemporaries';
import { TimeWords } from './time-words';
import { ChronologicalTimeline } from './chronological-timeline';
import { TimeMachine } from './time-machine';

/** A Bíblia em ordem cronológica: a lista das seções da leitura, em grupos, com o progresso de quem lê. */
@Component({
  selector: 'app-chronological',
  imports: [BackButton, RouterLink, MatIconModule, MatRippleModule, SourcesBox, BooksOrder, Contemporaries, TimeWords, ChronologicalTimeline, TimeMachine],
  template: `
    <header class="hero">
      <app-back class="back" fallback="/livros" />
      <span class="kicker">Almeida · 1.189 capítulos</span>
      <h1>A Bíblia em Ordem Cronológica</h1>
      <p class="lead">
        Os mesmos capítulos da Bíblia, lidos na ordem em que as coisas aconteceram. Jó fica junto dos patriarcas, os salmos de Davi entram na vida de Davi,
        os profetas aparecem no reinado em que viveram e as cartas de Paulo, ao lado das viagens em que foram escritas.
      </p>
      <div class="side">
        <div class="progress" role="img" [attr.aria-label]="readTotal() + ' de ' + total + ' capítulos lidos'">
          <span [style.width.%]="(readTotal() / total) * 100"></span>
        </div>
        <p class="count">{{ readTotal() }} de {{ total }} capítulos lidos</p>
        <a class="start" matRipple [routerLink]="['/ler', resume().bookId, resume().chapter]" [queryParams]="order">
          <mat-icon>play_arrow</mat-icon>
          {{ readTotal() ? 'Continuar' : 'Começar' }} em {{ resumeLabel() }}
        </a>
      </div>
    </header>

    <details class="how">
      <summary><mat-icon>info</mat-icon> Como esta ordem foi feita</summary>
      <ul>
        <li><strong>É a ordem dos fatos, e não a da escrita.</strong> Samuel, Reis e Crônicas contam a mesma história, e aqui os capítulos paralelos ficam juntos.</li>
        <li><strong>Cada capítulo aparece uma vez só.</strong> Quando um capítulo junta tempos diferentes (os Evangelhos, Jeremias, Isaías), ele fica onde está a parte principal dele.</li>
        <li><strong>Onde os estudiosos discordam, a seção avisa.</strong> A posição de Jó, de Joel, de Tiago, de Gálatas e de Hebreus, por exemplo, é uma escolha, e não um fato.</li>
        <li><strong>Os salmos entram onde o título os liga a um fato</strong> (Salmo 51: “quando o profeta Natã veio a ele”). Os outros ficam juntos, na seção “Os Salmos”.</li>
        <li>Quem lê por aqui vê a barra “Ordem cronológica” no alto do capítulo, e o <em>anterior</em>, o <em>próximo</em> e o deslizar da página seguem esta ordem.</li>
      </ul>
    </details>

    <nav class="jump" aria-label="Mais nesta página">
      <span>Mais nesta página:</span>
      <button type="button" matRipple (click)="go('maquina-do-tempo')">A máquina do tempo</button>
      <button type="button" matRipple (click)="go('livros-na-ordem')">Os livros na ordem</button>
      <button type="button" matRipple (click)="go('quem-viveu')">Quem viveu na mesma época?</button>
      <button type="button" matRipple (click)="go('nomes-do-tempo')">Os nomes do tempo</button>
    </nav>

    <app-time-machine id="maquina-do-tempo" [phase]="shown()" [startYear]="startYear()" (phaseChange)="pick($event, false)" />

    <app-chronological-timeline [groups]="groupInfo()" [selected]="shown()" [reading]="reading()"
      (phasePicked)="pick($event, false)" (sectionsRequested)="pick($event)" />

    @if (current(); as g) {
      <section #panel class="panel" id="chrono-section-panel" [attr.aria-label]="'Seções de ' + g.name">
        <header class="p-head">
          <mat-icon>{{ g.icon }}</mat-icon>
          <h2>{{ g.name }}</h2>
          <span class="p-period">{{ g.period }} · {{ g.read }} de {{ g.size }} cap. lidos</span>
        </header>
        <ol class="grid">
          @for (s of g.sections; track s.n) {
            <li [class.done]="isDone(s)" [class.next]="isNext(s)">
              <a class="card" matRipple [routerLink]="['/ler', start(s).bookId, start(s).chapter]" [queryParams]="order">
                <span class="top">
                  <span class="n">{{ s.n }}</span>
                  @if (isDone(s)) { <mat-icon class="ok" aria-label="Lida">check_circle</mat-icon> }
                  @else if (isNext(s)) { <span class="here">Continue aqui</span> }
                  @else if (readOf(s)) { <span class="part">{{ readOf(s) }}/{{ size(s) }}</span> }
                </span>
                <span class="title">{{ s.title }}</span>
                <span class="refs">{{ refs(s) }} · {{ size(s) }} cap.</span>
                <span class="summary">{{ s.summary }}</span>
                <span class="bar" aria-hidden="true"><span [style.width.%]="(readOf(s) / size(s)) * 100"></span></span>
              </a>
              @if (s.note) {
                <details class="why">
                  <summary><mat-icon>info</mat-icon> É uma escolha</summary>
                  <p>{{ s.note }}</p>
                </details>
              }
            </li>
          }
        </ol>
      </section>
    }

    <app-books-order id="livros-na-ordem" />
    <app-contemporaries id="quem-viveu" [phase]="shown()" />
    <app-time-words id="nomes-do-tempo" />

    <p class="fine">
      Esta ordem é uma proposta de leitura feita para o app, a partir das datas que os próprios livros dão e do que os estudiosos costumam aceitar. Não é a ordem de nenhuma
      edição impressa.
    </p>
    <app-sources topic="cronologica" />
  `,
  styles: `
    :host { display: block; }
    .hero {
      position: relative; padding: 52px 22px 22px; border-radius: 24px; margin-top: 4px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); box-shadow: var(--shadow-soft);
    }
    .back { position: absolute; top: 6px; left: 6px; color: var(--mat-sys-on-surface-variant); }
    .kicker { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); }
    h1 { font: 600 34px/1.12 var(--heading-font); letter-spacing: -.4px; margin: 6px 0 10px; }
    .lead { margin: 0 0 16px; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .progress { height: 4px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); overflow: hidden; }
    .progress span { display: block; height: 100%; background: var(--mat-sys-primary); }
    .count { margin: 8px 0 16px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .start {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 8px 20px 8px 14px; position: relative; overflow: hidden;
      border-radius: 22px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 14px Inter, sans-serif; text-decoration: none;
    }
    @media (max-width: 839px) {
      .hero { display: flex; flex-direction: column; }
      .hero .side { order: 2; margin: 6px 0 14px; }
      .hero .lead { order: 3; margin-bottom: 0; font-size: 15px; line-height: 1.6; }
    }
    /* Em tela larga o texto fica de um lado e o progresso do outro, para o topo não ocupar uma tela inteira. */
    @media (min-width: 840px) {
      .hero { display: grid; grid-template-columns: minmax(0, 1fr) 300px; column-gap: 40px; padding-bottom: 24px; }
      .hero > :not(.side):not(.back) { grid-column: 1; }
      .hero .side { grid-column: 2; grid-row: 1 / span 3; align-self: end; }
      .lead { margin-bottom: 0; }
    }
    .how { margin: 16px 0 8px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .how summary { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; cursor: pointer; font: 600 14px Inter, sans-serif; list-style: none; }
    .how summary::-webkit-details-marker, .why summary::-webkit-details-marker { display: none; }
    .how summary mat-icon { color: var(--accent-gold); }
    .how ul { margin: 0; padding: 0 20px 14px 36px; font: 400 15px/1.6 var(--reading-font); }
    .how li { margin-top: 6px; }
    .jump { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: 12px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .jump button {
      position: relative; overflow: hidden; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    .panel { margin-top: 12px; scroll-margin-top: 72px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .p-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; padding: 14px 16px 2px; }
    .p-head mat-icon { color: var(--accent-gold); align-self: center; }
    .p-head h2 { margin: 0; font: 600 18px/1.25 var(--heading-font); }
    .p-period { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }

    /* A grade de blocos: duas colunas no celular, quantas couberem em tela larga. */
    .grid {
      list-style: none; margin: 0; padding: 10px 8px 12px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr)); gap: 8px;
    }
    @media (min-width: 600px) { .grid { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); } }
    .grid li {
      display: flex; flex-direction: column; min-width: 0; border-radius: 14px; overflow: hidden;
      background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant);
    }
    .grid li.done { background: color-mix(in srgb, var(--mat-sys-primary-container) 55%, var(--mat-sys-surface)); border-color: transparent; }
    .grid li:has(.why[open]) { grid-column: 1 / -1; }
    .card {
      position: relative; overflow: hidden; flex: 1; display: flex; flex-direction: column; gap: 3px; padding: 10px 12px 0;
      text-decoration: none; color: var(--mat-sys-on-surface);
    }
    .top { display: flex; align-items: center; justify-content: space-between; min-height: 26px; }
    .n {
      width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
      border: 1px solid var(--mat-sys-outline-variant); font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant);
    }
    .done .n { background: var(--mat-sys-primary-container); border-color: transparent; color: var(--mat-sys-on-primary-container); }
    .title { font: 600 15px/1.3 var(--heading-font); }
    .refs { font: 500 13px/1.4 Inter, sans-serif; color: var(--accent-gold); }
    .summary {
      font: 400 13px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); margin-bottom: 10px;
      display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
    }
    .bar { display: block; height: 3px; margin: auto -12px 0; background: var(--mat-sys-surface-container-highest); }
    .bar span { display: block; height: 100%; background: var(--mat-sys-primary); }
    .grid li.next { border: 2px solid var(--mat-sys-primary); }
    .grid li.next .card { padding: 9px 11px 0; }
    .grid li.next .bar { margin-inline: -11px; }
    .here { font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .ok { color: var(--mat-sys-primary); flex: none; }
    .part { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .why { border-top: 1px solid var(--mat-sys-outline-variant); }
    .why summary { display: flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; cursor: pointer; list-style: none; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .why summary mat-icon { width: 18px; height: 18px; font-size: 18px; color: var(--accent-gold); }
    .why p { margin: 0; padding: 0 12px 12px; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .fine { margin: 20px 4px 4px; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class ChronologicalPage {
  private readonly settings = inject(SettingsService);

  /** `?ano=-740` leva a Máquina do Tempo a um ano certo (negativo é antes de Cristo). */
  readonly ano = input<string | undefined>();
  protected readonly startYear = computed(() => {
    const n = Number(this.ano());
    return this.ano() !== undefined && this.ano() !== '' && Number.isFinite(n) ? n : null;
  });

  protected readonly total = CHRONO_CHAPTERS.length;
  /** Parâmetro que liga a leitura em ordem cronológica no leitor. */
  protected readonly order = { ordem: 'cronologica' };

  /** Os capítulos já lidos, por seção (uma única passada pelos 1.189). */
  private readonly readBySection = computed(() => {
    const read = this.settings.readChapters();
    const sets = new Map<string, Set<number>>();
    const counts = new Map<number, number>();
    for (const c of CHRONO_CHAPTERS) {
      let set = sets.get(c.bookId);
      if (!set) sets.set(c.bookId, (set = new Set(read[c.bookId] ?? [])));
      if (set.has(c.chapter)) counts.set(c.section, (counts.get(c.section) ?? 0) + 1);
    }
    return counts;
  });

  protected readonly readTotal = computed(() => [...this.readBySection().values()].reduce((a, b) => a + b, 0));

  /** O primeiro capítulo que ainda não foi lido, na ordem cronológica. */
  protected readonly resume = computed(() => {
    const read = this.settings.readChapters();
    return CHRONO_CHAPTERS.find((c) => !read[c.bookId]?.includes(c.chapter)) ?? CHRONO_CHAPTERS[0];
  });
  protected readonly resumeLabel = computed(() => {
    const c = this.resume();
    return `${this.bookName(c.bookId)} ${c.chapter}`;
  });
  /** Cada fase da história com as suas seções e o quanto já foi lido (uma passada só). */
  protected readonly groupInfo = computed(() =>
    CHRONO_GROUPS.map((g) => {
      const sections = CHRONO_SECTIONS.filter((s) => s.group === g.id);
      return {
        ...g,
        sections,
        size: sections.reduce((sum, s) => sum + sectionSize(s), 0),
        read: sections.reduce((sum, s) => sum + this.readOf(s), 0),
      };
    }),
  );

  /** A fase que a pessoa está lendo abre sozinha; ao tocar numa caixinha, é a dela que fica aberta. */
  private readonly picked = signal<string | null>(null);
  protected readonly reading = computed(() => CHRONO_SECTIONS[this.resume().section - 1].group);
  protected readonly shown = computed(() => this.picked() ?? this.reading());
  protected readonly current = computed(() => this.groupInfo().find((g) => g.id === this.shown()));
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  /** A seção em que a pessoa parou (o próximo capítulo a ler cai nela). */
  protected isNext(s: ChronoSection): boolean {
    return s.n === this.resume().section;
  }

  /** Leva a vista até um dos blocos de baixo (o roteador não rola até âncoras). */
  protected go(id: string): void {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }

  protected pick(id: string, reveal = true): void {
    this.picked.set(id);
    setTimeout(() => {
      if (!reveal) return;
      // as seções abrem logo abaixo das caixinhas: só rola se elas ficaram longe da vista (e sem animar para quem pediu menos movimento)
      const el = this.panel()?.nativeElement;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.6 || top < 56) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }

  protected readOf(s: ChronoSection): number {
    return this.readBySection().get(s.n) ?? 0;
  }
  protected isDone(s: ChronoSection): boolean {
    return this.readOf(s) >= sectionSize(s);
  }
  protected readonly refs = sectionRefs;
  protected readonly size = sectionSize;
  protected start(s: ChronoSection) {
    return { bookId: s.parts[0].bookId, chapter: s.parts[0].from };
  }

  private bookName(id: string): string {
    return findBook(id)?.name ?? id;
  }
}
