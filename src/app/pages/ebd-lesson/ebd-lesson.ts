import { BackButton } from '../../shared/back-button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { dayOfMonth, formatLong, formatWeekday } from '../../core/dates';
import { EbdLesson, EbdService } from '../../core/ebd.service';
import { BIBLE_MAPS, mapsFor } from '../../core/maps';
import { parseReferences } from '../../core/reference-parser';
import { BibleMapView } from '../../shared/bible-map';
import { PassageView } from '../../shared/passage-view';
import { LessonSupport } from '../../shared/lesson-support';
import { quarterKey } from '../../core/teaching';
import { Sheets } from '../../shared/sheets';

@Component({
  selector: 'app-ebd-lesson',
  imports: [BackButton, RouterLink, CdkTextareaAutosize, MatButtonModule, MatIconModule, MatRippleModule, PassageView, BibleMapView, LessonSupport],
  templateUrl: './ebd-lesson.html',
  styleUrl: './ebd-lesson.scss',
})
export class EbdLessonPage {
  readonly number = input.required<string>();

  protected readonly ebd = inject(EbdService);
  private readonly sheets = inject(Sheets);
  protected readonly formatLong = formatLong;
  protected readonly formatWeekday = formatWeekday;
  protected readonly dayOfMonth = dayOfMonth;

  protected readonly lesson = computed(() => this.ebd.lesson(Number(this.number())));
  protected readonly dailyDates = computed(() => {
    const lesson = this.lesson();
    return lesson ? this.ebd.dailyDates(lesson) : [];
  });
  /** Mapas dos capítulos citados na lição (texto áureo, leitura e leitura diária). */
  protected readonly maps = computed(() => {
    const l = this.lesson();
    if (!l) return [];
    const ids = new Set(
      [l.goldenText, l.reading, ...l.daily]
        .flatMap((ref) => parseReferences(ref).refs)
        .flatMap((r) => mapsFor(r.bookId, r.chapter).map((m) => m.id)),
    );
    return BIBLE_MAPS.filter((m) => ids.has(m.id));
  });
  /** Trimestre da revista ("2026-4"), para achar a aula de apoio da mesma lição. */
  protected readonly quarterKey = computed(() => {
    const q = this.ebd.quarter();
    return q ? quarterKey(q.year, q.quarter) : '';
  });
  protected readonly dailyDone = computed(() => this.lesson()?.dailyDone.filter(Boolean).length ?? 0);

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`Lição ${this.number()} · EBD`));
  }

  protected update(patch: Partial<EbdLesson>): void {
    this.ebd.updateLesson(Number(this.number()), patch);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  /** Link para abrir a primeira referência da leitura diária no leitor. */
  protected readerLink(ref: string): (string | number)[] | null {
    const first = parseReferences(ref).refs[0];
    return first ? ['/ler', first.bookId, first.chapter] : null;
  }

  protected importFromMagazine(): void {
    this.sheets.importLesson({ lessonNumber: Number(this.number()) });
  }

  protected toggleDaily(index: number): void {
    const lesson = this.lesson();
    if (lesson) this.ebd.setDaily(lesson.number, index, { done: !lesson.dailyDone[index] });
  }
}
