import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { dayOfMonth, formatLong, formatWeekday } from '../../core/dates';
import { DevotionalService } from '../../core/devotional.service';
import { Sheets } from '../../shared/sheets';

@Component({
  selector: 'app-devotional',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './devotional.html',
  styleUrl: './devotional.scss',
})
export class DevotionalPage {
  protected readonly service = inject(DevotionalService);
  private readonly sheets = inject(Sheets);
  protected readonly formatLong = formatLong;
  protected readonly formatWeekday = formatWeekday;
  protected readonly dayOfMonth = dayOfMonth;
  protected readonly newPrayer = signal('');
  protected readonly showAnswered = signal(false);

  protected configure(): void {
    this.sheets.devotionalConfig();
  }

  protected addPrayer(): void {
    this.service.addPrayer(this.newPrayer());
    this.newPrayer.set('');
  }

  protected removePrayer(id: string): void {
    if (confirm('Excluir este pedido de oração?')) this.service.removePrayer(id);
  }
}
