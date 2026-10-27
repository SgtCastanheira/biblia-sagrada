import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findProgram, lessonDateLabel, lessonsOfClass, quartersOf } from '../../core/teaching';
import { BackButton } from '../../shared/back-button';

/** Uma turma (IBUC ou EBD): como ensinar nessa idade e as aulas. */
@Component({
  selector: 'app-ibuc-class',
  imports: [RouterLink, MatIconModule, MatRippleModule, BackButton],
  template: `
    @if (group(); as c) {
      <div class="top"><app-back [fallback]="p().path" [label]="'Voltar a ' + p().name" /></div>
      <header class="page-head">
        <span class="overline">{{ p().name }} · {{ c.ages }}</span>
        <h1>{{ c.name }}</h1>
      </header>

      <aside class="tips card">
        <h2><mat-icon>tips_and_updates</mat-icon> Como ensinar nesta idade</h2>
        <ul>
          @for (t of c.tips; track t) { <li>{{ t }}</li> }
        </ul>
      </aside>

      <h2 class="section-title">Lições do trimestre</h2>
      @if (quarters().length > 1) {
        <nav class="quarters" aria-label="Trimestre">
          @for (q of quarters(); track q.key) {
            <button [class.on]="q.key === quarter().key" [attr.aria-pressed]="q.key === quarter().key" (click)="picked.set(q.key)">{{ q.label }}</button>
          }
        </nav>
      }
      <p class="quarter-label">{{ quarter().label }}@if (quarter().current) { · trimestre atual }</p>
      <ol class="lessons">
        @for (item of quarter().lessons; track item.number) {
          <li [class.ready]="!!item.lesson">
            @if (item.lesson; as l) {
              <a class="card lesson ready" matRipple [routerLink]="[p().path, 'aula', l.id]" [queryParams]="{ turma: c.id }">
                <span class="num" [class.due]="item.due">{{ item.number }}</span>
                <span class="texts">
                  <span class="meta">Lição {{ item.number }} · {{ l.refs }}</span>
                  <span class="name">{{ l.title }}</span>
                  <span class="when" [class.due]="item.due"><mat-icon>event</mat-icon>{{ dateLabel(item.date) }}@if (item.due) { · é a próxima aula }</span>
                </span>
                <mat-icon class="go">chevron_right</mat-icon>
              </a>
            } @else {
              <div class="lesson pending" [attr.aria-label]="'Lição ' + item.number + ': em preparação'">
                <span class="num" [class.due]="item.due">{{ item.number }}</span>
                <span class="soon">Em preparação<span class="when" [class.due]="item.due">{{ dateShort(item.date) }}</span></span>
              </div>
            }
          </li>
        }
      </ol>

      @if (real().length) {
        <h2 class="section-title">Outras aulas</h2>
        <div class="list">
          @for (l of real(); track l.id) {
            <a class="card row" matRipple [routerLink]="[p().path, 'aula', l.id]" [queryParams]="{ turma: c.id }">
              <span class="badge"><mat-icon>school</mat-icon></span>
              <span class="texts"><span class="meta">{{ l.refs }}</span><span class="name">{{ l.title }}</span><span class="desc">{{ l.theme }}</span></span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }

      @if (examples().length) {
        <h2 class="section-title">Modelo de aula</h2>
        @for (l of examples(); track l.id) {
          <a class="card row" matRipple [routerLink]="[p().path, 'aula', l.id]" [queryParams]="{ turma: c.id }">
            <span class="badge example"><mat-icon>visibility</mat-icon></span>
            <span class="texts"><span class="meta">Exemplo · {{ l.refs }}</span><span class="name">{{ l.title }}</span><span class="desc">Veja como cada aula vai aparecer.</span></span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      }
    } @else {
      <p class="empty">Turma não encontrada. <a [routerLink]="p().path">Ver as turmas</a></p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .tips { padding: 6px 18px 12px; border-left: 3px solid var(--accent-gold); }
    .tips h2 { display: flex; align-items: center; gap: 8px; font: 600 18px var(--heading-font); margin: 12px 0 6px; }
    .tips h2 mat-icon { color: var(--accent-gold); }
    .tips ul { margin: 0; padding-left: 20px; font: 400 15px/1.6 var(--reading-font); }
    .tips li { margin-bottom: 6px; }
    .empty { display: flex; align-items: center; gap: 10px; padding: 16px; border-radius: 16px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface-variant); }
    .example { background: var(--mat-sys-surface-container-high) !important; }
    .quarters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 10px; }
    .quarters button {
      min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer; background: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    .quarters button.on { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-color: transparent; }
    .quarter-label { margin: 0 4px 10px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    .lessons { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    /* A lição com aula ocupa a linha toda; as que ainda não têm ficam compactas, lado a lado */
    .lessons li.ready { grid-column: 1 / -1; }
    .lesson { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 16px; min-height: 44px; box-sizing: border-box; }
    .lesson .texts { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .lesson .meta { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .lesson .name { font: 600 16px/1.3 var(--heading-font); }
    .lesson .go { color: var(--mat-sys-on-surface-variant); }
    .soon { display: flex; flex-direction: column; gap: 1px; font: 500 13px Inter, sans-serif; }
    .when { display: inline-flex; align-items: center; gap: 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .when mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .when.due { color: var(--mat-sys-primary); font-weight: 700; }
    /* A lição da vez: o número pisca para chamar a atenção do professor */
    .lesson .num.due { background: var(--accent-gold); color: #1d1608; animation: due-pulse 1.3s ease-in-out infinite; }
    @keyframes due-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-gold) 70%, transparent); }
      50% { transform: scale(1.14); box-shadow: 0 0 0 9px color-mix(in srgb, var(--accent-gold) 0%, transparent); }
    }
    @media (prefers-reduced-motion: reduce) { .lesson .num.due { animation: none; outline: 3px solid var(--accent-gold); outline-offset: 2px; } }
    .lesson .num {
      width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font: 600 15px var(--heading-font);
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .lesson.pending { border: 1px dashed var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface-variant); }
    .lesson.pending .num { background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant); }

  `,
})
export class IbucClassPage {
  readonly turma = input.required<string>();
  readonly program = input<string>();
  protected readonly p = computed(() => findProgram(this.program()));
  protected readonly group = computed(() => this.p().classes.find((c) => c.id === this.turma()));
  /** Aulas sem número de lição (temas avulsos). */
  protected readonly real = computed(() => lessonsOfClass(this.p(), this.turma()).filter((l) => !l.example && !l.number));
  protected readonly quarters = computed(() => quartersOf(this.p(), this.turma()));
  protected readonly picked = signal<string | null>(null);
  protected readonly quarter = computed(() => this.quarters().find((q) => q.key === this.picked()) ?? this.quarters().find((q) => q.current)!);
  protected readonly examples = computed(() => lessonsOfClass(this.p(), this.turma()).filter((l) => l.example));

  protected readonly dateLabel = lessonDateLabel;
  protected dateShort(d: Date): string {
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.group()?.name ?? 'Turma'} · ${this.p().name}`));
  }
}
