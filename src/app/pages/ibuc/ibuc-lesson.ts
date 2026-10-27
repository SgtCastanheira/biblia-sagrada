import { Component, computed, effect, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { dueLessonNumber, findProgram, quarterLabel } from '../../core/teaching';
import { BackButton } from '../../shared/back-button';
import { LessonCards } from '../../shared/lesson-cards';
import { SourcesBox } from '../../shared/sources-box';

/** Uma aula (IBUC ou EBD) em cartões: capa, lembretes, abertura, curiosidades, contexto, dinâmicas, perguntas e aplicação. */
@Component({
  selector: 'app-ibuc-lesson',
  imports: [RouterLink, MatIconModule, BackButton, LessonCards, SourcesBox],
  template: `
    @if (lesson(); as l) {
      <div class="article">
        <div class="top"><app-back [fallback]="backLink()" label="Voltar à turma" /></div>
        <span class="overline">
          {{ p().name }} · {{ classNames() }}
          @if (l.number) {
            · <span class="num" [class.due]="due()">Lição {{ l.number }}</span>@if (l.quarter) { do {{ quarterLabel(l.quarter) }} }
          }
        </span>
        <h1 class="title">{{ l.title }}</h1>
        @if (l.example) {
          <p class="example"><mat-icon>visibility</mat-icon> Modelo de aula: é assim que cada tema vai aparecer.</p>
        }
        <app-lesson-cards [lesson]="l" [activitiesTitle]="p().activitiesTitle" />
      </div>
    } @else {
      <p class="empty">Aula não encontrada. <a [routerLink]="p().path">Ver as turmas</a></p>
    }
    <app-sources [topic]="p().sources" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .title { margin-bottom: 4px; }
    .example {
      display: flex; align-items: center; gap: 8px; margin: 0 0 14px; padding: 10px 14px; border-radius: 14px;
      background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); font: 500 14px/1.4 Inter, sans-serif;
    }
    /* A lição da vez: o número pisca para chamar a atenção do professor */
    .num.due { padding: 2px 10px; border-radius: 12px; background: var(--accent-gold); color: #1d1608; font-weight: 700; animation: due-pulse 1.3s ease-in-out infinite; }
    @keyframes due-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
    @media (prefers-reduced-motion: reduce) { .num.due { animation: none; outline: 3px solid var(--accent-gold); outline-offset: 2px; } }
  `,
})
export class IbucLessonPage {
  readonly id = input.required<string>();
  /** Turma de onde a pessoa veio (para voltar a ela). */
  readonly turma = input<string>();
  readonly program = input<string>();
  protected readonly p = computed(() => findProgram(this.program()));
  protected readonly quarterLabel = quarterLabel;

  protected readonly lesson = computed(() => this.p().lessons.find((l) => l.id === this.id()));
  protected readonly classNames = computed(() => this.names(this.lesson()?.classes ?? []));
  protected readonly backLink = computed(() => `${this.p().path}/${this.turma() ?? this.lesson()?.classes[0] ?? ''}`);
  protected readonly due = computed(() => {
    const l = this.lesson();
    return !!l?.quarter && !!l.number && dueLessonNumber(l.quarter, this.p().lessonsPerQuarter) === l.number;
  });

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.lesson()?.title ?? 'Aula'} · ${this.p().name}`));
  }

  private names(ids: string[], sep = ' e '): string {
    return ids.map((id) => this.p().classes.find((c) => c.id === id)?.name).filter(Boolean).join(sep);
  }
}
