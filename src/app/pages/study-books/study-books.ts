import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BOOKS } from '../../core/books';
import { Testament } from '../../core/models';
import { StudyIndexService } from '../../core/study-index';
import { BookMaterialsView } from '../../shared/book-materials';

/** Estudo livro por livro, de Gênesis a Apocalipse. */
@Component({
  selector: 'app-study-books',
  imports: [RouterLink, MatIconModule, BookMaterialsView],
  template: `
    <header class="page-head">
      <span class="overline">Estudo</span>
      <h1>Livro por livro</h1>
      <p>Todo o material de estudo do app na ordem da Bíblia, de Gênesis a Apocalipse: mapas, aulas, profecias, personagens, curiosidades e notas de cada livro.</p>
    </header>

    <nav class="chips" role="tablist">
      <button role="tab" [class.active]="testament() === 'AT'" (click)="testament.set('AT')">Antigo Testamento</button>
      <button role="tab" [class.active]="testament() === 'NT'" (click)="testament.set('NT')">Novo Testamento</button>
    </nav>

    <div class="books">
      @for (b of books(); track b.id) {
        <details [open]="false">
          <summary>
            <span class="abbr" [style.--c]="b.category.color">{{ b.abbrev }}</span>
            <span class="b-name">{{ b.name }}<small>{{ b.category.name }}</small></span>
            @if (count(b.id); as n) { <span class="count">{{ n }}</span> }
            <mat-icon class="chev">expand_more</mat-icon>
          </summary>
          <div class="body">
            <app-book-materials [bookId]="b.id" />
            <a class="open" [routerLink]="['/livro', b.id]">Introdução e capítulos de {{ b.name }} <mat-icon>arrow_forward</mat-icon></a>
          </div>
        </details>
      }
    </div>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .books { display: flex; flex-direction: column; gap: 8px; }
    details {
      border-radius: 16px; overflow: hidden; background: var(--mat-sys-surface-container-low);
      border: 1px solid var(--mat-sys-outline-variant);
    }
    details[open] .chev { transform: rotate(180deg); }
    summary { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 14px; cursor: pointer; list-style: none; }
    summary::-webkit-details-marker { display: none; }
    .abbr {
      flex: none; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center;
      font: 600 14px Inter, sans-serif; color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent);
    }
    .b-name { flex: 1; display: flex; flex-direction: column; font: 600 17px/1.25 var(--heading-font); }
    .b-name small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .count {
      min-width: 28px; height: 28px; padding: 0 8px; border-radius: 14px; display: grid; place-items: center;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); font: 600 13px Inter, sans-serif;
    }
    .chev { color: var(--mat-sys-on-surface-variant); transition: transform .2s; }
    .body { padding: 4px 14px 14px; border-top: 1px solid var(--mat-sys-outline-variant); padding-top: 14px; }
    .open { display: inline-flex; align-items: center; gap: 4px; min-height: 40px; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }
    .open mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `,
})
export class StudyBooksPage {
  private readonly index = toSignal(inject(StudyIndexService).byBook);
  protected readonly testament = signal<Testament>('AT');
  protected readonly books = computed(() => BOOKS.filter((b) => b.testament === this.testament()));

  protected count(bookId: string): number {
    return this.index()?.get(bookId)?.total ?? 0;
  }
}
