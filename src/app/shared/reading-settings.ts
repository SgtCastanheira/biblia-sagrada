import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { ReadingFont, ThemeMode } from '../core/models';
import { SettingsService } from '../core/settings.service';

/** Controles de aparência da leitura (tema, fonte, tamanho, espaçamento). */
@Component({
  selector: 'app-reading-settings',
  imports: [MatIconModule, MatSliderModule],
  template: `
    <p class="label">Tema</p>
    <div class="themes">
      @for (t of themes; track t.id) {
        <button class="theme" [class]="'theme ' + t.id" [class.active]="settings.theme() === t.id" (click)="settings.theme.set(t.id)">
          <span class="sample">Aa</span>
          <span>{{ t.label }}</span>
        </button>
      }
    </div>

    <p class="label">Versículos</p>
    <div class="layouts">
      <button class="layout" [class.active]="settings.verseLayout() === 'lines'" (click)="settings.verseLayout.set('lines')">
        <mat-icon>format_list_numbered</mat-icon> Um por linha
      </button>
      <button class="layout" [class.active]="settings.verseLayout() === 'paragraph'" (click)="settings.verseLayout.set('paragraph')">
        <mat-icon>notes</mat-icon> Texto corrido
      </button>
    </div>

    <p class="label">Estudo no texto</p>
    <div class="layouts">
      <button class="layout" [class.active]="settings.studyWords()" [attr.aria-pressed]="settings.studyWords()"
              (click)="settings.studyWords.set(!settings.studyWords())">
        <mat-icon>translate</mat-icon> Dicionário
      </button>
      <button class="layout" [class.active]="settings.studyNotes()" [attr.aria-pressed]="settings.studyNotes()"
              (click)="settings.studyNotes.set(!settings.studyNotes())">
        <mat-icon>local_library</mat-icon> Painel de estudo
      </button>
    </div>

    <p class="label">Fonte</p>
    <div class="fonts">
      @for (f of fonts; track f.id) {
        <button class="font" [class.active]="settings.font() === f.id" [style.font-family]="f.family" (click)="settings.font.set(f.id)">
          {{ f.label }}
        </button>
      }
    </div>

    <p class="label">Tamanho do texto <span>{{ settings.fontSize() }}px</span></p>
    <div class="slider-row">
      <mat-icon>text_decrease</mat-icon>
      <mat-slider min="13" max="34" step="1" discrete>
        <input matSliderThumb [value]="settings.fontSize()" (valueChange)="settings.fontSize.set($event)" aria-label="Tamanho do texto" />
      </mat-slider>
      <mat-icon>text_increase</mat-icon>
    </div>

    <p class="label">Espaçamento entre linhas</p>
    <div class="slider-row">
      <mat-icon>density_small</mat-icon>
      <mat-slider min="1.4" max="2.4" step="0.05">
        <input matSliderThumb [value]="settings.lineHeight()" (valueChange)="settings.lineHeight.set($event)" aria-label="Espaçamento" />
      </mat-slider>
      <mat-icon>density_large</mat-icon>
    </div>

    <p class="preview reading-font" [style.font-size.px]="settings.fontSize()" [style.line-height]="settings.lineHeight()">
      <sup>1</sup>No princípio criou Deus os céus e a terra.
    </p>
  `,
  styles: `
    :host { display: block; }
    .label { display: flex; justify-content: space-between; font: var(--mat-sys-label-large); color: var(--mat-sys-on-surface-variant); margin: 20px 0 10px; }
    .label span { color: var(--mat-sys-primary); font-weight: 600; }
    .themes, .fonts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .layouts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .layout {
      display: flex; align-items: center; justify-content: center; gap: 8px; height: 46px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 14px; background: var(--mat-sys-surface-container-low);
      color: inherit; font: 500 14px Inter, sans-serif;
    }
    .layout mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--mat-sys-primary); }
    .theme, .font {
      border: 1px solid var(--mat-sys-outline-variant); border-radius: 14px; cursor: pointer; padding: 10px 6px;
      display: flex; flex-direction: column; align-items: center; gap: 4px; font: var(--mat-sys-label-medium);
    }
    .theme.light { background: #faf8f5; color: #23211e; }
    .theme.sepia { background: #f4ecdc; color: #3b3024; }
    .theme.dark { background: #161514; color: #ece8e2; }
    .sample { font: 600 20px 'Source Serif 4', serif; }
    .font { background: var(--mat-sys-surface-container-low); color: inherit; font-size: 15px; padding: 14px 6px; }
    .active { border-color: var(--mat-sys-primary); box-shadow: inset 0 0 0 1px var(--mat-sys-primary); }
    .slider-row { display: flex; align-items: center; gap: 4px; color: var(--mat-sys-on-surface-variant); }
    mat-slider { flex: 1; }
    .preview { margin: 16px 0 0; padding: 14px 16px; border-radius: 14px; border: 1px dashed var(--mat-sys-outline-variant); }
    sup { font: 600 .6em Inter, sans-serif; color: var(--mat-sys-primary); margin-right: 4px; }
  `,
})
export class ReadingSettings {
  protected readonly settings = inject(SettingsService);
  protected readonly themes: { id: ThemeMode; label: string }[] = [
    { id: 'light', label: 'Claro' },
    { id: 'sepia', label: 'Sépia' },
    { id: 'dark', label: 'Escuro' },
  ];
  protected readonly fonts: { id: ReadingFont; label: string; family: string }[] = [
    { id: 'serif', label: 'Source Serif', family: "'Source Serif 4', serif" },
    { id: 'classic', label: 'Lora', family: 'Lora, serif' },
    { id: 'sans', label: 'Inter', family: 'Inter, sans-serif' },
  ];
}

@Component({
  selector: 'app-reading-settings-sheet',
  imports: [ReadingSettings],
  template: `
    <div class="sheet-handle"></div>
    <h2 class="sheet-title">Aparência da leitura</h2>
    <app-reading-settings />
  `,
  styles: `app-reading-settings { padding: 0 20px 24px; margin-top: -12px; }`,
})
export class ReadingSettingsSheet {}
