import { Component, computed, effect, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ACTIVITY_ICONS, dueLessonNumber, IbucLesson, lessonDate, lessonDateLabel } from '../core/teaching';
import { PassageView } from './passage-view';
import { RichText } from './rich-text';
import { Sheets } from './sheets';

type CardKind = 'capa' | 'lembretes' | 'abertura' | 'curiosidade' | 'contexto' | 'atividade' | 'perguntas' | 'vida' | 'versiculo' | 'aprofundar';

interface LessonCard {
  kind: CardKind;
  label: string;
  icon: string;
  /** Posição do item dentro da lição (curiosidade ou atividade). */
  index?: number;
}

/**
 * A aula em "colinhas": cartões que se deslizam de lado, como os stories. Capa, lembretes, abertura, uma curiosidade
 * por cartão, contexto, uma atividade por cartão, perguntas, aplicação, versículo e aprofundamento.
 */
@Component({
  selector: 'app-lesson-cards',
  imports: [MatIconModule, RichText, PassageView],
  template: `
    <div class="segments" role="tablist" aria-label="Cartões da aula">
      @for (c of cards(); track $index) {
        <button type="button" role="tab" [class.done]="$index < at()" [class.now]="$index === at()" [attr.aria-selected]="$index === at()"
          [attr.aria-label]="'Cartão ' + ($index + 1) + ': ' + c.label" (click)="go($index)"><span></span></button>
      }
    </div>
    <div class="stage">
      <button type="button" class="arrow prev" (click)="go(at() - 1)" [disabled]="at() === 0" aria-label="Cartão anterior"><mat-icon>chevron_left</mat-icon></button>
      <div class="deck" #deck tabindex="0" role="group" aria-roledescription="carrossel" aria-label="Aula em cartões: deslize para o lado"
        (scroll)="onScroll()" (keydown.arrowright)="go(at() + 1)" (keydown.arrowleft)="go(at() - 1)">
        @for (c of cards(); track $index) {
          <section class="card" [class]="'card ' + c.kind" [attr.aria-label]="c.label">
            @switch (c.kind) {
              @case ('capa') {
                <div class="cover">
                  <span class="tag"><mat-icon>{{ c.icon }}</mat-icon> {{ lesson().example ? 'Modelo de aula' : 'Lição ' + (lesson().number ?? '') }}</span>
                  <h2>{{ lesson().title }}</h2>
                  <p class="theme">{{ lesson().theme }}</p>
                  @if (date(); as d) {
                    <p class="when" [class.due]="due()"><mat-icon>event</mat-icon> {{ d }}@if (due()) { · é a próxima aula }</p>
                  }
                  <div class="chips">
                    <button type="button" (click)="openRef(lesson().refs)"><mat-icon>menu_book</mat-icon>{{ lesson().refs }}</button>
                    <button type="button" (click)="openRef(lesson().memoryVerse)"><mat-icon>psychology_alt</mat-icon>Decorar: {{ lesson().memoryVerse }}</button>
                  </div>
                  <p class="swipe"><mat-icon>swipe</mat-icon> Deslize para o lado</p>
                </div>
              }
              @case ('lembretes') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Lembretes para você, professor(a)</h2>
                <ul class="checks">
                  @for (r of lesson().reminders; track r) { <li><app-rich-text [source]="r" /></li> }
                </ul>
              }
              @case ('abertura') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Para abrir a aula</h2>
                <app-rich-text [source]="lesson().opening" />
              }
              @case ('curiosidade') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Você sabia?</h2>
                <h3>{{ lesson().curiosities[c.index!].title }}</h3>
                <app-rich-text [source]="lesson().curiosities[c.index!].text" />
              }
              @case ('contexto') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Contexto histórico</h2>
                <app-rich-text [source]="lesson().context" />
              }
              @case ('atividade') {
                @let a = lesson().activities[c.index!];
                <h2><mat-icon>{{ icons[a.kind] }}</mat-icon> {{ activitiesTitle() }}</h2>
                <p class="kind">{{ a.kind }} · {{ a.time }}</p>
                <h3>{{ a.name }}</h3>
                <p class="material"><b>Material:</b> {{ a.material }}</p>
                <app-rich-text [source]="steps(c.index!)" />
              }
              @case ('perguntas') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Perguntas para revisar</h2>
                <ol class="questions">
                  @for (q of lesson().questions; track q.q) {
                    <li>{{ q.q }} @if (q.ref) { <button type="button" class="inline-ref" (click)="openRef(q.ref)">{{ q.ref }}</button> }</li>
                  }
                </ol>
              }
              @case ('vida') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Para a vida</h2>
                <app-rich-text [source]="lesson().application" />
              }
              @case ('versiculo') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Versículo para decorar</h2>
                <app-passage-view [refs]="lesson().memoryVerse" />
              }
              @case ('aprofundar') {
                <h2><mat-icon>{{ c.icon }}</mat-icon> Para aprofundar no app</h2>
                <app-rich-text [source]="lesson().deepen!" />
              }
            }
          </section>
        }
      </div>
      <button type="button" class="arrow next" (click)="go(at() + 1)" [disabled]="at() === cards().length - 1" aria-label="Próximo cartão"><mat-icon>chevron_right</mat-icon></button>
    </div>
    <p class="count" aria-live="polite">Cartão {{ at() + 1 }} de {{ cards().length }} · {{ cards()[at()].label }}</p>
  `,
  styles: `
    :host { display: block; margin: 12px 0 4px; }
    .segments { display: flex; gap: 4px; margin: 0 0 10px; }
    .segments button { flex: 1; height: 24px; padding: 10px 0; border: 0; background: none; cursor: pointer; }
    .segments button span { display: block; height: 4px; border-radius: 2px; background: var(--mat-sys-outline-variant); transition: background .2s; }
    .segments button.done span { background: var(--accent-gold); opacity: .55; }
    .segments button.now span { background: var(--accent-gold); }
    .stage { position: relative; }
    .deck { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; border-radius: 26px; outline: none; }
    .deck::-webkit-scrollbar { display: none; }
    .deck:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
    .card {
      flex: 0 0 100%; box-sizing: border-box; scroll-snap-align: center; scroll-snap-stop: always; min-height: min(70vh, 560px); max-height: 70vh; overflow-y: auto;
      padding: 20px 20px 24px; border-radius: 26px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 600 20px/1.25 var(--heading-font); }
    .card h2 mat-icon { color: var(--accent-gold); flex: none; }
    .card h3 { margin: 0 0 8px; font: 600 19px/1.3 var(--heading-font); }
    .card app-rich-text { display: block; font-size: 17px; }
    .kind { margin: 0 0 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    .material { margin: 0 0 10px; padding: 8px 12px; border-radius: 12px; background: var(--mat-sys-surface-container); font: 400 15px/1.45 var(--reading-font); }
    .checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .checks li { position: relative; padding-left: 28px; }
    .checks li::before { content: ''; position: absolute; left: 3px; top: .45em; width: 13px; height: 13px; border-radius: 4px; border: 2px solid var(--accent-gold); }
    .questions { margin: 0; padding-left: 22px; font: 400 17px/1.55 var(--reading-font); }
    .questions li { margin-bottom: 10px; }
    .inline-ref { display: inline-flex; align-items: center; min-height: 40px; padding: 0 4px; border: 0; background: none; cursor: pointer; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: underline; text-underline-offset: 3px; }
    .card.capa { padding: 0; border: 0; background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .26), transparent 60%), linear-gradient(165deg, #2f4a3d, #1b2b23 80%); color: #fbf4e6; }
    .cover { display: flex; flex-direction: column; gap: 10px; min-height: 100%; box-sizing: border-box; padding: 22px 20px 20px; }
    .cover .tag { display: inline-flex; align-items: center; gap: 6px; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #e8c085; }
    .cover h2 { display: block; margin: 4px 0 0; font: 600 28px/1.15 var(--heading-font); color: #fff8ec; }
    .cover .theme { margin: 0; font: 400 16px/1.5 var(--reading-font); color: #eadfcb; }
    .cover .when { display: inline-flex; align-items: center; gap: 6px; margin: 4px 0 0; font: 600 15px Inter, sans-serif; color: #f3e3c3; }
    .cover .when.due { color: #1d1608; background: var(--accent-gold); width: fit-content; padding: 6px 12px; border-radius: 14px; animation: due-pulse 1.3s ease-in-out infinite; }
    .cover .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
    .cover .chips button { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 22px; cursor: pointer; border: 1px solid rgba(251, 244, 230, .4); background: rgba(255, 255, 255, .08); color: #fff8ec; font: 600 14px Inter, sans-serif; }
    .cover .swipe { display: flex; align-items: center; gap: 6px; margin: 4px 0 0; font: 500 13px Inter, sans-serif; color: #d8cdb7; }
    @keyframes due-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
    @media (prefers-reduced-motion: reduce) { .cover .when.due { animation: none; } .deck { scroll-behavior: auto; } }
    .arrow { display: none; }
    .count { margin: 8px 0 0; text-align: center; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    @media (min-width: 840px) {
      :host { max-width: 640px; margin-left: auto; margin-right: auto; }
      .arrow { position: absolute; top: 50%; z-index: 2; display: grid; place-items: center; width: 48px; height: 48px; margin-top: -24px; border-radius: 50%; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-primary); cursor: pointer; }
      .arrow.prev { left: -64px; }
      .arrow.next { right: -64px; }
      .arrow:disabled { opacity: .35; cursor: default; }
    }
  `,
})
export class LessonCards {
  readonly lesson = input.required<IbucLesson>();
  /** Título da seção das atividades do programa (ex.: "Dinâmicas e brincadeiras"). */
  readonly activitiesTitle = input('Dinâmicas e brincadeiras');

