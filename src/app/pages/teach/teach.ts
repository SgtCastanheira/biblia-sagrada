import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { formatLong } from '../../core/dates';
import { EbdService } from '../../core/ebd.service';
import { SermonsService } from '../../core/sermons.service';
import { PROGRAMS } from '../../core/teaching';

/** Ensino: tudo para quem ensina e prega — EBD, apoio ao professor, IBUC e sermões. */
@Component({
  selector: 'app-teach',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Para quem ensina e prega</span>
      <h1>Ensino</h1>
      <p>A Escola Bíblica Dominical, o apoio ao professor por idade, o IBUC e os seus sermões, num só lugar.</p>
    </header>

    <h2 class="section-title"><mat-icon>school</mat-icon> Escola Bíblica Dominical</h2>
    <div class="list">
      @if (ebd.nextLesson(); as lesson) {
        <a class="card row" matRipple [routerLink]="['/ebd/licao', lesson.number]">
          <span class="badge"><mat-icon>event</mat-icon></span>
          <span class="texts"><span class="meta">Próxima aula · {{ formatLong(lesson.date) }}</span><span class="name">Lição {{ lesson.number }}@if (lesson.title) {: {{ lesson.title }}}</span></span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      }
      <a class="card row" matRipple routerLink="/ebd">
        <span class="badge"><mat-icon>menu_book</mat-icon></span>
        <span class="texts"><span class="name">Minhas aulas da revista</span><span class="desc">As 13 lições do trimestre, com os textos, a leitura diária e as suas anotações.</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <div class="card group">
        <a class="row head" matRipple routerLink="/ebd/apoio">
          <span class="badge"><mat-icon>volunteer_activism</mat-icon></span>
          <span class="texts"><span class="name">Apoio ao professor</span><span class="desc">Curiosidades, contexto, dinâmicas e perguntas para cada lição.</span></span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
        <nav class="chips" aria-label="Turmas da EBD">
          @for (c of ebdClasses; track c.id) { <a [routerLink]="['/ebd/apoio', c.id]"><mat-icon>{{ c.icon }}</mat-icon>{{ c.name }}</a> }
        </nav>
      </div>
    </div>

    <h2 class="section-title"><mat-icon>child_care</mat-icon> IBUC</h2>
    <div class="card group">
      <a class="row head" matRipple routerLink="/ibuc">
        <span class="badge"><mat-icon>child_care</mat-icon></span>
        <span class="texts"><span class="name">Instituto Bíblico Único Caminho</span><span class="desc">Apoio ao professor por idade, do Maternal aos Juvenis.</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <nav class="chips" aria-label="Turmas do IBUC">
        @for (c of ibucClasses; track c.id) { <a [routerLink]="['/ibuc', c.id]">{{ c.name }}</a> }
      </nav>
    </div>

    <h2 class="section-title"><mat-icon>campaign</mat-icon> Pregação</h2>
    <a class="card row" matRipple routerLink="/sermoes">
      <span class="badge"><mat-icon>edit_document</mat-icon></span>
      <span class="texts"><span class="name">Meus sermões</span><span class="desc">Escreva por modelos, organize os tópicos e pregue no modo púlpito.@if (sermons.sermons().length) { {{ sermons.sermons().length }} {{ sermons.sermons().length === 1 ? 'sermão salvo' : 'sermões salvos' }}. }</span></span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .section-title mat-icon { color: var(--accent-gold); }
    .group { padding-bottom: 12px; }
    .group .head { text-decoration: none; color: inherit; position: relative; overflow: hidden; border-radius: 20px; }
    .group .chips { margin: 0; padding: 0 16px; flex-wrap: wrap; overflow: visible; }
    .group .chips a { height: 36px; font-size: 14px; }
    .group .chips mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `,
})
export class TeachPage {
  protected readonly ebd = inject(EbdService);
  protected readonly sermons = inject(SermonsService);
  protected readonly formatLong = formatLong;
  protected readonly ebdClasses = PROGRAMS.ebd.classes;
  protected readonly ibucClasses = PROGRAMS.ibuc.classes;
}
