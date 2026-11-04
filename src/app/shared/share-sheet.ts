import { Clipboard } from '@angular/cdk/clipboard';
import { Component, DestroyRef, effect, inject, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { pageUrl, shareText, type ShareCard } from '../core/share-card';
import { renderShareImage, SHARE_FORMATS, type ShareFormat } from './share-render';

/**
 * Painel “Compartilhar”: mostra a imagem que será enviada (assunto, título, tópicos, nome do app, endereço e QR code)
 * e a manda pelo menu do aparelho, que lista o WhatsApp e o Instagram, ou a salva no celular.
 */
@Component({
  selector: 'app-share-sheet',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="sheet-handle"></div>
    <div class="content">
      <h2>Compartilhar</h2>
      <p class="lead">Uma imagem com o assunto, os tópicos e o endereço do app, para quem receber querer ler.</p>

      <div class="formats" role="group" aria-label="Tamanho da imagem">
        @for (f of formats; track f.id) {
          <button type="button" class="fmt" [class.on]="format() === f.id" [attr.aria-pressed]="format() === f.id" (click)="format.set(f.id)">
            <strong>{{ f.label }}</strong><small>{{ f.hint }}</small>
          </button>
        }
      </div>

      <div class="preview" [class.stories]="format() === 'stories'" aria-live="polite">
        @switch (state()) {
          @case ('pronto') {
            <img [src]="preview()" [alt]="'Prévia da imagem para compartilhar: ' + card.title" />
          }
          @case ('erro') {
            <p class="msg">Não foi possível gerar a imagem. Use “Copiar link”.</p>
          }
          @default {
            <p class="msg">Gerando a imagem…</p>
          }
        }
      </div>

      <div class="actions">
        <button mat-flat-button type="button" [disabled]="state() !== 'pronto'" (click)="share()"><mat-icon>ios_share</mat-icon> Compartilhar imagem</button>
        <button mat-stroked-button type="button" [disabled]="state() !== 'pronto'" (click)="download()"><mat-icon>download</mat-icon> Baixar a imagem</button>
        <button mat-stroked-button type="button" (click)="whatsapp()"><mat-icon>chat</mat-icon> Enviar o link no WhatsApp</button>
        <button mat-stroked-button type="button" (click)="copy()"><mat-icon>content_copy</mat-icon> Copiar o link</button>
      </div>
      <p class="tip">Ao compartilhar, escolha o <strong>WhatsApp</strong> ou o <strong>Instagram</strong> (Stories ou Feed) na tela que abrir. Se o seu aparelho não mostrar o Instagram, baixe a imagem e publique por lá.</p>
    </div>
  `,
  styles: `
    .content { padding: 4px 20px 24px; }
    h2 { margin: 6px 0 4px; font: 600 22px/1.25 var(--heading-font); }
    .lead { margin: 0 0 14px; font: 400 15px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .formats { display: flex; gap: 8px; margin-bottom: 14px; }
    .fmt { flex: 1; min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 8px; border: 1.5px solid var(--mat-sys-outline-variant); border-radius: 14px; background: transparent; color: var(--mat-sys-on-surface); font: inherit; cursor: pointer; }
    .fmt strong { font: 600 15px/1.2 Inter, sans-serif; }
    .fmt small { font: 500 13px/1.2 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .fmt.on { border-color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 16%, transparent); }
    .preview { display: grid; place-items: center; min-height: 180px; margin-bottom: 14px; padding: 10px; border-radius: 16px; background: color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent); }
    .preview img { display: block; width: auto; max-width: 100%; max-height: min(46vh, 420px); border-radius: 10px; box-shadow: 0 6px 22px rgba(0, 0, 0, .28); }
    .preview.stories img { max-height: min(52vh, 480px); }
    .msg { margin: 0; font: 400 15px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); text-align: center; }
    .actions { display: grid; gap: 8px; }
    .actions button { min-height: 48px; justify-content: center; }
    .tip { margin: 14px 0 0; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class ShareSheet {
  protected readonly card = inject<ShareCard>(MAT_BOTTOM_SHEET_DATA);
  private readonly clipboard = inject(Clipboard);
  private readonly snack = inject(MatSnackBar);
  protected readonly formats = (Object.keys(SHARE_FORMATS) as ShareFormat[]).map((id) => ({ id, ...SHARE_FORMATS[id] }));
  protected readonly format = signal<ShareFormat>('feed');
  protected readonly state = signal<'gerando' | 'pronto' | 'erro'>('gerando');
  protected readonly preview = signal('');
  private blob: Blob | null = null;
  private turn = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.release());
    effect(() => {
      const f = this.format();
      untracked(() => void this.make(f));
    });
  }

  private release(): void {
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
  }

  private async make(f: ShareFormat): Promise<void> {
    const turn = ++this.turn;
    this.state.set('gerando');
    try {
      const blob = await renderShareImage(this.card, f);
      if (turn !== this.turn) return;
      this.release();
      this.blob = blob;
      this.preview.set(URL.createObjectURL(blob));
      this.state.set('pronto');
    } catch {
      if (turn === this.turn) this.state.set('erro');
    }
  }

  private file(): File {
    const slug = this.card.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'pagina';
    return new File([this.blob!], `biblia-sagrada-${slug}.png`, { type: 'image/png' });
  }

  protected async share(): Promise<void> {
    if (!this.blob) return;
    const data: ShareData = { files: [this.file()], title: this.card.title, text: shareText(this.card) };
    if (navigator.canShare?.(data)) {
      try {
        await navigator.share(data);
      } catch {
        // cancelado
      }
      return;
    }
    this.download();
    this.snack.open('A imagem foi salva. Abra o WhatsApp ou o Instagram e escolha-a na galeria.', 'OK', { duration: 6000 });
  }

  protected download(): void {
    if (!this.blob) return;
    const file = this.file();
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  protected whatsapp(): void {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText(this.card))}`, '_blank', 'noopener');
  }

  protected copy(): void {
    this.clipboard.copy(pageUrl(this.card.path));
    this.snack.open('Link copiado', undefined, { duration: 2500 });
  }
}
