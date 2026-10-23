import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { PassageView } from './passage-view';

/** Painel com o texto de uma referência bíblica citada num estudo. */
@Component({
  selector: 'app-passage-sheet',
  imports: [PassageView],
  template: `
    <div class="sheet-handle"></div>
    <div class="content">
      <app-passage-view [refs]="refs" />
    </div>
  `,
  styles: `
    .content { padding: 0 20px 20px; max-height: 70vh; overflow-y: auto; }
  `,
})
export class PassageSheet {
  protected readonly refs = inject<string>(MAT_BOTTOM_SHEET_DATA);
}
