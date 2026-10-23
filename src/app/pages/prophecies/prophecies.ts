import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { articlesOf } from '../../core/library';
import { bookOfRef, inBibleOrder, positionOfRef } from '../../core/bible-order';
import { findBook } from '../../core/books';
import { CATEGORIES, ProphecyCategory, ProphecyStatus, STATUSES } from '../../core/prophecy';
import { SourcesBox } from '../../shared/sources-box';

/** Promessas e profecias: do Antigo Testamento ao cumprimento, com a situação de cada uma. */
@Component({
  selector: 'app-prophecies',
  imports: [RouterLink, MatIconModule, MatRippleModule, SourcesBox],
  template: `
    <header class="page-head">
      <span class="overline">Estudo</span>
      <h1>Promessas e profecias</h1>
      <p>Das promessas do Éden à nova criação, na ordem da Bíblia — de Gênesis a Apocalipse: o texto original, o contexto, os textos de cumprimento e as interpretações quando há divergência.</p>
    </header>

    <div class="studies">
      @for (a of studies; track a.id) {
        <a class="card study" matRipple [routerLink]="['/artigo', a.id]">
          <mat-icon>{{ a.icon }}</mat-icon>
          <span><small>Estudo · {{ a.minutes }} min</small>{{ a.title }}</span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      }
    </div>

    <nav class="chips" aria-label="Tema">
      <a [routerLink]="[]" [queryParams]="{ tema: null }" queryParamsHandling="merge" replaceUrl [class.active]="!tema()">Todos</a>
      @for (c of categories; track c.id) {
        <a [routerLink]="[]" [queryParams]="{ tema: c.id }" queryParamsHandling="merge" replaceUrl [class.active]="tema() === c.id"><mat-icon>{{ c.icon }}</mat-icon>{{ c.name }}</a>
      }
    </nav>
    <nav class="chips" aria-label="Situação">
      <a [routerLink]="[]" [queryParams]="{ situacao: null }" queryParamsHandling="merge" replaceUrl [class.active]="!situacao()">Qualquer situação</a>
      @for (s of statuses; track s.id) {
        <a [routerLink]="[]" [queryParams]="{ situacao: s.id }" queryParamsHandling="merge" replaceUrl [class.active]="situacao() === s.id">
          <i class="dot" [class]="s.id"></i>{{ s.name }}
        </a>
      }
    </nav>

    @if (!all()) {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    } @else {
      @for (g of groups(); track g.id) {
        <h2 class="section-title">{{ g.name }}</h2>
        <div class="list">
          @for (p of g.items; track p.id) {
            <a class="card prophecy" matRipple [routerLink]="['/profecias', p.id]">
              <span class="top-line">
                <span class="ref">{{ p.ref }}</span>
                <span class="status" [class]="p.status">{{ statusName(p.status) }}</span>
              </span>
              <span class="p-title">{{ p.title }}</span>
              @if (p.fulfillment[0]; as f) { <span class="arrow"><mat-icon>subdirectory_arrow_right</mat-icon>{{ f.ref }} · {{ f.text }}</span> }
            </a>
          }
        </div>
      } @empty {
        <p class="empty">Nenhuma profecia com esses filtros.</p>
      }
    }

    <p class="source">
      <strong>Como ler a situação.</strong> “Cumprida” quando os cristãos em geral concordam; “Já e ainda não” quando o cumprimento começou e se completa no futuro;
      “Interpretações diferentes” quando estudiosos e tradições divergem; “Futura” quando a maioria entende que ainda vai se cumprir.
      Veja os princípios em <a routerLink="/artigo/como-interpretar-profecias">Como interpretar as profecias</a>.
    </p>
    <app-sources topic="profecias" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .studies { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .study { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 16px; }
    .study > mat-icon { color: var(--accent-gold); }
    .study span { flex: 1; display: flex; flex-direction: column; font: 600 16px/1.3 var(--heading-font); }
    .study small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .study .go { color: var(--mat-sys-on-surface-variant); }
    .chips { margin-bottom: 8px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .prophecy { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 16px; }
    .top-line { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .ref { font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .p-title { font: 600 17px/1.35 var(--heading-font); }
    .arrow { display: flex; gap: 4px; font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .arrow mat-icon { flex: none; font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    .status { font: 600 13px Inter, sans-serif; padding: 2px 10px; border-radius: 10px; white-space: nowrap; }
    .status.cumprida, .dot.cumprida { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .status.parcial, .dot.parcial { background: color-mix(in srgb, var(--accent-gold) 22%, transparent); color: var(--mat-sys-on-surface); }
    .status.debatida, .dot.debatida { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    .status.futura, .dot.futura { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .dot.cumprida { background: var(--mat-sys-primary); }
    .dot.parcial { background: var(--accent-gold); }
    .dot.debatida { background: var(--mat-sys-tertiary); }
    .dot.futura { background: var(--mat-sys-secondary); }
  `,
})
export class PropheciesPage {
  readonly tema = input<string>();
  readonly situacao = input<string>();
  protected readonly all = toSignal(inject(ContentService).prophecies);
  protected readonly studies = articlesOf('profecias');
  protected readonly categories = (Object.keys(CATEGORIES) as ProphecyCategory[]).map((id) => ({ id, ...CATEGORIES[id] }));
  protected readonly statuses = (Object.keys(STATUSES) as ProphecyStatus[]).map((id) => ({ id, ...STATUSES[id] }));

  /** Na ordem da Bíblia, agrupadas pelo livro em que a profecia foi dada (de Gênesis a Apocalipse). */
  protected readonly groups = computed(() => {
    const list = inBibleOrder(
      (this.all() ?? []).filter((p) => (!this.tema() || p.category === this.tema()) && (!this.situacao() || p.status === this.situacao())),
      (p) => positionOfRef(p.ref),
    );
    const groups: { id: string; name: string; items: typeof list }[] = [];
    for (const p of list) {
      const id = bookOfRef(p.ref) ?? '';
      const last = groups.at(-1);
      if (last?.id === id) last.items.push(p);
      else groups.push({ id, name: findBook(id)?.name ?? 'Outros', items: [p] });
    }
    return groups;
  });

  protected statusName(s: ProphecyStatus): string {
    return STATUSES[s].name;
  }
}
