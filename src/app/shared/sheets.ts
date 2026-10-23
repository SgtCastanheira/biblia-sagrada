import { inject, Injectable } from '@angular/core';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { firstValueFrom } from 'rxjs';
import { ChapterSheet, ChapterSheetData } from './chapter-sheet';
import { DevotionalConfigSheet } from './devotional-config-sheet';
import { DictionarySheet } from './dictionary-sheet';
import { ImportSheet, ImportSheetData } from './import-sheet';
import { PassageSheet } from './passage-sheet';
import { ReadingSettingsSheet } from './reading-settings';
import { VersionSheet, VersionSheetData } from './version-sheet';
import { VerseSheet, VerseSheetData } from './verse-sheet';

/** Atalhos para abrir os painéis inferiores do app com o mesmo visual. */
@Injectable({ providedIn: 'root' })
export class Sheets {
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly config: MatBottomSheetConfig = { panelClass: 'app-sheet', autoFocus: false };

  pickVersion(data: VersionSheetData): Promise<string | undefined> {
    const ref = this.bottomSheet.open(VersionSheet, { ...this.config, data });
    return firstValueFrom(ref.afterDismissed());
  }

  verseActions(data: VerseSheetData): void {
    this.bottomSheet.open(VerseSheet, { ...this.config, data });
  }

  chapters(data: ChapterSheetData): void {
    this.bottomSheet.open(ChapterSheet, { ...this.config, data });
  }

  importLesson(data: ImportSheetData): void {
    this.bottomSheet.open(ImportSheet, { ...this.config, data });
  }

  devotionalConfig(): void {
    this.bottomSheet.open(DevotionalConfigSheet, this.config);
  }

  /** Texto de uma referência citada num estudo ("Jo 3.16"). */
  passage(refs: string): void {
    this.bottomSheet.open(PassageSheet, { ...this.config, data: refs });
  }

  /** Verbete do dicionário. */
  dictionary(entryId: string, verse?: { bookId: string; chapter: number; verse: number }): void {
    this.bottomSheet.open(DictionarySheet, { ...this.config, data: { id: entryId, verse } });
  }

  readingSettings(): void {
    this.bottomSheet.open(ReadingSettingsSheet, this.config);
  }
}
