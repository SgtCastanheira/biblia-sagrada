import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { findProgram, lessonsOfClass } from '../../core/teaching';

/** Início de um módulo de apoio ao professor (IBUC ou EBD): as turmas e como o módulo ajuda. */
@Component({
  selector: 'app-ibuc',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">{{ p().overline }}</span>
      <h1>{{ p().name }}</h1>
      <p>{{ p().subtitle }}. {{ p().intro }}</p>
    </header>

    <aside class="about card">
      <mat-icon>volunteer_activism</mat-icon>
      <div>
        <strong>Como este módulo ajuda</strong>
        <ul>
          <li><b>Para abrir a aula:</b> uma pergunta ou um objeto que prende a atenção nos primeiros minutos.</li>
          <li><b>Você sabia?</b> Curiosidades do tema, com os versículos.</li>
          <li><b>Contexto histórico</b> para o professor explicar com segurança.</li>
          <li><b>{{ p().activitiesTitle }}</b> com material, tempo e passo a passo.</li>
          <li><b>Perguntas</b> para revisar e uma <b>aplicação</b> para a semana.</li>
        </ul>
        <p class="note">{{ p().disclaimer }}</p>
      </div>
    </aside>

    <h2 class="section-title">Turmas</h2>
    <div class="grid">
      @for (c of p().classes; track c.id) {
        <a class="card row" matRipple [routerLink]="[p().path, c.id]">
          <span class="badge"><mat-icon>{{ c.icon }}</mat-icon></span>
          <span class="texts">
            <span class="meta">{{ c.ages }}</span>
            <span class="name">{{ c.name }}</span>
            <span class="desc">{{ count(c.id) }}</span>
          </span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      }
    </div>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .about { display: flex; gap: 14px; padding: 16px 18px; margin-bottom: 8px; }
    .about > mat-icon { flex: none; color: var(--accent-gold); }
    .about strong { font: 600 17px var(--heading-font); }
    .about ul { margin: 8px 0; padding-left: 18px; font: 400 15px/1.6 var(--reading-font); }
    .about li { margin-bottom: 4px; }
    .note { margin: 6px 0 0; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class IbucPage {
  /** Vem dos dados da rota ("ibuc" ou "ebd"). */
  readonly program = input<string>();
  protected readonly p = computed(() => findProgram(this.program()));

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.p().name} · Bíblia Sagrada`));
  }

  protected count(classId: string): string {
    const n = lessonsOfClass(this.p(), classId).filter((l) => !l.example).length;
    return n ? `${n} ${n === 1 ? 'aula' : 'aulas'}` : 'Aulas em preparação';
  }
}
