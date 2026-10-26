import { Component, computed, effect, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ACTIVITY_ICONS, findProgram, IbucActivity, quarterLabel } from '../../core/teaching';
import { BackButton } from '../../shared/back-button';
import { PassageView } from '../../shared/passage-view';
import { RichText } from '../../shared/rich-text';
import { Sheets } from '../../shared/sheets';
import { SourcesBox } from '../../shared/sources-box';

/** Uma aula (IBUC ou EBD): abertura, curiosidades, contexto, dinâmicas, perguntas e aplicação. */
@Component({
  selector: 'app-ibuc-lesson',
  imports: [RouterLink, MatIconModule, BackButton, PassageView, RichText, SourcesBox],
  template: `
    @if (lesson(); as l) {
      <div class="article">
        <div class="top"><app-back [fallback]="backLink()" label="Voltar à turma" /></div>
        <span class="overline">{{ p().name }} · {{ classNames() }}@if (l.number) { · Lição {{ l.number }}@if (l.quarter) { do {{ quarterLabel(l.quarter) }} } }</span>
        <h1 class="title">{{ l.title }}</h1>
        <p class="lead">{{ l.theme }}</p>
        @if (l.example) {
          <p class="example"><mat-icon>visibility</mat-icon> Modelo de aula: é assim que cada tema vai aparecer.</p>
        }

        <div class="chips-row">
          <button class="chip" (click)="openRef(l.refs)"><mat-icon>menu_book</mat-icon>{{ l.refs }}</button>
          <button class="chip" (click)="openRef(l.memoryVerse)"><mat-icon>psychology_alt</mat-icon>Para decorar: {{ l.memoryVerse }}</button>
        </div>

        <h2 class="section-title"><mat-icon>campaign</mat-icon> Para abrir a aula</h2>
        <app-rich-text class="box" [source]="l.opening" />

        <h2 class="section-title"><mat-icon>lightbulb</mat-icon> Você sabia?</h2>
        <div class="curiosities">
          @for (c of l.curiosities; track c.title) {
            <article class="curiosity"><h3>{{ c.title }}</h3><app-rich-text [source]="c.text" /></article>
          }
        </div>

        <h2 class="section-title"><mat-icon>history_edu</mat-icon> Contexto histórico</h2>
        <app-rich-text [source]="l.context" />

        <h2 class="section-title"><mat-icon>sports_esports</mat-icon> {{ p().activitiesTitle }}</h2>
        @for (a of l.activities; track a.name) {
          <article class="activity">
            <header>
              <mat-icon>{{ icons[a.kind] }}</mat-icon>
              <span><small>{{ a.kind }} · {{ a.time }}@if (a.classes?.length) { · {{ classesOf(a) }} }</small>{{ a.name }}</span>
            </header>
            <p class="material"><b>Material:</b> {{ a.material }}</p>
            <app-rich-text [source]="steps(a)" />
          </article>
        }

        <h2 class="section-title"><mat-icon>quiz</mat-icon> Perguntas para revisar</h2>
        <ol class="questions">
          @for (q of l.questions; track q.q) {
            <li>{{ q.q }} @if (q.ref) { <button class="inline-ref" (click)="openRef(q.ref)">{{ q.ref }}</button> }</li>
          }
        </ol>

        <h2 class="section-title"><mat-icon>favorite</mat-icon> Para a vida</h2>
        <app-rich-text class="box" [source]="l.application" />

        <h2 class="section-title"><mat-icon>menu_book</mat-icon> Versículo para decorar</h2>
        <app-passage-view [refs]="l.memoryVerse" />
      </div>
    } @else {
      <p class="empty">Aula não encontrada. <a [routerLink]="p().path">Ver as turmas</a></p>
    }
    <app-sources [topic]="p().sources" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .section-title mat-icon { color: var(--accent-gold); }
    .example {
      display: flex; align-items: center; gap: 8px; margin: 0 0 14px; padding: 10px 14px; border-radius: 14px;
      background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); font: 500 14px/1.4 Inter, sans-serif;
    }
    .chips-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer;
      background: none; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
    .chip mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .box { display: block; padding: 4px 16px; border-radius: 16px; background: var(--mat-sys-surface-container-low); border-left: 3px solid var(--accent-gold); }
    .curiosities { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); }
    .curiosity { padding: 4px 16px 6px; border-radius: 16px; background: var(--mat-sys-surface-container); }
    .curiosity h3 { margin: 12px 0 0; font: 600 17px var(--heading-font); }
    .activity { margin-bottom: 12px; padding: 12px 16px 4px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); }
    .activity header { display: flex; align-items: center; gap: 12px; }
    .activity header mat-icon { color: var(--accent-gold); }
    .activity header span { display: flex; flex-direction: column; font: 600 17px/1.3 var(--heading-font); }
    .activity small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .6px; color: var(--mat-sys-on-surface-variant); }
    .material { margin: 10px 0 0; font: 400 15px/1.5 var(--reading-font); }
    .questions { padding-left: 22px; font: 400 16px/1.6 var(--reading-font); }
    .questions li { margin-bottom: 6px; }
    .inline-ref {
      display: inline-flex; align-items: center; min-height: 40px; padding: 0 4px; border: 0; background: none; cursor: pointer;
      color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: underline; text-underline-offset: 3px;
    }
  `,
})
export class IbucLessonPage {
  readonly id = input.required<string>();
  /** Turma de onde a pessoa veio (para voltar a ela). */
  readonly turma = input<string>();
  private readonly sheets = inject(Sheets);
  readonly program = input<string>();
  protected readonly p = computed(() => findProgram(this.program()));
  protected readonly icons = ACTIVITY_ICONS;
  protected readonly quarterLabel = quarterLabel;

  protected readonly lesson = computed(() => this.p().lessons.find((l) => l.id === this.id()));
  protected readonly classNames = computed(() => this.names(this.lesson()?.classes ?? []));
  protected readonly backLink = computed(() => `${this.p().path}/${this.turma() ?? this.lesson()?.classes[0] ?? ''}`);

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.lesson()?.title ?? 'Aula'} · ${this.p().name}`));
  }

  protected classesOf(a: IbucActivity): string {
    return this.names(a.classes ?? [], ', ');
  }

  private names(ids: string[], sep = ' e '): string {
    return ids.map((id) => this.p().classes.find((c) => c.id === id)?.name).filter(Boolean).join(sep);
  }

  /** Passos da atividade como lista numerada (com as referências clicáveis). */
  protected steps(a: IbucActivity): string {
    return a.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
