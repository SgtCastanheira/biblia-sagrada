import { Component, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotesService } from '../core/notes.service';

export interface BibleNoteSheetData {
  reference: string;
  quote: string;
  versionAbbrev: string;
}

@Component({
  selector: 'app-bible-note-sheet',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="sheet-handle"></div>
    <div class="content">
      <h2>Anotar trecho</h2>
      <p class="reference">{{ data.reference }} · {{ data.versionAbbrev }}</p>
      <blockquote>{{ data.quote }}</blockquote>
      <label for="bible-note-comment">Meu comentário</label>
      <textarea id="bible-note-comment" rows="4" [value]="comment()" (input)="comment.set(value($event))"
                placeholder="O que este trecho fez você pensar?"></textarea>
      <button mat-flat-button class="save" [disabled]="!comment().trim()" (click)="save()">
        <mat-icon>save</mat-icon> Salvar em Anotações
      </button>
    </div>
  `,
  styles: `
    .content { padding: 4px 20px 24px; }
    h2 { margin: 0 0 4px; font: 600 22px var(--heading-font); }
    .reference { margin: 0 0 12px; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; }
    blockquote {
      max-height: 24vh; overflow-y: auto; margin: 0 0 18px; padding: 12px 14px;
      border-left: 3px solid var(--accent-gold); border-radius: 0 12px 12px 0;
      background: var(--mat-sys-surface-container-low); font: 400 16px/1.6 var(--reading-font);
    }
    label { display: block; margin-bottom: 8px; color: var(--mat-sys-on-surface-variant); font: 500 14px Inter, sans-serif; }
    textarea {
      display: block; box-sizing: border-box; width: 100%; min-height: 112px; padding: 12px;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 14px;
      background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface);
      font: 400 16px/1.5 var(--reading-font); resize: vertical;
    }
    textarea:focus { outline: 2px solid var(--mat-sys-primary); outline-offset: 1px; }
    .save { width: 100%; min-height: 48px; margin-top: 16px; }
  `,
})
export class BibleNoteSheet {
  protected readonly data = inject<BibleNoteSheetData>(MAT_BOTTOM_SHEET_DATA);
  protected readonly comment = signal('');
  private readonly ref = inject(MatBottomSheetRef<BibleNoteSheet, string>);
  private readonly notes = inject(NotesService);

  protected value(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  protected save(): void {
    const comment = this.comment().trim();
    if (!comment) return;
    const note = this.notes.createBibleNote(this.data.reference, this.data.quote, this.data.versionAbbrev, comment);
    this.ref.dismiss(note.id);
  }
}
