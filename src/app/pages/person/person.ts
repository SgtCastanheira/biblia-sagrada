import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { ARTICLES } from '../../core/library';
import { findMap } from '../../core/maps';
import { findGroup, VERDICTS } from '../../core/memorial';
import { articlesOfPerson, inGenealogy, mapsOfPerson, relatedPeople } from '../../core/relations';
import { tribeOfPerson, tribesOfPatriarch } from '../../core/tribes';
import { PassageView } from '../../shared/passage-view';
import { Sheets } from '../../shared/sheets';
import { SourcesBox } from '../../shared/sources-box';

/** Página de um personagem do Memorial da Fé. */
@Component({
  selector: 'app-person',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, PassageView, SourcesBox],
  template: `
    @if (person(); as p) {
      <div class="article">
        <div class="top">
          <app-back fallback="/memorial" [queryParams]="{ grupo: mainGroup()?.id }" />
        </div>

        <span class="overline">{{ mainGroup()?.name }} · {{ p.period }}</span>
        <h1 class="title">{{ p.name }}</h1>
        <p class="epithet">{{ p.title }}</p>
        @if (p.meaning) {
          <p class="meaning"><mat-icon>badge</mat-icon> O nome significa <strong>“{{ p.meaning }}”</strong></p>
        }

        @if (p.reign; as r) {
          <div class="reign">
            <span><small>Reinado</small>{{ r.years }}</span>
            <span><small>Duração</small>{{ r.length }}</span>
            <span class="verdict" [class]="r.verdict"><small>Avaliação</small>{{ verdicts[r.verdict] }}</span>
          </div>
        }

        <p class="summary">{{ p.summary }}</p>

        @if (p.facts?.length) {
          <dl class="facts">
            @for (f of p.facts; track f[0]) {
              <div><dt>{{ f[0] }}</dt><dd>{{ f[1] }}</dd></div>
            }
          </dl>
        }

        <h2 class="section-title">Texto-chave</h2>
        <app-passage-view [refs]="p.keyVerse" />

        @if (p.legacy) {
          <aside class="legacy"><mat-icon>auto_awesome</mat-icon><p><strong>Para a nossa vida.</strong> {{ p.legacy }}</p></aside>
        }

        <h2 class="section-title">Onde ler</h2>
        <div class="refs">
          @for (r of p.refs; track r) {
            <button (click)="openRef(r)">{{ r }}</button>
          }
        </div>

        @if (related().length) {
          <h2 class="section-title">Pessoas relacionadas</h2>
          <div class="people">
            @for (r of related(); track r.id) {
              <a class="person-chip" matRipple [routerLink]="['/memorial', r.id]"><span class="avatar">{{ r.name.charAt(0) }}</span><span>{{ r.name }}<small>{{ r.title }}</small></span></a>
            }
          </div>
        }

        @if (inGenealogy() || maps().length || articles().length || tribes().length) {
          <h2 class="section-title">Para continuar o estudo</h2>
          <div class="links">
            @if (inGenealogy()) {
              <a class="card link" matRipple routerLink="/genealogia"><mat-icon>account_tree</mat-icon><span><small>Genealogia</small>Está na genealogia de Jesus</span><mat-icon class="go">chevron_right</mat-icon></a>
            }
            @for (t of tribes(); track t.id) {
              <a class="card link" matRipple [routerLink]="['/tribos', t.id]"><mat-icon>groups</mat-icon><span><small>{{ t.kind }}</small>Tribo de {{ t.name }}</span><mat-icon class="go">chevron_right</mat-icon></a>
            }
            @for (m of maps(); track m.id) {
              <a class="card link" matRipple [routerLink]="['/mapas', m.id]"><mat-icon>map</mat-icon><span><small>Mapa</small>{{ m.title }}</span><mat-icon class="go">chevron_right</mat-icon></a>
            }
            @for (a of articles(); track a.id) {
              <a class="card link" matRipple [routerLink]="['/artigo', a.id]"><mat-icon>{{ a.icon }}</mat-icon><span><small>Estudo</small>{{ a.title }}</span><mat-icon class="go">chevron_right</mat-icon></a>
            }
          </div>
        }

        @if (p.groups.length > 1) {
          <h2 class="section-title">Também em</h2>
          <nav class="chips">
            @for (g of otherGroups(); track g.id) {
              <a [routerLink]="['/memorial']" [queryParams]="{ grupo: g.id }"><mat-icon>{{ g.icon }}</mat-icon>{{ g.name }}</a>
            }
          </nav>
        }

        <app-sources topic="memorial" />
        <nav class="neighbours">
          @if (neighbours().prev; as prev) {
            <a class="card" matRipple [routerLink]="['/memorial', prev.id]"><mat-icon>arrow_back</mat-icon><span><small>Anterior</small>{{ prev.name }}</span></a>
          } @else { <span></span> }
          @if (neighbours().next; as next) {
            <a class="card next" matRipple [routerLink]="['/memorial', next.id]"><span><small>Próximo</small>{{ next.name }}</span><mat-icon>arrow_forward</mat-icon></a>
          }
        </nav>
      </div>
    } @else if (all()) {
      <p class="empty">Personagem não encontrado.</p>
    } @else {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .epithet { margin: 0 0 10px; font: 500 18px/1.4 var(--heading-font); color: var(--mat-sys-primary); }
    .meaning { display: flex; align-items: center; gap: 8px; margin: 0 0 16px; color: var(--mat-sys-on-surface-variant); }
    .meaning mat-icon { color: var(--accent-gold); font-size: 20px; width: 20px; height: 20px; }
    .summary { font: 400 17px/1.75 var(--reading-font); margin: 0 0 18px; }
    .reign { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 4px 0 18px; }
    .reign span {
      display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 14px;
      background: var(--mat-sys-surface-container); font: 600 14px/1.3 Inter, sans-serif;
    }
    .reign small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .reign .bom { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .reign .mau { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .reign .bom small, .reign .mau small { color: inherit; opacity: .85; }
    .facts { margin: 0 0 8px; display: grid; gap: 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); }
    .facts div { display: grid; grid-template-columns: minmax(96px, 34%) minmax(0, 1fr); gap: 12px; padding: 10px 14px; }
    .facts div + div { border-top: 1px solid var(--mat-sys-outline-variant); }
    dt { font: 600 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    dd { margin: 0; font: 400 15px/1.5 var(--reading-font); }
    .legacy {
      display: flex; gap: 12px; margin: 20px 0 0; padding: 14px 16px; border-radius: 16px;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .legacy mat-icon { flex: none; color: var(--accent-gold); }
    .legacy p { margin: 0; font: 400 16px/1.6 var(--reading-font); }
    .refs { display: flex; flex-wrap: wrap; gap: 8px; }
    .refs button {
      height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer; background: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
    .people { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 8px; }
    .person-chip {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 14px; text-decoration: none; color: inherit;
      position: relative; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .person-chip span:last-child { display: flex; flex-direction: column; min-width: 0; font: 600 15px var(--heading-font); }
    .person-chip small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .avatar {
      flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); font: 600 16px var(--heading-font);
    }
    .links { display: flex; flex-direction: column; gap: 8px; }
    .link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; }
    .link > mat-icon { color: var(--accent-gold); }
    .link span { flex: 1; display: flex; flex-direction: column; font: 600 15px/1.3 var(--heading-font); }
    .link small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .link .go { color: var(--mat-sys-on-surface-variant); }
    .neighbours { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 32px; }
    .neighbours a { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px; font: 600 15px var(--heading-font); }
    .neighbours a span { display: flex; flex-direction: column; min-width: 0; }
    .neighbours small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .neighbours .next { justify-content: flex-end; text-align: right; }
    .neighbours mat-icon { color: var(--mat-sys-primary); flex: none; }
  `,
})
export class PersonPage {
  readonly id = input.required<string>();

