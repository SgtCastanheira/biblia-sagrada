import { Component, computed, effect, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findIbucClass, IBUC_NAME, lessonsOfClass } from '../../core/ibuc';
import { BackButton } from '../../shared/back-button';

/** Uma turma do IBUC: como ensinar nessa idade e as aulas. */
@Component({
  selector: 'app-ibuc-class',
  imports: [RouterLink, MatIconModule, MatRippleModule, BackButton],
  template: `
    @if (group(); as c) {
      <div class="top"><app-back fallback="/ibuc" label="Voltar ao IBUC" /></div>
      <header class="page-head">
        <span class="overline">{{ ibuc }} · {{ c.ages }}</span>
        <h1>{{ c.name }}</h1>
      </header>

      <aside class="tips card">
        <h2><mat-icon>tips_and_updates</mat-icon> Como ensinar nesta idade</h2>
        <ul>
          @for (t of c.tips; track t) { <li>{{ t }}</li> }
        </ul>
      </aside>

      <h2 class="section-title">Aulas</h2>
      @if (real().length) {
        <div class="list">
          @for (l of real(); track l.id) {
            <a class="card row" matRipple [routerLink]="['/ibuc/aula', l.id]" [queryParams]="{ turma: c.id }">
              <span class="badge"><mat-icon>school</mat-icon></span>
              <span class="texts"><span class="meta">{{ l.refs }}</span><span class="name">{{ l.title }}</span><span class="desc">{{ l.theme }}</span></span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      } @else {
        <p class="empty"><mat-icon>hourglass_top</mat-icon> As aulas desta turma estão em preparação e vão aparecer aqui, tema por tema.</p>
      }

      @if (examples().length) {
        <h2 class="section-title">Modelo de aula</h2>
        @for (l of examples(); track l.id) {
          <a class="card row" matRipple [routerLink]="['/ibuc/aula', l.id]" [queryParams]="{ turma: c.id }">
            <span class="badge example"><mat-icon>visibility</mat-icon></span>
            <span class="texts"><span class="meta">Exemplo · {{ l.refs }}</span><span class="name">{{ l.title }}</span><span class="desc">Veja como cada aula vai aparecer.</span></span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      }
    } @else {
      <p class="empty">Turma não encontrada. <a routerLink="/ibuc">Ver as turmas</a></p>
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
  `,
})
export class IbucClassPage {
  readonly turma = input.required<string>();
  protected readonly ibuc = IBUC_NAME;
  protected readonly group = computed(() => findIbucClass(this.turma()));
  protected readonly real = computed(() => lessonsOfClass(this.turma()).filter((l) => !l.example));
  protected readonly examples = computed(() => lessonsOfClass(this.turma()).filter((l) => l.example));

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.group()?.name ?? 'Turma'} · IBUC`));
  }
}
