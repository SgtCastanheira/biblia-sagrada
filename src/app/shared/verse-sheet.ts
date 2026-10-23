import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrossReferencesService, LINK_TYPES } from '../core/cross-references.service';
import { FavoritesService, HIGHLIGHT_COLORS } from '../core/favorites.service';
import { HighlightColor, VerseRef } from '../core/models';
import { PassageSheet } from './passage-sheet';

export interface VerseSheetData {
  ref: VerseRef;
  reference: string;
  versionAbbrev: string;
  text: string;
}

@Component({
  selector: 'app-verse-sheet',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="sheet-handle"></div>
    <div class="content">
      <p class="reference">{{ data.reference }} <span>{{ data.versionAbbrev }}</span></p>
      <p class="text reading-font">{{ data.text }}</p>

      <p class="label">Destacar</p>
      <div class="colors">
        @for (c of colors; track c.id) {
          <button class="swatch" [style.background]="'var(--hl-' + c.id + ')'" [class.active]="favorite()?.color === c.id"
                  [attr.aria-label]="'Destacar em ' + c.label" (click)="highlight(c.id)">
            @if (favorite()?.color === c.id) {
              <mat-icon>check</mat-icon>
            }
          </button>
        }
        @if (favorite()) {
          <button class="swatch clear" aria-label="Remover destaque" (click)="remove()">
            <mat-icon>format_color_reset</mat-icon>
          </button>
        }
      </div>

      <div class="actions">
        <button mat-stroked-button (click)="copy()"><mat-icon>content_copy</mat-icon> Copiar</button>
        <button mat-flat-button (click)="share()"><mat-icon>share</mat-icon> Compartilhar</button>
      </div>

      @if (links()?.length) {
        <p class="label xref-title">Referências cruzadas</p>
        <ul class="xrefs">
          @for (l of visibleLinks(); track l.refs) {
            <li>
              <button class="xref" [class.curated]="l.type !== 'relacionado'" (click)="openLink(l.refs)">
                <span class="xref-type">{{ types[l.type] }}@if (l.direction === 'citado-em') { · citado em } @else if (l.direction === 'cita') { · cita }</span>
                <span class="xref-label">{{ l.label }}</span>
                @if (l.note) { <span class="xref-note">{{ l.note }}</span> }
              </button>
            </li>
          }
        </ul>
        @if (links()!.length > visibleLinks().length) {
          <button mat-button (click)="showAll = true">Ver todas ({{ links()!.length }})</button>
        }
        <p class="credit">Citações e alusões: seleção do app. Textos relacionados: OpenBible.info (CC BY).</p>
      }
    </div>
  `,
  styles: `
    .content { padding: 4px 20px 20px; }
    .reference { font: 600 18px var(--heading-font); color: var(--mat-sys-primary); margin: 0 0 8px; }
    .reference span {
      font: 600 13px Inter, sans-serif; padding: 3px 8px; border-radius: 8px; margin-left: 6px; vertical-align: middle;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface-variant);
    }
    .text { font-size: 17px; line-height: 1.7; margin: 0 0 20px; max-height: 30vh; overflow-y: auto; }
    .label { font: var(--mat-sys-label-large); color: var(--mat-sys-on-surface-variant); margin: 0 0 10px; }
    .colors { display: flex; gap: 12px; margin-bottom: 24px; }
    .swatch {
      width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: grid; place-items: center;
      border: 1px solid color-mix(in srgb, var(--mat-sys-on-surface) 8%, transparent); color: var(--mat-sys-on-surface); transition: transform 120ms;
    }
    .swatch:active { transform: scale(.92); }
    .swatch.active { box-shadow: 0 0 0 2px var(--mat-sys-surface), 0 0 0 3px var(--mat-sys-primary); }
    .swatch.clear { background: none; border-color: var(--mat-sys-outline-variant); }
    .xref-title { margin-top: 22px; }
    .xrefs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    .xref {
      width: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 1px; text-align: left; cursor: pointer;
      min-height: 44px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--mat-sys-outline-variant); background: none; color: inherit;
    }
    .xref.curated { border-left: 3px solid var(--accent-gold); background: var(--mat-sys-surface-container-low); }
    .xref-type { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .xref:not(.curated) .xref-type { color: var(--mat-sys-on-surface-variant); }
    .xref-label { font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    .xref-note { font: 400 14px/1.45 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .credit { margin: 8px 0 0; font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actions button { height: 48px; }
  `,
})
export class VerseSheet {
  protected readonly data = inject<VerseSheetData>(MAT_BOTTOM_SHEET_DATA);
  private readonly ref = inject(MatBottomSheetRef<VerseSheet>);
  private readonly favorites = inject(FavoritesService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly colors = HIGHLIGHT_COLORS;
  protected readonly favorite = computed(() => this.favorites.get(this.data.ref));
  private readonly bottomSheet = inject(MatBottomSheet);
  protected readonly types = LINK_TYPES;
  protected showAll = false;
  protected readonly links = toSignal(inject(CrossReferencesService).forVerse(this.data.ref.bookId, this.data.ref.chapter, this.data.ref.verse));

  /** As curadas sempre; das automáticas, as 5 primeiras (até tocar em “ver todas”). */
  protected visibleLinks() {
    const all = this.links() ?? [];
    if (this.showAll) return all;
    const curated = all.filter((l) => l.type !== 'relacionado');
    return [...curated, ...all.filter((l) => l.type === 'relacionado').slice(0, 5)];
  }

  protected openLink(refs: string): void {
    this.ref.dismiss();
    this.bottomSheet.open(PassageSheet, { panelClass: 'app-sheet', autoFocus: false, data: refs });
  }

  private get shareText(): string {
    return `“${this.data.text}”\n— ${this.data.reference} (${this.data.versionAbbrev})`;
  }

  protected highlight(color: HighlightColor): void {
    const isNew = !this.favorite();
    this.favorites.save(this.data.ref, this.data.text, color);
    if (isNew) {
      this.toast('Versículo salvo nos favoritos');
    }
    this.ref.dismiss();
  }

  protected remove(): void {
    this.favorites.remove(this.data.ref);
    this.toast('Destaque removido');
    this.ref.dismiss();
  }

  protected copy(): void {
    this.clipboard.copy(this.shareText);
    this.toast('Versículo copiado');
    this.ref.dismiss();
  }

  protected async share(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({ text: this.shareText });
      } catch {
        // usuário cancelou
      }
    } else {
      this.copy();
      return;
    }
    this.ref.dismiss();
  }

  private toast(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2000, panelClass: 'app-snack' });
  }
}
