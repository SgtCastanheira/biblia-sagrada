import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { VERSION_GROUPS } from '../core/versions';

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
    <div class="list">
      @for (group of groups; track group.language) {
        <h3>{{ group.language }}</h3>
        @for (v of group.versions; track v.id) {
          <button matRipple class="item" [class.selected]="v.id === data.current" (click)="ref.dismiss(v.id)">
            <span class="badge">{{ v.badge ?? v.abbrev }}</span>
            <span class="text">
              <span class="name">{{ v.name }}</span>
              <span class="meta">{{ v.flag }} {{ v.language }}{{ v.ntOnly ? ' · só Novo Testamento' : '' }}</span>
            </span>
            @if (v.id === data.current) {
              <mat-icon>check_circle</mat-icon>
            }
          </button>
        }
      }
    </div>
  `,
  styles: `
    .list { overflow-y: auto; max-height: calc(85vh - 80px); padding: 0 12px 16px; }
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
  protected readonly groups = VERSION_GROUPS;
}
