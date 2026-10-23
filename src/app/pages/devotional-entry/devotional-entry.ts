import { BackButton } from '../../shared/back-button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { formatLong, todayKey } from '../../core/dates';
import { DEVOTIONAL_BLOCKS, DevotionalEntry, DevotionalService } from '../../core/devotional.service';
import { PassageView } from '../../shared/passage-view';
import { Sheets } from '../../shared/sheets';

@Component({
  selector: 'app-devotional-entry',
  imports: [BackButton, RouterLink, CdkTextareaAutosize, MatButtonModule, MatIconModule, PassageView],
  templateUrl: './devotional-entry.html',
  styleUrl: './devotional-entry.scss',
})
export class DevotionalEntryPage {
  /** Data AAAA-MM-DD ou "hoje". */
  readonly date = input.required<string>();

  protected readonly service = inject(DevotionalService);
  private readonly sheets = inject(Sheets);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly key = computed(() => (this.date() === 'hoje' ? todayKey() : this.date()));
  protected readonly isToday = computed(() => this.key() === todayKey());
  protected readonly entry = computed(() => this.service.entries()[this.key()] ?? this.service.entry(this.key()));
  protected readonly dateLabel = computed(() => formatLong(this.key()));

  /** Etapas escolhidas pelo usuário, numeradas depois da leitura. */
  protected readonly blocks = computed(() =>
    DEVOTIONAL_BLOCKS.filter((b) => this.service.config().blocks.includes(b.id)).map((b, i) => ({ ...b, step: i + 2 })),
  );

  protected readonly progress = computed(() => {
    const e = this.entry();
    const checks = [!!e.passage, ...this.blocks().map((b) => this.filled(e, b.id))];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  });

  protected update(patch: Partial<DevotionalEntry>): void {
    this.service.update(this.key(), patch);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected setGratitude(index: number, text: string): void {
    const gratitude = [...this.entry().gratitude];
    gratitude[index] = text;
    this.update({ gratitude });
  }

  protected configure(): void {
    this.sheets.devotionalConfig();
  }

  protected finish(): void {
    this.update({ done: !this.entry().done });
    if (this.entry().done) {
      const streak = this.service.streak();
      this.snackBar.open(
        streak > 1 ? `Devocional concluído · ${streak} dias seguidos` : 'Devocional concluído. Até amanhã!',
        undefined,
        { duration: 3000 },
      );
    }
  }

  protected async share(): Promise<void> {
    const e = this.entry();
    const parts = [
      `📖 Devocional · ${this.dateLabel()}`,
      e.passage && `Texto: ${e.passage}`,
      e.keyVerse && `“${e.keyVerse}”`,
      e.application && `O que aprendi: ${e.application}`,
      e.gratitude.some(Boolean) && `Gratidão: ${e.gratitude.filter(Boolean).join(' · ')}`,
      e.worship && `Louvor: ${e.worship}`,
    ].filter(Boolean);
    const text = parts.join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // cancelado
      }
    } else {
      await navigator.clipboard.writeText(text);
      this.snackBar.open('Devocional copiado', undefined, { duration: 2000 });
    }
  }

  private filled(e: DevotionalEntry, block: string): boolean {
    switch (block) {
      case 'observation': return !!e.observation.trim();
      case 'application': return !!e.application.trim();
      case 'prayer': return !!e.prayer.trim();
      case 'gratitude': return e.gratitude.some((g) => g.trim());
      case 'worship': return !!e.worship.trim();
      default: return true;
    }
  }
}
