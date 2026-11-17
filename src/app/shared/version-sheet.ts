import { Component, computed, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { filterVersionGroups, VERSION_GROUPS } from '../core/versions';

export interface VersionSheetData {
  title: string;
  current: string | null;
}

@Component({
  selector: 'app-version-sheet',
  imports: [MatIconModule, MatRippleModule],
  template: `
    <div class="sheet-handle"></div>
    <h2 class="sheet-title">{{ data.title }}</h2>
    <div class="search">
      <mat-icon aria-hidden="true">search</mat-icon>
      <input
        type="search"
        aria-label="Buscar versão por nome, língua ou região"
        placeholder="Buscar: Xingu, Kayabí, inglês…"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        [value]="query()"
        (input)="onInput($event)"
        (keydown.enter)="pickOnly()"
      />
      @if (query()) {
        <button type="button" class="clear" aria-label="Limpar a busca" (click)="query.set('')"><mat-icon>close</mat-icon></button>
      }
    </div>
    @if (searching()) {
      <p class="count" role="status">{{ count() === 1 ? '1 versão encontrada' : count() + ' versões encontradas' }}</p>
    }
    <div class="list">
      @for (group of groups(); track group.language) {
        <h3>{{ group.language }}</h3>
        @for (v of group.versions; track v.id) {
          <button matRipple class="item" [class.selected]="v.id === data.current" (click)="ref.dismiss(v.id)">
            <span class="badge">{{ v.badge ?? v.abbrev }}</span>
            <span class="text">
              <span class="name">{{ v.name }}</span>
              <span class="meta">{{ v.flag }} {{ v.language }}{{ v.ntOnly ? ' · só Novo Testamento' : v.partial ? ' · Antigo Testamento incompleto' : '' }}</span>
            </span>
            @if (v.id === data.current) {
              <mat-icon>check_circle</mat-icon>
            }
          </button>
        }
      }
      @if (searching() && !count()) {
        <p class="empty">Nenhuma versão encontrada para “{{ query().trim() }}”. Tente o nome da língua, do povo ou da região, como “xingu”, “inglês” ou “guarani”.</p>
      }
    </div>
  `,
  styles: `
    .list { overflow-y: auto; max-height: calc(85vh - 150px); padding: 0 12px 16px; }
    .search {
      display: flex; align-items: center; gap: 8px; min-height: 48px; box-sizing: border-box; margin: 0 16px 4px; padding: 0 4px 0 14px;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 28px; background: var(--mat-sys-surface-container-low, transparent);
    }
    .search:focus-within { border-color: var(--mat-sys-primary); box-shadow: 0 0 0 1px var(--mat-sys-primary); }
    .search mat-icon { flex: none; color: var(--mat-sys-on-surface-variant); }
    .search input {
      flex: 1; min-width: 0; min-height: 44px; border: 0; outline: 0; background: none; color: inherit;
      font: 400 16px/1.4 Inter, sans-serif;
    }
    .search input::placeholder { color: var(--mat-sys-on-surface-variant); opacity: 1; }
    /* o "×" do próprio navegador some: o app tem o seu, de 40 px e com nome para leitor de tela */
    .search input::-webkit-search-cancel-button, .search input::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
    .clear {
      flex: none; display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 50%;
      background: none; color: var(--mat-sys-on-surface-variant); cursor: pointer;
    }
    .count, .empty { margin: 8px 24px 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .empty { margin: 16px 12px; font: var(--mat-sys-body-medium); }
    h3 { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); margin: 18px 8px 6px; }
    .item {
      display: flex; align-items: center; gap: 14px; width: 100%; padding: 10px 8px;
      border: 0; border-radius: 16px; background: none; color: inherit; text-align: left; cursor: pointer;
    }
    .item.selected { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .item.selected .badge { border-color: var(--mat-sys-primary); }
    .badge {
      flex: none; width: 44px; height: 44px; box-sizing: border-box;
      display: grid; place-items: center; border-radius: 50%;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary);
      font: 600 13px/1 Inter, sans-serif; letter-spacing: .4px;
    }
    .text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .name { font: var(--mat-sys-body-large); }
    .meta { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    mat-icon { color: var(--mat-sys-primary); }
  `,
})
export class VersionSheet {
  protected readonly data = inject<VersionSheetData>(MAT_BOTTOM_SHEET_DATA);
  protected readonly ref = inject(MatBottomSheetRef<VersionSheet, string>);
  protected readonly query = signal('');
  protected readonly searching = computed(() => this.query().trim().length > 0);
  protected readonly groups = computed(() => filterVersionGroups(VERSION_GROUPS, this.query()));
  protected readonly count = computed(() => this.groups().reduce((n, g) => n + g.versions.length, 0));

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /** Enter escolhe a versão quando a busca já deixou uma só. */
  protected pickOnly(): void {
    const found = this.groups().flatMap((g) => g.versions);
    if (this.searching() && found.length === 1) this.ref.dismiss(found[0].id);
  }
}
