import { Component, computed, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BOOKS, findBook } from '../core/books';
import { Testament } from '../core/models';
import { SettingsService } from '../core/settings.service';

export interface ChapterSheetData {
  bookId: string;
  chapter: number;
}

@Component({
  selector: 'app-chapter-sheet',
  imports: [MatButtonToggleModule, MatIconModule, MatRippleModule],
  template: `
    <div class="sheet-handle"></div>
    @if (selectedBook(); as book) {
      <div class="header">
        <button class="back" matRipple (click)="selected.set(null)" aria-label="Voltar aos livros">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h2 class="sheet-title">{{ book.name }}</h2>
      </div>
      <div class="chapters">
        @for (c of chapters(); track c) {
          <button matRipple class="chapter" (click)="open(book.id, c)"
                  [class.current]="book.id === data.bookId && c === data.chapter"
                  [class.read]="settings.isRead(book.id, c)">{{ c }}</button>
        }
      </div>
    } @else {
      <div class="header">
        <h2 class="sheet-title">Escolha o livro</h2>
        <mat-button-toggle-group [value]="testament()" (change)="testament.set($event.value)" hideSingleSelectionIndicator>
          <mat-button-toggle value="AT">AT</mat-button-toggle>
          <mat-button-toggle value="NT">NT</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      <div class="books">
        @for (book of books(); track book.id) {
          <button matRipple class="book" [class.current]="book.id === data.bookId" (click)="selectBook(book.id)">
            <span class="dot" [style.background]="book.category.color"></span>
            {{ book.name }}
          </button>
        }
      </div>
    }
  `,
  styles: `
    .header { display: flex; align-items: center; justify-content: space-between; padding-right: 16px; }
    .header .sheet-title { flex: 1; }
    .back { margin-left: 12px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: none; color: inherit; display: grid; place-items: center; cursor: pointer; }
    .back + .sheet-title { margin-left: 4px; }
    .books, .chapters { overflow-y: auto; max-height: calc(85vh - 90px); padding: 0 16px 20px; display: grid; gap: 8px; }
    .books { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    .chapters { grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); }
    .book, .chapter {
      cursor: pointer; color: inherit; font: var(--mat-sys-body-large);
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .book { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; text-align: left; }
    .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
    .chapter { aspect-ratio: 1; border-radius: 50%; font: 500 16px var(--heading-font); }
    .chapter.read { background: var(--mat-sys-primary-container); border-color: transparent; color: var(--mat-sys-on-primary-container); }
    .book.current, .chapter.current { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
  `,
})
export class ChapterSheet {
  protected readonly data = inject<ChapterSheetData>(MAT_BOTTOM_SHEET_DATA);
  protected readonly settings = inject(SettingsService);
  private readonly ref = inject(MatBottomSheetRef<ChapterSheet>);
  private readonly router = inject(Router);

  protected readonly selected = signal<string | null>(this.data.bookId);
  protected readonly testament = signal<Testament>(findBook(this.data.bookId)?.testament ?? 'AT');
  protected readonly selectedBook = computed(() => findBook(this.selected() ?? ''));
  protected readonly books = computed(() => BOOKS.filter((b) => b.testament === this.testament()));
  protected readonly chapters = computed(() =>
    Array.from({ length: this.selectedBook()?.chapters ?? 0 }, (_, i) => i + 1),
  );

  protected selectBook(id: string): void {
    const book = findBook(id);
    if (book?.chapters === 1) {
      this.open(id, 1);
    } else {
      this.selected.set(id);
    }
  }

  protected open(bookId: string, chapter: number): void {
    this.router.navigate(['/ler', bookId, chapter]);
    this.ref.dismiss();
  }
}
