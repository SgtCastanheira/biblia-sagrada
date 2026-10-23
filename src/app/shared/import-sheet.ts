import { Component, computed, inject, signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EbdService } from '../core/ebd.service';
import { hasImportData, importLesson } from '../core/lesson-import';

export interface ImportSheetData {
  lessonNumber: number;
}

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** "Colar da revista": aproveita só título e referências; o texto colado é descartado. */
@Component({
  selector: 'app-import-sheet',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="sheet-handle"></div>
    <h2 class="sheet-title">Colar da revista</h2>

    @if (!result()) {
      <p class="intro">Cole o texto da lição. O app aproveita <strong>somente o título e as referências bíblicas</strong> — o restante é descartado e não fica salvo.</p>
      <textarea placeholder="Cole aqui o texto da lição…" (input)="text.set($any($event.target).value)" aria-label="Texto da lição"></textarea>
      <div class="actions">
        <button mat-button (click)="ref.dismiss()">Cancelar</button>
        <button mat-flat-button (click)="analyze()" [disabled]="!text().trim()">Ler referências</button>
      </div>
    } @else {
      @let r = result()!;
      @if (!found()) {
        <p class="intro warn"><mat-icon>search_off</mat-icon> Não encontrei título nem referências nesse texto.</p>
        <div class="actions"><button mat-button (click)="result.set(null)">Tentar de novo</button></div>
      } @else {
        @if (r.number && r.number !== target()) {
          <p class="intro warn"><mat-icon>info</mat-icon> O texto é da <strong>Lição {{ r.number }}</strong>. Os dados serão salvos nela.</p>
        }
        <dl>
          @if (r.title) { <dt>Título</dt><dd>{{ r.title }}</dd> }
          @if (r.theme && !ebd.quarter()?.theme) { <dt>Tema do trimestre</dt><dd>{{ r.theme }}</dd> }
          @if (r.goldenText) { <dt>Texto Áureo</dt><dd>{{ r.goldenText }}</dd> }
          @if (r.reading) { <dt>Leitura Bíblica</dt><dd>{{ r.reading }}</dd> }
          @for (d of r.daily; track $index) {
            @if (d) { <dt>{{ days[$index] }}</dt><dd>{{ d }}</dd> }
          }
        </dl>
        <p class="note"><mat-icon>delete_sweep</mat-icon> O texto colado já foi descartado.</p>
        <div class="actions">
          <button mat-button (click)="result.set(null)">Voltar</button>
          <button mat-flat-button (click)="apply()">Preencher Lição {{ target() }}</button>
        </div>
      }
    }
  `,
  styles: `
    .intro { margin: -4px 20px 12px; font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .intro.warn { display: flex; align-items: center; gap: 8px; color: var(--mat-sys-on-surface); }
    .intro mat-icon { flex: none; color: var(--accent-gold); }
    textarea {
      display: block; width: calc(100% - 40px); height: 200px; margin: 0 20px; box-sizing: border-box; padding: 12px 14px; resize: none;
      border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface); font: 400 14px/1.5 Inter, sans-serif; outline: 0;
    }
    textarea:focus { border-color: var(--mat-sys-primary); }
    dl {
      display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; margin: 0 20px; padding: 14px 16px;
      border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    dt { font: 500 13px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    dd { margin: 0; font: 600 14px/1.5 Inter, sans-serif; }
    .note { display: flex; align-items: center; gap: 6px; margin: 10px 20px 0; font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .note mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 20px 20px; }
  `,
})
export class ImportSheet {
  private readonly data = inject<ImportSheetData>(MAT_BOTTOM_SHEET_DATA);
  protected readonly ref = inject(MatBottomSheetRef<ImportSheet>);
  protected readonly ebd = inject(EbdService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly days = DAY_NAMES;
  protected readonly text = signal('');
  protected readonly result = signal<ReturnType<typeof importLesson> | null>(null);
  protected readonly found = computed(() => !!this.result() && hasImportData(this.result()!));
  protected readonly target = computed(() => {
    const n = this.result()?.number;
    return n && this.ebd.lesson(n) ? n : this.data.lessonNumber;
  });

  protected analyze(): void {
    this.result.set(importLesson(this.text()));
    this.text.set(''); // o texto da revista não é guardado
  }

  protected apply(): void {
    const r = this.result();
    if (!r) return;
    const number = this.target();
    const lesson = this.ebd.lesson(number);
    if (!lesson) return;

    const daily = lesson.daily.map((current, i) => r.daily[i] ?? current);
    this.ebd.updateLesson(number, {
      ...(r.title && { title: r.title }),
      ...(r.goldenText && { goldenText: r.goldenText }),
      ...(r.reading && { reading: r.reading }),
      daily,
    });
    if (r.theme && !this.ebd.quarter()?.theme) {
      this.ebd.updateQuarter({ theme: r.theme });
    }
    this.ref.dismiss();
    this.router.navigate(['/ebd/licao', number]);
    this.snackBar.open(`Lição ${number} preenchida`, undefined, { duration: 2500 });
  }
}
