import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { findBook } from '../../core/books';
import { FavoritesService, HIGHLIGHT_COLORS } from '../../core/favorites.service';
import { FavoriteVerse, HighlightColor } from '../../core/models';
import { findVersion } from '../../core/versions';
import { NotebookTabs } from '../../shared/notebook-tabs';
import { Sheets } from '../../shared/sheets';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, MatRippleModule, NotebookTabs],
  template: `
    <span class="overline">Meu caderno</span>
    <h1>Favoritos</h1>
    <app-notebook-tabs />

    @if (favorites.favorites().length) {
      <div class="filters">
        <button class="filter" [class.active]="!color()" (click)="color.set(null)">
          Todos <span>{{ favorites.favorites().length }}</span>
        </button>
        @for (c of colors; track c.id) {
          @if (countOf(c.id); as n) {
            <button class="filter" [class.active]="color() === c.id" (click)="color.set(c.id)">
              <i [style.background]="'var(--hl-' + c.id + ')'"></i>{{ c.label }} <span>{{ n }}</span>
            </button>
          }
        }
      </div>
    }

    <div class="list">
      @for (fav of filtered(); track fav.versionId + fav.bookId + fav.chapter + fav.verse) {
        <article class="fav" [style.--hl]="'var(--hl-' + fav.color + ')'">
          <a class="body" matRipple [routerLink]="['/ler', fav.bookId, fav.chapter]" [fragment]="'v' + fav.verse">
            <p class="text reading-font"><span>{{ fav.text }}</span></p>
            <p class="ref">{{ bookName(fav.bookId) }} {{ fav.chapter }}:{{ fav.verse }}</p>
            <p class="meta">{{ versionAbbrev(fav.versionId) }} · salvo em {{ fav.savedAt | date: "d 'de' MMM" }}</p>
          </a>
          <button mat-icon-button class="more" (click)="edit(fav)" aria-label="Opções"><mat-icon>more_vert</mat-icon></button>
        </article>
      } @empty {
        <div class="empty">
          <span class="icon"><mat-icon>bookmark_add</mat-icon></span>
          <h2>Nenhum favorito ainda</h2>
          <p>Durante a leitura, toque em qualquer versículo para destacá-lo com uma cor e salvá-lo aqui.</p>
          <a mat-flat-button routerLink="/livros">Começar a ler</a>
        </div>
      }
    </div>
  `,
  styles: `
    .overline { display: block; margin-top: 8px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    h1 { font: 600 32px var(--heading-font); letter-spacing: -.4px; margin: 4px 0 14px; }
    app-notebook-tabs { display: block; margin-bottom: 16px; }
    .filters { display: flex; gap: 8px; overflow-x: auto; margin: 0 -16px 16px; padding: 0 16px 4px; scrollbar-width: none; }
    .filter {
      flex: none; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 18px; background: none; color: inherit; font: 500 14px Inter, sans-serif;
    }
    .filter span { font-size: 13px; opacity: .65; }
    .filter i { width: 14px; height: 14px; border-radius: 50%; }
    .filter.active { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); border-color: transparent; }
    .list { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); }
    .fav {
      position: relative; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-soft);
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    
    .body { display: block; padding: 18px 48px 16px 20px; color: inherit; text-decoration: none; position: relative; }
    .text { margin: 0 0 12px; font-size: 16px; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
    .text span { background: linear-gradient(transparent 55%, color-mix(in srgb, var(--hl) 85%, transparent) 55%); box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .ref { margin: 0; font: 600 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .meta { margin: 2px 0 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .more { position: absolute; top: 6px; right: 4px; }
    .empty { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 16px; }
    .empty .icon { width: 88px; height: 88px; border-radius: 50%; display: grid; place-items: center; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); }
    .empty .icon mat-icon { font-size: 38px; width: 38px; height: 38px; }
    .empty h2 { font: 600 22px var(--heading-font); margin: 20px 0 6px; }
    .empty p { max-width: 320px; color: var(--mat-sys-on-surface-variant); margin: 0 0 20px; }
  `,
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesService);
  private readonly sheets = inject(Sheets);
  protected readonly colors = HIGHLIGHT_COLORS;
  protected readonly color = signal<HighlightColor | null>(null);

  protected readonly filtered = computed(() => {
    const color = this.color();
    return color ? this.favorites.favorites().filter((f) => f.color === color) : this.favorites.favorites();
  });

  protected countOf(color: HighlightColor): number {
    return this.favorites.favorites().filter((f) => f.color === color).length;
  }

  protected bookName = (id: string) => findBook(id)?.name ?? id;
  protected versionAbbrev = (id: string) => findVersion(id)?.abbrev ?? id;

  protected edit(fav: FavoriteVerse): void {
    this.sheets.verseActions({
      ref: fav,
      reference: `${this.bookName(fav.bookId)} ${fav.chapter}:${fav.verse}`,
      versionAbbrev: this.versionAbbrev(fav.versionId),
      text: fav.text,
    });
  }
}
