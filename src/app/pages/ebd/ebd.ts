import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { dayOfMonth, formatLong, formatMonth, todayKey } from '../../core/dates';
import { CPAD_URL, currentQuarter, EBD_CLASSES, EbdService, firstSunday } from '../../core/ebd.service';

@Component({
  selector: 'app-ebd',
  imports: [
    RouterLink, FormsModule, MatButtonModule, MatButtonToggleModule, MatRippleModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatMenuModule, MatSelectModule, MatSlideToggleModule,
  ],
  templateUrl: './ebd.html',
  styleUrl: './ebd.scss',
})
export class EbdPage {
  protected readonly ebd = inject(EbdService);
  protected readonly classes = EBD_CLASSES;
  protected readonly cpadUrl = CPAD_URL;
  protected readonly formatLong = formatLong;
  protected readonly formatMonth = formatMonth;
  protected readonly dayOfMonth = dayOfMonth;
  protected readonly todayKey = todayKey();

  // Formulário de novo trimestre
  protected readonly year = signal(currentQuarter().year);
  protected readonly quarterNumber = signal(currentQuarter().quarter);
  protected readonly className = signal('Jovens');
  protected readonly theme = signal('');
  protected readonly startDate = signal(firstSunday(currentQuarter().year, currentQuarter().quarter));

  protected readonly statusLabel = { done: 'Concluída', today: 'Hoje', next: 'Próxima', past: '', future: '' };

  protected readonly filledCount = computed(() => this.ebd.lessons().filter((l) => l.title || l.reading).length);

  protected setQuarter(year: number, quarter: number): void {
    this.year.set(year);
    this.quarterNumber.set(quarter);
    this.startDate.set(firstSunday(year, quarter));
  }

  protected create(): void {
    this.ebd.createQuarter(this.year(), this.quarterNumber(), this.className(), this.theme(), this.startDate());
  }

  protected reset(): void {
    if (confirm('Apagar este trimestre e todas as anotações dele?')) {
      this.ebd.deleteQuarter();
    }
  }
}