  private readonly sheets = inject(Sheets);
  protected readonly all = toSignal(inject(ContentService).memorial);
  protected readonly verdicts = VERDICTS;

  protected readonly person = computed(() => this.all()?.find((p) => p.id === this.id()));
  protected readonly mainGroup = computed(() => findGroup(this.person()?.groups[0] ?? ''));
  protected readonly otherGroups = computed(() =>
    (this.person()?.groups.slice(1) ?? []).map((g) => findGroup(g)!).filter(Boolean),
  );

  protected readonly related = computed(() => {
    const id = this.person()?.id;
    const all = this.all() ?? [];
    return id ? relatedPeople(id).map((r) => all.find((p) => p.id === r)).filter((p) => !!p) : [];
  });
  protected readonly inGenealogy = computed(() => inGenealogy(this.id()));
  /** A tribo do personagem ou, se for patriarca, as tribos que descendem dele. */
  protected readonly tribes = computed(() => {
    const own = tribesOfPatriarch(this.id()).map((t) => ({ id: t.id, name: t.name, kind: 'Tribo que descende dele' }));
    const of = tribeOfPerson(this.id());
    return of ? [...own, { id: of.id, name: of.name, kind: 'Da tribo' }] : own;
  });
  protected readonly maps = computed(() => mapsOfPerson(this.id()).map((m) => findMap(m)!).filter(Boolean));
  protected readonly articles = computed(() => articlesOfPerson(this.id()).map((a) => ARTICLES.find((x) => x.id === a)!).filter(Boolean));

  /** Anterior e próximo dentro do grupo principal. */
  protected readonly neighbours = computed(() => {
    const person = this.person();
    const group = person?.groups[0];
    const list = (this.all() ?? []).filter((p) => group && p.groups.includes(group));
    const i = list.findIndex((p) => p.id === person?.id);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const p = this.person();
      if (p) title.setTitle(`${p.name} · Memorial da Fé`);
    });
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
