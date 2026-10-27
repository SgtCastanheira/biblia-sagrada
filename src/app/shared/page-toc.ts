import { afterNextRender, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface TocItem {
  anchor: string;
  text: string;
  /** Número do capítulo (mostrado num círculo). Sem número, aparece com um marcador. */
  chapter?: number;
}

/**
 * Índice da página. No celular fica recolhido (abre com um toque); no notebook e no monitor, aberto e fixo ao lado
 * do texto. Destaca a seção que está na tela enquanto se rola, e leva a cada seção ao tocar.
 */
@Component({
  selector: 'app-page-toc',
  imports: [MatIconModule],
  template: `
    <details class="toc" [open]="open()" (toggle)="open.set($any($event.target).open)">
      <summary>
        <mat-icon>list</mat-icon>
        <span class="t">{{ title() }}</span>
        <span class="count">{{ items().length }} {{ unit() }}</span>
        <mat-icon class="expand">expand_more</mat-icon>
      </summary>
      <nav [attr.aria-label]="title()">
        @for (it of items(); track it.anchor) {
          <button type="button" [class.active]="active() === it.anchor" [attr.aria-current]="active() === it.anchor ? 'location' : null" (click)="jump(it.anchor)">
            @if (it.chapter) { <span class="n">{{ it.chapter }}</span> } @else { <span class="n dot"></span> }
            <span class="label">{{ it.text }}</span>
          </button>
        }
      </nav>
    </details>
  `,
  styles: `
    :host { display: block; }
    .toc { border-radius: 16px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); padding: 4px 14px 8px; }
    summary { display: flex; align-items: center; gap: 8px; min-height: 44px; cursor: pointer; list-style: none; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    summary::-webkit-details-marker { display: none; }
    summary mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .count { margin-left: auto; text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--mat-sys-on-surface-variant); }
    .expand { transition: transform .2s; }
    details[open] .expand { transform: rotate(180deg); }
    nav { display: flex; flex-direction: column; gap: 2px; margin-top: 2px; }
    button {
      display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 6px 8px; border: 0; border-radius: 10px; background: none; cursor: pointer; text-align: left;
      font: 500 15px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant);
    }
    button:hover { background: var(--mat-sys-surface-container); }
    button.active { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); font-weight: 600; }
    .n { flex: none; display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; font: 700 13px Inter, sans-serif; color: var(--accent-gold); border: 1px solid var(--accent-gold); }
    .n.dot { width: 8px; height: 8px; margin: 8px; border: 0; background: var(--accent-gold); }
    .label { min-width: 0; }
  `,
})
export class PageToc {
  readonly items = input.required<TocItem[]>();
  readonly title = input('Nesta página');
  readonly unit = input('partes');

  /** Aberto de início só em tela larga; depois, segue o que a pessoa fizer. */
  protected readonly open = signal(typeof matchMedia !== 'undefined' && matchMedia('(min-width: 1100px)').matches);
  protected readonly active = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  private observer?: IntersectionObserver;
  private ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
    // Em tela larga o índice abre e fecha junto com o tamanho da janela
    if (typeof matchMedia !== 'undefined') {
      const query = matchMedia('(min-width: 1100px)');
      const listener = (e: MediaQueryListEvent) => this.open.set(e.matches);
      query.addEventListener?.('change', listener);
      this.destroyRef.onDestroy(() => query.removeEventListener?.('change', listener));
    }
    effect(() => {
      const anchors = this.items().map((i) => i.anchor);
      if (!this.ready() || typeof IntersectionObserver === 'undefined') return;
      this.observer?.disconnect();
      // A seção atual é a mais alta que já passou do topo da tela
      const visible = new Set<string>();
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id));
          const first = anchors.find((a) => visible.has(a));
          if (first) this.active.set(first);
        },
        { rootMargin: '-72px 0px -65% 0px' },
      );
      for (const a of anchors) {
        const el = document.getElementById(a);
        if (el) this.observer.observe(el);
      }
    });
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  protected jump(anchor: string): void {
    const el = document.getElementById(anchor);
    if (!el) return;
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    this.active.set(anchor);
  }
}
