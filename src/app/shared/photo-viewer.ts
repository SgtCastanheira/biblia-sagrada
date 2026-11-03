import { afterRenderEffect, Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface ViewedPhoto {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Foto em tela cheia: toque na imagem para ampliar e arrastar pelos detalhes (quadros, mapas antigos); Esc, o
 * botão de fechar ou um toque fora da imagem voltam ao texto.
 */
@Component({
  selector: 'app-photo-viewer',
  imports: [MatIconModule],
  host: { '(document:keydown.escape)': 'photo() && closed.emit()' },
  template: `
    @if (photo(); as p) {
      <!-- Pelo teclado, Esc e o botão Fechar fazem o mesmo que tocar fora da imagem -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
      <div class="viewer" role="dialog" aria-modal="true" [attr.aria-label]="p.alt || 'Imagem ampliada'" (click)="closed.emit()">
        <button #closeButton type="button" class="close" (click)="closed.emit()" aria-label="Fechar a imagem"><mat-icon>close</mat-icon></button>
        <!-- Ampliar com o dedo; no computador a imagem já aparece grande -->
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <div class="frame" [class.zoomed]="zoomed()" (click)="$event.stopPropagation(); zoomed.set(!zoomed())">
          <img [src]="'conteudo/' + p.src" [alt]="p.alt" />
        </div>
        <!-- Só impede que o toque na legenda feche a imagem -->
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        @if (p.caption) { <p class="caption" (click)="$event.stopPropagation()">{{ p.caption }}</p> }
        <p class="hint">{{ zoomed() ? 'Arraste para ver os detalhes · toque para voltar' : 'Toque na imagem para ampliar' }}</p>
      </div>
    }
  `,
  styles: `
    .viewer {
      position: fixed; inset: 0; z-index: 1200; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
      padding: calc(56px + env(safe-area-inset-top)) 12px calc(16px + env(safe-area-inset-bottom)); box-sizing: border-box;
      background: rgba(12, 9, 6, .94); color: #f3ead9;
    }
    .close {
      position: absolute; top: calc(8px + env(safe-area-inset-top)); right: 8px; display: grid; place-items: center; width: 44px; height: 44px;
      border: 0; border-radius: 50%; background: rgba(255, 255, 255, .12); color: #fff8ec; cursor: pointer;
    }
    .close:focus-visible { outline: 2px solid #e2c28c; outline-offset: 2px; }
    .frame { display: grid; place-items: center; width: 100%; max-height: calc(100% - 120px); overflow: auto; cursor: zoom-in; }
    .frame img { display: block; max-width: 100%; max-height: calc(100vh - 220px); object-fit: contain; border-radius: 6px; }
    .frame.zoomed { place-items: start; height: calc(100% - 110px); cursor: zoom-out; }
    .frame.zoomed img { width: 230%; max-width: none; max-height: none; border-radius: 0; }
    @media (min-width: 840px) { .frame.zoomed img { width: 160%; } }
    .caption { max-width: 640px; margin: 0; font: 400 14px/1.45 Inter, sans-serif; text-align: center; color: #e6dccb; }
    .hint { margin: 0; font: 500 13px Inter, sans-serif; color: #cbbd9f; }
  `,
})
export class PhotoViewer {
  readonly photo = input<ViewedPhoto | null>(null);
  readonly closed = output<void>();
  protected readonly zoomed = signal(false);
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  constructor() {
    // Aberta: o texto atrás não rola e o foco vai para o botão de fechar
    afterRenderEffect(() => {
      const open = !!this.photo();
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) this.closeButton()?.nativeElement.focus();
      else this.zoomed.set(false);
    });
    inject(DestroyRef).onDestroy(() => (document.body.style.overflow = ''));
  }
}
