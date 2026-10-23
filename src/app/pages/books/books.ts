import { Component, computed, inject, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BOOK_GROUPS, BOOKS } from '../../core/books';
import { Testament } from '../../core/models';
import { SettingsService } from '../../core/settings.service';

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-books',
  imports: [RouterLink, NgTemplateOutlet, MatIconModule, MatRippleModule],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class BooksPage {
  protected readonly settings = inject(SettingsService);
  protected readonly testament = signal<Testament>('AT');
  protected readonly query = signal('');

  private readonly groupsByTestament = { AT: BOOK_GROUPS('AT'), NT: BOOK_GROUPS('NT') };
  protected readonly groups = computed(() => this.groupsByTestament[this.testament()]);

  protected readonly results = computed(() => {
    const term = normalize(this.query());
    if (!term) return null;
    return BOOKS.filter((b) => normalize(b.name).includes(term) || normalize(b.abbrev).startsWith(term));
  });

  protected progress(bookId: string, chapters: number): number {
    return Math.round((this.settings.readCount(bookId) / chapters) * 100);
  }
}
