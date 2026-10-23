import { Component, computed, input, output, signal } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { BOOKS } from '../core/books';
import { fold } from '../core/dictionary';

/** Forma de busca: sem acentos, sem espaços e com "I/II/III" como "1/2/3" ("II Co" → "2co"). */
const key = (s: string) => fold(s).replace(/^(i{1,3})\s+/, (_, r: string) => String(r.length)).replace(/\s+/g, '');

const INDEX = BOOKS.map((b) => ({ book: b, keys: [key(b.name), key(b.abbrev)] }));

/**
 * Campo de referências bíblicas com sugestão de livros: ao digitar "Mat", sugere Mateus (Mt);
 * escolhido o livro, a pessoa completa o capítulo e o versículo ("Mt 5.3-12"). Aceita várias, separadas por ";".
 */
@Component({
  selector: 'app-ref-input',
  imports: [MatAutocompleteModule, MatIconModule],
  template: `
    <label class="field">
      <mat-icon>menu_book</mat-icon>
      <input #box [placeholder]="placeholder()" [value]="value()" [attr.aria-label]="label()" autocomplete="off" autocapitalize="sentences"
             [matAutocomplete]="auto" (input)="onInput(box.value)" />
    </label>
    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="choose($event, box)" [hideSingleSelectionIndicator]="true">
      @for (s of suggestions(); track s.id) {
        <mat-option [value]="s.id">
          <span class="book">{{ s.name }}</span> <span class="abbrev">{{ s.abbrev }}</span>
        </mat-option>
      }
    </mat-autocomplete>
    @if (hint()) { <p class="hint">{{ hint() }}</p> }
  `,
  styles: `
    :host { display: block; }
    .field {
      display: flex; align-items: center; gap: 8px; height: 46px; padding: 0 12px; border-radius: 14px;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface-variant);
    }
    .field:focus-within { border-color: var(--mat-sys-primary); }
    .field mat-icon { flex: none; font-size: 20px; width: 20px; height: 20px; }
    .field input {
      flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: none;
      color: var(--mat-sys-on-surface); font: 500 15px Inter, sans-serif;
    }
    .book { font-weight: 600; }
    .abbrev { margin-left: 6px; color: var(--mat-sys-on-surface-variant); }
    .hint { margin: 6px 4px 0; font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class RefInput {
  readonly value = input('');
  readonly placeholder = input('Digite o livro: Mat, Sal, Jo…');
  readonly label = input('Textos bíblicos');
  readonly valueChange = output<string>();

  private readonly text = signal('');

  /** O trecho que a pessoa está digitando agora (depois do último ";"). */
  private readonly current = computed(() => {
    const t = this.text() || this.value();
    return t.slice(t.lastIndexOf(';') + 1).trimStart();
  });

  protected readonly suggestions = computed(() => {
    const typed = this.current();
    // Só enquanto digita o nome do livro (letras, talvez com o número na frente: "1 Co", "II Re")
    if (!/^([1-3]|i{1,3})?\s*[\p{L}]+$/iu.test(typed)) return [];
    const q = key(typed);
    if (!q) return [];
    const starts = INDEX.filter((i) => i.keys.some((k) => k.startsWith(q))).map((i) => i.book);
    // Abreviação digitada por inteiro primeiro ("Jo" → João antes de Jó e Jonas; "Jó" → Jó)
    const typedLower = typed.toLowerCase().replace(/\s+/g, '');
    const score = (b: (typeof starts)[number]) => (b.abbrev.toLowerCase() === typedLower ? 2 : key(b.abbrev) === q ? 1 : 0);
    starts.sort((a, b) => score(b) - score(a));
    return starts.slice(0, 8);
  });

  protected readonly hint = computed(() => {
    const typed = this.current();
    if (this.suggestions().length) return '';
    if (/^[1-3]?\s*\p{L}+\.?\s+$/u.test(typed)) return 'Agora o capítulo e o versículo: 5.3 ou 5.3-12';
    return '';
  });

  protected onInput(text: string): void {
    this.text.set(text);
    this.valueChange.emit(text);
  }

  protected choose(event: MatAutocompleteSelectedEvent, box: HTMLInputElement): void {
    const book = BOOKS.find((b) => b.id === event.option.value)!;
    const t = this.text() || this.value();
    const head = t.slice(0, t.lastIndexOf(';') + 1);
    const next = `${head}${head ? ' ' : ''}${book.abbrev} `;
    box.value = next;
    this.onInput(next);
    event.option.deselect();
    box.focus();
  }
}
