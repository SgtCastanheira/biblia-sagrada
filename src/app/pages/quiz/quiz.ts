import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BOOKS, findBook } from '../../core/books';
import { ARTICLES, findArticle } from '../../core/library';
import { QuizService } from '../../core/quiz.service';
import { SettingsService } from '../../core/settings.service';
import { TRAILS } from '../../core/trails';

/** Jogos "Você lembra o que leu?": do capítulo, do livro todo ou de uma história. */
@Component({
  selector: 'app-quiz',
  imports: [MatIconModule],
  template: `
    <header class="page-head">
      <span class="overline">Para praticar</span>
      <h1>Você lembra o que leu?</h1>
      <p>Responda perguntas com as alternativas A, B, C e D sobre o que você leu: um capítulo e a sua história, um livro inteiro ou uma história.</p>
    </header>

    <section class="game">
      <h2><mat-icon>menu_book</mat-icon> Do capítulo <small>5 perguntas</small></h2>
      <p>Três ou quatro perguntas do texto do capítulo e, se ele tem uma história ligada, as outras são dela.</p>
      <div class="pick">
        <label>Livro
          <select [value]="book()" (change)="setBook($any($event.target).value)">
            <optgroup label="Antigo Testamento">@for (b of ot; track b.id) { <option [value]="b.id" [selected]="b.id === book()">{{ b.name }}</option> }</optgroup>
            <optgroup label="Novo Testamento">@for (b of nt; track b.id) { <option [value]="b.id" [selected]="b.id === book()">{{ b.name }}</option> }</optgroup>
          </select>
        </label>
        <label>Capítulo
          <select [value]="chapter()" (change)="chapter.set(+$any($event.target).value)">
            @for (c of chapters(); track c) { <option [value]="c" [selected]="c === chapter()">{{ c }}</option> }
          </select>
        </label>
      </div>
      <button type="button" class="go" (click)="playChapter()">Começar <mat-icon>arrow_forward</mat-icon></button>
    </section>

    <section class="game">
      <h2><mat-icon>library_books</mat-icon> Do livro todo <small>10 perguntas</small></h2>
      <p>Quem escreveu e quando, trechos de vários capítulos e as histórias do livro: não só do capítulo que você leu hoje.</p>
      <div class="pick">
        <label>Livro
          <select [value]="wholeBook()" (change)="wholeBook.set($any($event.target).value)">
            <optgroup label="Antigo Testamento">@for (b of ot; track b.id) { <option [value]="b.id" [selected]="b.id === wholeBook()">{{ b.name }}</option> }</optgroup>
            <optgroup label="Novo Testamento">@for (b of nt; track b.id) { <option [value]="b.id" [selected]="b.id === wholeBook()">{{ b.name }}</option> }</optgroup>
          </select>
        </label>
      </div>
      <button type="button" class="go" (click)="playBook()">Começar <mat-icon>arrow_forward</mat-icon></button>
    </section>

    <section class="game">
      <h2><mat-icon>auto_stories</mat-icon> Da história <small>5 perguntas</small></h2>
      <p>Datas, personagens, quem foi enviado e as ideias principais de uma história que você leu.</p>
      <div class="pick">
        <label>História
          <select [value]="story()" (change)="story.set($any($event.target).value)">
            @for (g of stories; track g.name) {
              <optgroup [label]="g.name">@for (a of g.articles; track a.id) { <option [value]="a.id" [selected]="a.id === story()">{{ a.title }}</option> }</optgroup>
            }
          </select>
        </label>
      </div>
      <button type="button" class="go" (click)="playStory()">Começar <mat-icon>arrow_forward</mat-icon></button>
    </section>

    @if (results().length) {
      <h2 class="section-title">Seus resultados</h2>
      <ul class="results">
        @for (r of results(); track r.key) {
          <li><span class="what">{{ r.label }}</span><span class="pts">{{ r.best }} de {{ r.total }}</span></li>
        }
      </ul>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .game { margin: 0 0 14px; padding: 16px; border-radius: 22px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); border-left: 5px solid var(--accent-gold); }
    .game h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 4px; font: 600 20px var(--heading-font); }
    .game h2 mat-icon { color: var(--accent-gold); }
    .game h2 small { margin-left: auto; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .game p { margin: 0 0 12px; font: 400 15px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .pick { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 12px; }
    .pick label:only-child { grid-column: 1 / -1; }
    label { display: flex; flex-direction: column; gap: 4px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    select { min-height: 48px; padding: 0 10px; border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 16px Inter, sans-serif; }
    .go { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 50px; border: 0; border-radius: 25px; cursor: pointer; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 16px Inter, sans-serif; }
    .results { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 8px; }
    .results li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 14px; border-radius: 14px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); font: 500 15px Inter, sans-serif; }
    .pts { font-weight: 700; color: var(--mat-sys-primary); }
  `,
})
export class QuizPage {
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);
  private readonly quiz = inject(QuizService);

  protected readonly ot = BOOKS.filter((b) => b.testament === 'AT');
  protected readonly nt = BOOKS.filter((b) => b.testament === 'NT');
  protected readonly stories = TRAILS.map((t) => ({
    name: t.name,
    articles: t.branches.flatMap((b) => b.ids).map((id) => findArticle(id)).filter((a): a is (typeof ARTICLES)[number] => !!a),
  })).filter((g) => g.articles.length);

  /** Começa no capítulo que a pessoa leu por último. */
  protected readonly book = signal(this.settings.lastRead()?.bookId ?? 'JHN');
  protected readonly chapter = signal(this.settings.lastRead()?.chapter ?? 3);
  protected readonly wholeBook = signal(this.settings.lastRead()?.bookId ?? 'JHN');
  protected readonly story = signal(this.stories[0]?.articles[0]?.id ?? '');
  protected readonly chapters = computed(() => Array.from({ length: findBook(this.book())?.chapters ?? 1 }, (_, i) => i + 1));

  protected readonly results = computed(() =>
    Object.entries(this.quiz.scores())
      .map(([key, s]) => ({ key, label: this.label(key), ...s }))
      .filter((r) => r.label)
      .slice(-8)
      .reverse(),
  );

  constructor() {
    inject(Title).setTitle('Você lembra o que leu? · Bíblia Sagrada');
  }

  protected setBook(id: string): void {
    this.book.set(id);
    if (this.chapter() > (findBook(id)?.chapters ?? 1)) this.chapter.set(1);
  }

  protected playChapter(): void {
    this.router.navigate(['/quiz/capitulo', this.book(), this.chapter()]);
  }

  protected playBook(): void {
    this.router.navigate(['/quiz/livro', this.wholeBook()]);
  }

  protected playStory(): void {
    if (this.story()) this.router.navigate(['/quiz/historia', this.story()]);
  }

  private label(key: string): string {
    const [kind, a, b] = key.split('-');
    if (kind === 'cap') return `${findBook(a)?.name ?? a} ${b}`;
    if (kind === 'livro') return `Livro todo: ${findBook(a)?.name ?? a}`;
    if (kind === 'his') return findArticle(key.slice(4))?.title ?? '';
    return '';
  }
}
