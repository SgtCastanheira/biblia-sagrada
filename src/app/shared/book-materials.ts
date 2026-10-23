import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { StudyIndexService } from '../core/study-index';

/** “Para estudar este livro”: mapas, aulas, profecias, personagens, curiosidades e notas — na ordem da Bíblia. */
@Component({
  selector: 'app-book-materials',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    @if (m(); as m) {
      @if (!m.total) {
        <p class="none">Ainda não há material de estudo para este livro além do texto.</p>
      }
      @if (m.notes.length) {
        <div class="group">
          <span class="g-title"><mat-icon>sticky_note_2</mat-icon> Capítulos com notas de estudo</span>
          <div class="chapters">
            @for (c of m.notes; track c) { <a matRipple [routerLink]="['/ler', m.bookId, c]">{{ c }}</a> }
          </div>
        </div>
      }
      @for (g of groups(); track g.title) {
        <div class="group">
          <span class="g-title"><mat-icon>{{ g.icon }}</mat-icon> {{ g.title }}</span>
          @for (it of g.items; track it.link) {
            <a class="item" matRipple [routerLink]="it.link">
              <span>{{ it.name }}@if (it.sub) { <small>{{ it.sub }}</small> }</span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }
    }
  `,
  styles: `
    :host { display: block; }
    .none { margin: 0; color: var(--mat-sys-on-surface-variant); font: 400 15px Inter, sans-serif; }
    .group { margin-bottom: 14px; }
    .g-title {
      display: flex; align-items: center; gap: 6px; margin: 0 0 6px; font: 600 13px Inter, sans-serif;
      text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold);
    }
    .g-title mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .item {
      display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 6px 4px 6px 12px; margin-bottom: 4px;
      border-radius: 12px; position: relative; overflow: hidden; text-decoration: none; color: inherit;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .item span { flex: 1; display: flex; flex-direction: column; font: 600 15px/1.3 var(--heading-font); }
    .item small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .go { color: var(--mat-sys-on-surface-variant); }
    .chapters { display: flex; flex-wrap: wrap; gap: 6px; }
    .chapters a {
      min-width: 40px; height: 40px; padding: 0 8px; border-radius: 20px; display: grid; place-items: center; text-decoration: none;
      position: relative; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
  `,
})
export class BookMaterialsView {
  readonly bookId = input.required<string>();
  private readonly index = inject(StudyIndexService);
  protected readonly m = toSignal(toObservable(this.bookId).pipe(switchMap((id) => this.index.forBook(id))));

  /** Grupos, sempre na mesma ordem e com os mesmos ícones em todo o app. */
  protected readonly groups = computed(() => {
    const m = this.m();
    if (!m) return [];
    return [
      { title: 'Mapas', icon: 'map', items: m.maps.map((x) => ({ name: x.title, sub: x.period, link: `/mapas/${x.id}` })) },
      { title: 'Aulas e estudos', icon: 'school', items: m.articles.map((x) => ({ name: x.title, sub: x.subtitle, link: `/artigo/${x.id}` })) },
      { title: 'Profecias', icon: 'visibility', items: m.prophecies.map((x) => ({ name: x.title, sub: x.ref, link: `/profecias/${x.id}` })) },
      { title: 'Personagens', icon: 'person', items: m.people.map((x) => ({ name: x.name, sub: x.title, link: `/memorial/${x.id}` })) },
      { title: 'Você sabia?', icon: 'lightbulb', items: m.curiosities.map((x) => ({ name: x.question, sub: '', link: `/curiosidades/${x.id}` })) },
    ].filter((g) => g.items.length);
  });
}
