import { Component, computed, signal } from '@angular/core';
import { christianOrder, TANAKH, TANAKH_GROUPS, TanakhGroup } from '../core/tanakh';

/**
 * A Bíblia dos judeus em "estantes": os 24 rolos da Torá, dos Profetas e dos Escritos, com os nomes em hebraico.
 * Um botão mostra os mesmos livros na ordem da nossa Bíblia, e a cor mostra de que parte da Bíblia hebraica
 * cada um veio: assim se vê onde os livros foram trocados de lugar.
 */
@Component({
  selector: 'app-tanakh-shelf',
  template: `
    <div class="switch" role="group" aria-label="Ordem dos livros">
      <button type="button" [class.on]="mode() === 'hebraica'" [attr.aria-pressed]="mode() === 'hebraica'" (click)="mode.set('hebraica')">Como era no tempo de Jesus<small>24 rolos, em 3 partes</small></button>
      <button type="button" [class.on]="mode() === 'crista'" [attr.aria-pressed]="mode() === 'crista'" (click)="mode.set('crista')">Como está na nossa Bíblia<small>39 livros, em outra ordem</small></button>
    </div>

    @if (mode() === 'hebraica') {
      @for (g of groups; track g.id) {
        <section class="shelf" [class]="'shelf ' + g.id">
          <h3><span class="he" lang="he" dir="rtl">{{ g.hebrew }}</span> {{ g.name }} <small>{{ count(g.id) }}</small></h3>
          <p class="note">{{ g.note }}</p>
          <ul>
            @for (b of booksOf(g.id); track b.name) {
              <li class="scroll" [attr.aria-label]="b.pt + ', em hebraico ' + b.name">
                <span class="he" lang="he" dir="rtl">{{ b.he }}</span>
                <span class="pt">{{ b.pt }}</span>
                <span class="tr">{{ b.name }}</span>
              </li>
            }
          </ul>
        </section>
      }
    } @else {
      <p class="hint">Cada livro tem a cor da parte da Bíblia hebraica de onde veio.</p>
      <ol class="order">
        @for (b of order; track b.id; let i = $index) {
          <li [class]="b.group"><span class="n">{{ i + 1 }}</span>{{ b.name }}<small>{{ groupName(b.group) }}</small></li>
        }
      </ol>
      <p class="legend">
        @for (g of groups; track g.id) { <span [class]="g.id"><i></i>{{ g.name }}</span> }
      </p>
    }
  `,
  styles: `
    :host { display: block; }
    .switch { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
    .switch button { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 56px; padding: 8px 12px; border-radius: 16px; cursor: pointer; text-align: left; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 700 14px/1.25 Inter, sans-serif; }
    .switch button small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .switch button.on { background: var(--mat-sys-primary-container); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary-container); }
    .switch button.on small { color: inherit; }
    .shelf { margin: 0 0 14px; padding: 12px 14px 14px; border-radius: 18px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); border-top: 5px solid var(--g); }
    .shelf.lei { --g: var(--accent-gold); }
    .shelf.profetas { --g: var(--mat-sys-primary); }
    .shelf.escritos { --g: var(--mat-sys-outline); }
    .shelf h3 { display: flex; align-items: baseline; gap: 8px; margin: 0; font: 600 18px var(--heading-font); }
    .shelf h3 small { margin-left: auto; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .he { font-family: 'Noto Serif Hebrew', 'Times New Roman', serif; }
    .shelf h3 .he { font-size: 20px; color: var(--accent-gold); }
    .note { margin: 2px 0 10px; font: 400 14px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 10px; }
    .scroll {
      position: relative; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 12px 18px; text-align: center; border-radius: 6px;
      background: linear-gradient(90deg, rgba(0, 0, 0, .06), transparent 12%, transparent 88%, rgba(0, 0, 0, .06)), var(--mat-sys-surface);
      border: 1px solid var(--mat-sys-outline-variant);
    }
    /* os "cabos" do rolo, nas duas pontas */
    .scroll::before, .scroll::after { content: ''; position: absolute; top: -3px; bottom: -3px; width: 8px; border-radius: 4px; background: var(--g); }
    .scroll::before { left: -4px; }
    .scroll::after { right: -4px; }
    .scroll .he { font-size: 22px; line-height: 1.25; color: var(--mat-sys-on-surface); }
    .scroll .pt { font: 600 14px/1.25 Inter, sans-serif; }
    .scroll .tr { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hint { margin: 0 0 10px; font: 400 14px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .order { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
    .order li { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 8px 10px; border-radius: 12px; background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); border-left: 6px solid var(--g); font: 600 14px/1.25 Inter, sans-serif; }
    .order li.lei, .legend .lei { --g: var(--accent-gold); }
    .order li.profetas, .legend .profetas { --g: var(--mat-sys-primary); }
    .order li.escritos, .legend .escritos { --g: var(--mat-sys-outline); }
    .order .n { min-width: 22px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .order small { flex-basis: 100%; padding-left: 30px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 12px 0 0; font: 500 14px Inter, sans-serif; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .legend i { width: 14px; height: 14px; border-radius: 4px; background: var(--g); }
  `,
})
export class TanakhShelf {
  protected readonly mode = signal<'hebraica' | 'crista'>('hebraica');
  protected readonly groups = (Object.keys(TANAKH_GROUPS) as TanakhGroup[]).map((id) => ({ id, ...TANAKH_GROUPS[id] }));
  protected readonly order = christianOrder();
  protected readonly counts = computed(() => Object.fromEntries(this.groups.map((g) => [g.id, TANAKH.filter((b) => b.group === g.id).length])));

  protected booksOf(g: TanakhGroup) {
    return TANAKH.filter((b) => b.group === g);
  }

  protected count(g: TanakhGroup): string {
    const n = this.counts()[g];
    return `${n} ${n === 1 ? 'livro' : 'livros'}`;
  }

  protected groupName(g: TanakhGroup): string {
    return TANAKH_GROUPS[g].name;
  }
}
