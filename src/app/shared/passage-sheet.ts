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
      <app-passage-view [refs]="data.refs" [version]="data.version" />
    </div>
  `,
  styles: `
    .content { padding: 0 20px 20px; max-height: 70vh; overflow-y: auto; }
  `,
})
export class PassageSheet {
  /** As referências e, se a página está numa língua própria (Novas Vozes), a versão da Bíblia nessa língua. */
  protected readonly data = inject<{ refs: string; version?: string }>(MAT_BOTTOM_SHEET_DATA);
}
