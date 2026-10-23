import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IBUC_CLASSES, IBUC_FULL_NAME, IBUC_NAME, IBUC_UNIT, lessonsOfClass } from '../../core/ibuc';

/** Início do módulo IBUC: as turmas por idade e como o módulo ajuda o professor. */
@Component({
  selector: 'app-ibuc',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Apoio ao professor · {{ unit }}</span>
      <h1>{{ name }}</h1>
      <p>{{ fullName }} — {{ unit }}. Curiosidades, contexto histórico e brincadeiras para cada tema, por idade, para ajudar o professor a preparar a aula mesmo com pouco tempo.</p>
    </header>

    <aside class="about card">
      <mat-icon>volunteer_activism</mat-icon>
      <div>
        <strong>Como este módulo ajuda</strong>
        <ul>
          <li><b>Para abrir a aula:</b> uma pergunta ou um objeto que prende a atenção nos primeiros minutos.</li>
          <li><b>Você sabia?</b> Curiosidades do tema, com os versículos.</li>
          <li><b>Contexto histórico</b> para o professor explicar com segurança.</li>
          <li><b>Brincadeiras e dinâmicas</b> com material, tempo e passo a passo.</li>
          <li><b>Perguntas</b> para revisar e uma <b>aplicação</b> para a semana.</li>
        </ul>
        <p class="note">O app não reproduz a revista nem os PDFs do IBUC: use-os normalmente na sala. Aqui fica o apoio para aprofundar o tema.</p>
      </div>
    </aside>

    <h2 class="section-title">Turmas por idade</h2>
    <div class="grid">
      @for (c of classes; track c.id) {
        <a class="card row" matRipple [routerLink]="['/ibuc', c.id]">
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
  protected readonly name = IBUC_NAME;
  protected readonly fullName = IBUC_FULL_NAME;
  protected readonly unit = IBUC_UNIT;
  protected readonly classes = IBUC_CLASSES;

  protected count(classId: string): string {
    const n = lessonsOfClass(classId).filter((l) => !l.example).length;
    return n ? `${n} ${n === 1 ? 'aula' : 'aulas'}` : 'Aulas em preparação';
  }
}