  private readonly sheets = inject(Sheets);
  private readonly deck = viewChild.required<ElementRef<HTMLElement>>('deck');
  protected readonly icons = ACTIVITY_ICONS;
  protected readonly at = signal(0);

  protected readonly cards = computed<LessonCard[]>(() => {
    const l = this.lesson();
    const out: LessonCard[] = [{ kind: 'capa', label: 'Capa', icon: 'school' }];
    if (l.reminders?.length) out.push({ kind: 'lembretes', label: 'Lembretes', icon: 'checklist' });
    out.push({ kind: 'abertura', label: 'Abertura', icon: 'campaign' });
    l.curiosities.forEach((c, index) => out.push({ kind: 'curiosidade', label: `Você sabia: ${c.title}`, icon: 'lightbulb', index }));
    out.push({ kind: 'contexto', label: 'Contexto histórico', icon: 'history_edu' });
    l.activities.forEach((a, index) => out.push({ kind: 'atividade', label: a.name, icon: 'sports_esports', index }));
    out.push({ kind: 'perguntas', label: 'Perguntas', icon: 'quiz' });
    out.push({ kind: 'vida', label: 'Para a vida', icon: 'favorite' });
    out.push({ kind: 'versiculo', label: 'Versículo para decorar', icon: 'menu_book' });
    if (l.deepen) out.push({ kind: 'aprofundar', label: 'Para aprofundar', icon: 'travel_explore' });
    return out;
  });

  protected readonly date = computed(() => {
    const l = this.lesson();
    if (!l.quarter || !l.number) return null;
    const label = lessonDateLabel(lessonDate(l.quarter, l.number));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });
  protected readonly due = computed(() => {
    const l = this.lesson();
    return !!l.quarter && !!l.number && dueLessonNumber(l.quarter, 13) === l.number;
  });

  constructor() {
    // Uma aula nova começa sempre na capa
    effect(() => {
      this.lesson();
      this.at.set(0);
      queueMicrotask(() => (this.deck().nativeElement.scrollLeft = 0));
    });
  }

  protected steps(index: number): string {
    return this.lesson().activities[index].steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  }

  protected go(i: number): void {
    const n = this.cards().length;
    const target = Math.max(0, Math.min(n - 1, i));
    const el = this.deck().nativeElement;
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: target * el.clientWidth, behavior: calm ? 'auto' : 'smooth' });
    this.at.set(target);
  }

  protected onScroll(): void {
    const el = this.deck().nativeElement;
    if (el.clientWidth) this.at.set(Math.round(el.scrollLeft / el.clientWidth));
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
