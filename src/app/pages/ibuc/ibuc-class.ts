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
      <ol class="lessons" aria-label="Lições do trimestre">
        @for (item of quarter().lessons; track item.number) {
          <li>
            <button type="button" class="lesson" [class.ready]="!!item.lesson" [class.sel]="selected() === item.number" [class.due]="item.due" [class.done]="item.done"
              [attr.aria-pressed]="selected() === item.number"
              [attr.aria-label]="(item.lesson ? 'Lição ' + item.number + ': ' + item.lesson.title : 'Lição ' + item.number + ': em preparação') + (item.done ? ', já aconteceu' : '')"
              (click)="selected.set(item.number)">
              <span class="num">{{ item.number }}</span>
              @if (item.done) { <mat-icon class="tick" aria-hidden="true">check</mat-icon> }
            </button>
            <span class="dt" [class.due]="item.due">{{ dateShort(item.date) }}</span>
          </li>
        }
      </ol>

      @if (current(); as cur) {
        <article class="focus card" [class.due]="cur.due">
          <span class="focus-num" [class.due]="cur.due" [class.done]="cur.done">{{ cur.number }}</span>
          <span class="focus-text">
            <span class="meta">Lição {{ cur.number }}@if (cur.lesson) { · {{ cur.lesson.refs }} }</span>
            <span class="name">{{ cur.lesson ? cur.lesson.title : 'Em preparação' }}</span>
            @if (cur.lesson) { <span class="desc">{{ cur.lesson.theme }}</span> }
            <span class="when" [class.due]="cur.due"><mat-icon>{{ cur.done ? 'check_circle' : 'event' }}</mat-icon>{{ dateLabel(cur.date) }}@if (cur.due) { · é a próxima aula } @else if (cur.done) { · já aconteceu }</span>
          </span>
          @if (cur.lesson; as l) {
            <a class="open" matRipple [routerLink]="[p().path, 'aula', l.id]" [queryParams]="{ turma: c.id }">Abrir a lição <mat-icon>arrow_forward</mat-icon></a>
          }
        </article>
      }

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
    /* Os números das lições são bolinhas leves: marrom claro para as aulas que ainda vão acontecer, verde claro para as que já foram */
    .lessons { list-style: none; margin: 0 0 12px; padding: 4px 0 2px; display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 10px 6px; }
    .lessons li { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .lesson {
      --ring: color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-surface));
      --tint: color-mix(in srgb, var(--accent-gold) 14%, var(--mat-sys-surface));
      --ink: color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-on-surface));
      position: relative; display: grid; place-items: center; width: 50px; height: 50px; padding: 0; border-radius: 50%; cursor: pointer; box-sizing: border-box;
      border: 2px solid var(--ring); background: var(--tint); color: var(--ink);
    }
    .lesson .num { font: 600 18px var(--heading-font); }
    .lesson.done {
      --ring: color-mix(in srgb, var(--mat-sys-primary) 45%, var(--mat-sys-surface));
      --tint: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface));
      --ink: var(--mat-sys-primary);
    }
    .lesson:not(.ready) { border-style: dashed; border-color: var(--mat-sys-outline-variant); background: transparent; color: var(--mat-sys-on-surface-variant); }
    /* A escolhida ganha um contorno a mais */
    .lesson.sel { box-shadow: 0 0 0 3px var(--mat-sys-surface), 0 0 0 5px var(--ring); }
    .lesson.sel .num { font-weight: 700; }
    .lesson:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 4px; }
    /* A lição da vez: dourado suave, piscando para chamar a atenção do professor */
    .lesson.due {
      --ring: var(--accent-gold);
      --tint: color-mix(in srgb, var(--accent-gold) 26%, var(--mat-sys-surface));
      animation: due-pulse 1.3s ease-in-out infinite;
    }
    @keyframes due-pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-gold) 55%, transparent); }
      50% { transform: scale(1.1); box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent-gold) 0%, transparent); }
    }
    @media (prefers-reduced-motion: reduce) { .lesson.due { animation: none; outline: 3px solid var(--accent-gold); outline-offset: 2px; } }
    /* Aula que já aconteceu: um check verde-claro no canto */
    .tick {
      position: absolute; right: -4px; bottom: -4px; width: 20px; height: 20px; font-size: 14px; display: grid; place-items: center; border-radius: 50%; box-sizing: border-box;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border: 2px solid var(--mat-sys-surface);
    }
    .dt { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .dt.due { font-weight: 700; color: var(--mat-sys-primary); }
    .focus { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; align-items: start; padding: 14px 16px; border-radius: 20px; }
    .focus.due { border-color: var(--accent-gold); }
    .focus-num {
      display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; box-sizing: border-box; font: 600 20px var(--heading-font);
      border: 2px solid color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-surface));
      background: color-mix(in srgb, var(--accent-gold) 14%, var(--mat-sys-surface)); color: color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-on-surface));
    }
    .focus-num.done { border-color: color-mix(in srgb, var(--mat-sys-primary) 45%, var(--mat-sys-surface)); background: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface)); color: var(--mat-sys-primary); }
    .focus-num.due { border-color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 26%, var(--mat-sys-surface)); }
    .focus-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .focus .meta { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .focus .name { font: 600 19px/1.3 var(--heading-font); }
    .focus .desc { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .focus .when { display: inline-flex; align-items: center; gap: 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .focus .when mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .focus .when.due { color: var(--mat-sys-primary); font-weight: 700; }
    .open { grid-column: 1 / -1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; margin-top: 8px; border-radius: 24px; text-decoration: none; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 15px Inter, sans-serif; }

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
  /** Lição escolhida nas bolinhas: começa na da vez (ou na primeira que já tem aula). */
  protected readonly selected = signal<number | null>(null);
  protected readonly current = computed(() => {
    const list = this.quarter().lessons;
    const n = this.selected() ?? list.find((i) => i.due)?.number ?? list.find((i) => i.lesson)?.number ?? 1;
    return list.find((i) => i.number === n) ?? list[0];
  });
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
