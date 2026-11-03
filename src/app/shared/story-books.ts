import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TRAILS } from '../core/trails';

/**
 * Fileira de livros em pé, um por assunto das histórias (a mesma ideia da biblioteca de /historia: cada assunto
 * tem a sua cor, `Trail.tone`). Cada livro leva à tela de histórias já no assunto. No celular rola de lado;
 * no computador quebra em linhas.
 */
@Component({
  selector: 'app-story-books',
  imports: [RouterLink, MatIconModule],
  template: `
    <nav class="books" aria-label="Assuntos das histórias">
      @if (all()) {
        <a class="book" [class.active]="!active()" routerLink="/historia" style="--tone: #3f5a4c">
          <span class="cover"><mat-icon>apps</mat-icon></span>
          <span class="lab">Todos</span>
        </a>
      }
      @for (t of trails; track t.id) {
        <a class="book" [class.active]="t.id === active()" routerLink="/historia" [queryParams]="{ trilha: t.id }" [style.--tone]="t.tone" [attr.aria-label]="t.name">
          <span class="cover"><mat-icon>{{ t.icon }}</mat-icon></span>
          <span class="lab">{{ t.short }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    :host { display: block; }
    .books { display: flex; gap: 14px; margin: 0 -20px; padding: 10px 20px 8px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; }
    .books::-webkit-scrollbar { display: none; }
    @media (min-width: 840px) { .books { margin: 0; padding: 10px 0 8px; flex-wrap: wrap; overflow: visible; gap: 20px 16px; } }
    .book { flex: none; width: 84px; display: flex; flex-direction: column; align-items: center; gap: 8px; scroll-snap-align: start; text-decoration: none; color: var(--mat-sys-on-surface); }
    /* Um livro de frente: lombada à esquerda, fio dourado na borda e o ícone no meio */
    .cover {
      position: relative; display: grid; place-items: center; width: 62px; height: 86px; box-sizing: border-box; padding-left: 4px; border-radius: 3px 7px 7px 3px; color: #f1d9a8;
      background:
        linear-gradient(90deg, rgba(0, 0, 0, .42) 0, rgba(0, 0, 0, 0) 12%, rgba(255, 255, 255, .1) 15%, rgba(0, 0, 0, 0) 22%),
        linear-gradient(165deg, var(--tone), color-mix(in srgb, var(--tone) 62%, #000));
      box-shadow: 0 5px 8px -2px rgba(0, 0, 0, .4); transition: transform .18s;
    }
    .cover::before { content: ''; position: absolute; inset: 5px 4px 5px 8px; border: 1px solid rgba(241, 217, 168, .55); border-radius: 2px; pointer-events: none; }
    .cover mat-icon { width: 28px; height: 28px; font-size: 28px; }
    .book:hover .cover { transform: translateY(-4px); }
    .book:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 2px; border-radius: 6px; }
    .book.active .cover { transform: translateY(-6px); outline: 2px solid var(--accent-gold); outline-offset: 2px; }
    .lab { font: 500 13px/1.25 Inter, sans-serif; text-align: center; max-width: 84px; }
    .book.active .lab { font-weight: 700; }
    @media (prefers-reduced-motion: reduce) { .cover { transition: none; } }
  `,
})
export class StoryBooks {
  /** Id do assunto aberto (para destacar o livro). */
  readonly active = input<string | undefined>();
  /** Mostra o livro "Todos" (na tela de histórias; na tela inicial não precisa). */
  readonly all = input(false);
  protected readonly trails = TRAILS;
}
