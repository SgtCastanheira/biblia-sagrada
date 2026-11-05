import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { ShareCard } from '../core/share-card';
import { Sheets } from './sheets';

/** Botão “Compartilhar” das páginas: abre o painel com a imagem (assunto, tópicos, endereço e QR code) para enviar. */
@Component({
  selector: 'app-share-image-button',
  imports: [MatButtonModule, MatIconModule],
  template: `<button mat-icon-button type="button" [disabled]="!card()" [attr.aria-label]="label()" (click)="open()"><mat-icon>ios_share</mat-icon></button>`,
  styles: `:host { display: inline-flex; }`,
})
export class ShareImageButton {
  readonly card = input<ShareCard | null | undefined>();
  readonly label = input('Compartilhar');
  private readonly sheets = inject(Sheets);

  protected open(): void {
    const card = this.card();
    if (card) this.sheets.shareImage(card);
  }
}
