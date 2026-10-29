import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CONTEXT_ICONS, CONTEXT_KIND_NAMES, REGION_SCOPE, Scope } from '../../core/ad-context';
import { AD_STATES, findAdState, REGIONS } from '../../core/ad-states';
import { buildTimeline, groupByYear, TimelineItem } from '../../core/ad-timeline';
import { ContentService } from '../../core/content.service';
import { BackButton } from '../../shared/back-button';
import { ChurchNoteView } from '../../shared/church-note';
import { SourcesBox } from '../../shared/sources-box';

type Lane = 'tudo' | 'igreja' | 'contexto';

/** Linha do tempo nacional: o que acontecia na igreja e o que acontecia no Brasil e no mundo, ano a ano. */
@Component({
  selector: 'app-ad-timeline',
  imports: [RouterLink, MatIconModule, BackButton, ChurchNoteView, SourcesBox],
  template: `
    <div class="top"><app-back fallback="/assembleia-de-deus" /></div>
    <header class="page-head">
      <span class="overline">Assembleia de Deus no Brasil</span>
      <h1>Linha do tempo</h1>
      <p>O que acontecia na igreja e o que acontecia no Brasil e no mundo, ano a ano, de 1910 até hoje. Cada fato da igreja leva à história do estado. A igreja não viveu fora do seu tempo: onde ela passou pela crise, o fato traz a caixa “A igreja nesse tempo”.</p>
      <a class="whole" routerLink="/epocas"><mat-icon>timeline</mat-icon> A história inteira, da Criação a hoje</a>
    </header>

    <div class="filters">
      <div class="seg" role="group" aria-label="O que mostrar">
        @for (l of lanes; track l.id) {
          <button type="button" [class.on]="lane() === l.id" [attr.aria-pressed]="lane() === l.id" (click)="lane.set(l.id)"><mat-icon>{{ l.icon }}</mat-icon>{{ l.name }}</button>
        }
      </div>
      <div class="chips" role="group" aria-label="Região">
        <button type="button" [class.active]="region() === null" [attr.aria-pressed]="region() === null" (click)="region.set(null)">Todas as regiões</button>
        @for (r of regions; track r) {
          <button type="button" [class.active]="region() === r" [attr.aria-pressed]="region() === r" (click)="region.set(r)">{{ r }}</button>
        }
      </div>
    </div>

    @if (all() === undefined) {
      <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
    } @else {
      <nav class="decades" aria-label="Pular para a década">
        @for (d of decades(); track d.decade) { <button type="button" (click)="jump('d' + d.decade)">{{ d.decade }}s</button> }
      </nav>
      <p class="count" aria-live="polite">{{ shown() }} fatos</p>

      @for (d of decades(); track d.decade) {
        <section class="decade" [id]="'d' + d.decade">
          <h2>{{ d.decade }}</h2>
          <ol>
            @for (y of d.years; track y.year) {
              <li class="year">
                <span class="yr">{{ y.year }}</span>
                <div class="cards">
                  @for (it of y.church; track $index) {
                    <article class="card-ev church">
                      <span class="tag"><mat-icon>church</mat-icon>{{ it.when }}</span>
                      <strong>{{ it.title }}</strong>
                      <span class="text">{{ plain(it) }}</span>
                      @if (it.uf; as uf) { <a [routerLink]="['/assembleia-de-deus', uf]">{{ stateName(uf) }}<mat-icon>arrow_forward</mat-icon></a> }
                    </article>
                  }
                  @for (it of y.context; track $index) {
                    <article class="card-ev ctx" [attr.data-kind]="it.kind">
                      <span class="tag"><mat-icon>{{ icons[it.kind!] }}</mat-icon>{{ it.when }} · {{ kinds[it.kind!] }}</span>
                      <strong>{{ it.title }}</strong>
                      <span class="text">{{ plain(it) }}</span>
                      @if (it.church; as c) { <app-church-note [note]="c" /> }
                    </article>
                  }
                </div>
              </li>
            }
          </ol>
        </section>
      }
      @if (!shown()) { <p class="empty">Nenhum fato com esses filtros.</p> }
    }

    <app-sources topic="contexto-ad" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .whole { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin-top: 6px; text-decoration: none; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .filters { display: flex; flex-direction: column; gap: 10px; margin: 0 0 14px; }
    .seg { display: inline-flex; align-self: flex-start; padding: 3px; border-radius: 22px; background: var(--mat-sys-surface-container); }
    .seg button { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border: 0; border-radius: 20px; background: none; cursor: pointer; font: 600 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .seg button.on { background: var(--mat-sys-surface); color: var(--mat-sys-primary); box-shadow: var(--shadow-soft); }
    .seg mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .filters .chips { margin: 0; }
    .decades { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 0 -20px 6px; padding: 4px 20px; position: sticky; top: 56px; z-index: 5; background: var(--mat-sys-surface); }
    .decades button { flex: none; min-height: 40px; padding: 0 14px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; background: var(--mat-sys-surface); cursor: pointer; font: 600 14px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .count { margin: 4px 0 0; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .decade { scroll-margin-top: 112px; margin-top: 22px; }
    .decade h2 { margin: 0 0 8px; font: 600 28px/1 var(--heading-font); color: var(--accent-gold); }
    ol { list-style: none; margin: 0; padding: 0; }
    .year { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 10px; padding: 10px 0; border-top: 1px solid var(--mat-sys-outline-variant); }
    .yr { font: 700 20px/1.2 var(--heading-font); color: var(--mat-sys-on-surface); padding-top: 2px; }
    .cards { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
    .card-ev { display: flex; flex-direction: column; gap: 3px; padding: 11px 14px; border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .card-ev.church { border-left: 4px solid var(--accent-gold); background: var(--mat-sys-surface); }
    .card-ev.ctx { border-left: 4px solid var(--mat-sys-outline); }
    .card-ev.ctx[data-kind='guerra'], .card-ev.ctx[data-kind='violencia'] { border-left-color: var(--mat-sys-error); }
    .card-ev.ctx[data-kind='saude'], .card-ev.ctx[data-kind='clima'] { border-left-color: var(--mat-sys-tertiary); }
    .tag { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .ctx .tag { color: var(--mat-sys-on-surface-variant); }
    .tag mat-icon { font-size: 16px; width: 16px; height: 16px; }
    strong { font: 600 17px/1.3 var(--heading-font); }
    .text { font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .card-ev a { display: inline-flex; align-items: center; gap: 4px; align-self: flex-start; min-height: 40px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }
    .card-ev a mat-icon { font-size: 16px; width: 16px; height: 16px; }
    @media (min-width: 840px) {
      .decades { margin: 0 0 6px; padding: 4px 0; top: 60px; }
      .year { grid-template-columns: 72px minmax(0, 1fr); gap: 16px; }
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
    }
  `,
})
export class AdTimelinePage {
  private readonly content = inject(ContentService);
  protected readonly icons = CONTEXT_ICONS;
  protected readonly kinds = CONTEXT_KIND_NAMES;
  protected readonly regions = REGIONS;
  protected readonly lanes: { id: Lane; name: string; icon: string }[] = [
    { id: 'tudo', name: 'Tudo', icon: 'view_timeline' },
    { id: 'igreja', name: 'Na igreja', icon: 'church' },
    { id: 'contexto', name: 'No Brasil e no mundo', icon: 'public' },
  ];
  protected readonly lane = signal<Lane>('tudo');
  protected readonly region = signal<string | null>(null);

