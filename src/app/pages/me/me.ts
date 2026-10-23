import { Component, computed, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BOOKS } from '../../core/books';
import { DevotionalService } from '../../core/devotional.service';
import { FavoritesService } from '../../core/favorites.service';
import { NotesService } from '../../core/notes.service';
import { SettingsService } from '../../core/settings.service';

const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);

/** Meu espaço: o que é da pessoa — devocional, anotações, favoritos, leitura e ajustes. */
@Component({
  selector: 'app-me',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Só seu, guardado neste aparelho</span>
      <h1>Meu espaço</h1>
      <p>O seu devocional, as anotações dos cultos, os versículos favoritos e o progresso da leitura.</p>
    </header>

    <div class="list">
      <a class="card row" matRipple routerLink="/devocional">
        <span class="badge"><mat-icon>self_improvement</mat-icon></span>
        <span class="texts">
          <span class="meta">Devocional</span>
          <span class="name">{{ devotional.todayEntry()?.done ? 'Concluído hoje' : 'Seu momento com Deus hoje' }}</span>
          <span class="desc">Leitura, oração e pedidos de oração.@if (devotional.streak()) { {{ devotional.streak() }} {{ devotional.streak() === 1 ? 'dia seguido' : 'dias seguidos' }}. }</span>
        </span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <a class="card row" matRipple routerLink="/anotacoes">
        <span class="badge"><mat-icon>edit_note</mat-icon></span>
        <span class="texts"><span class="meta">{{ count(notes.notes().length, 'anotação', 'anotações') }}</span><span class="name">Anotações de culto</span><span class="desc">Ceia, domingo, ensino, jovens… com os textos bíblicos de cada culto.</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <a class="card row" matRipple routerLink="/favoritos">
        <span class="badge"><mat-icon>bookmark</mat-icon></span>
        <span class="texts"><span class="meta">{{ count(favorites.favorites().length, 'versículo', 'versículos') }}</span><span class="name">Favoritos e destaques</span><span class="desc">Os versículos que você marcou no leitor.</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <a class="card row" matRipple routerLink="/livros">
        <span class="badge"><mat-icon>auto_stories</mat-icon></span>
        <span class="texts"><span class="meta">{{ settings.totalRead() }} capítulos lidos · {{ progress() }}% da Bíblia</span><span class="name">Minha leitura</span><span class="desc">Os livros da Bíblia e o quanto você já leu de cada um.</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
    </div>

    <h2 class="section-title">App</h2>
    <nav class="chips" aria-label="Sobre o app">
      <a routerLink="/ajustes"><mat-icon>settings</mat-icon>Ajustes</a>
      <a routerLink="/novidades"><mat-icon>celebration</mat-icon>Novidades</a>
      <a routerLink="/creditos"><mat-icon>verified</mat-icon>Créditos e licenças</a>
    </nav>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .chips { flex-wrap: wrap; overflow: visible; margin: 0; padding: 0 4px; }
  `,
})
export class MePage {
  protected readonly devotional = inject(DevotionalService);
  protected readonly notes = inject(NotesService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly settings = inject(SettingsService);
  protected readonly progress = computed(() => ((this.settings.totalRead() / TOTAL_CHAPTERS) * 100).toFixed(1).replace('.', ','));

  protected count(n: number, one: string, many: string): string {
    return n ? `${n} ${n === 1 ? one : many}` : 'Nenhuma ainda'.replace('Nenhuma', one === 'versículo' ? 'Nenhum' : 'Nenhuma');
  }
}