  /** Todos os fatos (undefined enquanto carrega os textos dos 27 estados). */
  protected readonly all = toSignal(
    forkJoin(AD_STATES.map((s) => this.content.text(`ad-estados/${s.id}.md`).pipe(map((t) => [s.id, (t as string | null) ?? ''] as const), catchError(() => of([s.id, ''] as const))))).pipe(
      map((pairs) => buildTimeline(Object.fromEntries(pairs))),
    ),
  );

  private readonly filtered = computed(() => {
    const list = this.all() ?? [];
    const lane = this.lane();
    const region = this.region();
    const regionScope = region?.toLowerCase() as Scope | undefined;
    return list.filter((it) => {
      if (lane !== 'tudo' && it.lane !== lane) return false;
      if (!region) return true;
      if (it.lane === 'igreja') return REGION_SCOPE[it.uf!] === regionScope;
      // Contexto: vale para o país e o mundo, ou para a região escolhida
      return !!it.scopes?.some((s) => s === 'brasil' || s === 'mundo' || s === regionScope);
    });
  });

  protected readonly shown = computed(() => this.filtered().length);

  /** Os fatos agrupados por década e, dentro dela, por ano. */
  protected readonly decades = computed(() => {
    const years = groupByYear(this.filtered());
    const byDecade = new Map<number, typeof years>();
    for (const y of years) {
      const d = Math.floor(y.year / 10) * 10;
      byDecade.set(d, [...(byDecade.get(d) ?? []), y]);
    }
    return [...byDecade.entries()].sort((a, b) => a[0] - b[0]).map(([decade, ys]) => ({ decade, years: ys }));
  });

  protected stateName(uf: string): string {
    return findAdState(uf)?.state ?? uf.toUpperCase();
  }

  protected plain(it: TimelineItem): string {
    return it.text.map((p) => p.text).join('');
  }

  protected jump(id: string): void {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }
}
