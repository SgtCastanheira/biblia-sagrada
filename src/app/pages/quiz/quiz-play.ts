import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { findBook } from '../../core/books';
import { QuizGame, QuizService } from '../../core/quiz.service';
import { BackButton } from '../../shared/back-button';
import { Sheets } from '../../shared/sheets';

const LETTERS = ['A', 'B', 'C', 'D'];

/** O jogo "Você lembra o que leu?": uma pergunta por vez, com as alternativas A, B, C e D e a explicação de cada resposta. */
@Component({
  selector: 'app-quiz-play',
  imports: [RouterLink, MatIconModule, BackButton],
  template: `
    <div class="top"><app-back [fallback]="backLink()" label="Voltar" /></div>
    @if (game(); as g) {
      <header class="head">
        <span class="overline">Você lembra o que leu?</span>
        <h1>{{ g.title }}</h1>
        <p>{{ g.subtitle }}</p>
      </header>

      @if (!g.questions.length) {
        <p class="empty">Ainda não há perguntas para isto. Leia um pouco mais e volte, ou escolha outro capítulo ou história.</p>
        <a class="btn" routerLink="/quiz">Escolher outro jogo</a>
      } @else if (!finished()) {
        <div class="segments" aria-hidden="true">
          @for (q of g.questions; track $index) { <span [class.done]="$index < index()" [class.now]="$index === index()"></span> }
        </div>
        <p class="count" aria-live="polite">Pergunta {{ index() + 1 }} de {{ g.questions.length }}</p>

        <section class="card" [attr.aria-label]="'Pergunta ' + (index() + 1)">
          <p class="text">{{ q().text }}</p>
          <ul class="options">
            @for (o of q().options; track $index) {
              <li>
                <button type="button" class="option" [disabled]="picked() !== null" (click)="pick($index)"
                  [class.right]="picked() !== null && $index === q().answer" [class.wrong]="picked() === $index && $index !== q().answer">
                  <span class="letter">{{ letters[$index] }}</span>
                  <span class="label">{{ o }}</span>
                  @if (picked() !== null && $index === q().answer) { <span class="mark"><mat-icon>check_circle</mat-icon><span class="sr">Resposta certa</span></span> }
                  @if (picked() === $index && $index !== q().answer) { <span class="mark"><mat-icon>cancel</mat-icon><span class="sr">Sua resposta, errada</span></span> }
                </button>
              </li>
            }
          </ul>
        </section>

        @if (picked() !== null) {
          <aside class="explain" [class.ok]="picked() === q().answer" role="status">
            <strong>{{ picked() === q().answer ? 'Certo!' : 'Não foi essa.' }}</strong>
            <span>{{ q().explain }}</span>
            <span class="links">
              @if (q().ref; as r) { <button type="button" (click)="open(r.bookId, r.chapter, r.verse)"><mat-icon>menu_book</mat-icon> Ver no texto</button> }
              @if (q().article; as a) { <a [routerLink]="['/artigo', a]"><mat-icon>auto_stories</mat-icon> Ler a história</a> }
            </span>
          </aside>
          <button type="button" class="btn primary" (click)="next()">{{ index() + 1 === g.questions.length ? 'Ver o resultado' : 'Próxima pergunta' }}</button>
        }
      } @else {
        <section class="result" aria-live="polite">
          <div class="score"><strong>{{ score() }}</strong> de {{ g.questions.length }}</div>
          <div class="stars" aria-hidden="true">
            @for (s of [1, 2, 3]; track s) { <mat-icon [class.on]="s <= stars()">star</mat-icon> }
          </div>
          <p class="msg">{{ message() }}</p>
          @if (best(); as b) { <p class="best">Seu melhor resultado aqui: {{ b.best }} de {{ b.total }} · jogado {{ b.plays }} {{ b.plays === 1 ? 'vez' : 'vezes' }}</p> }
        </section>

        @if (missed().length) {
          <h2 class="section-title">Para rever</h2>
          <ul class="review">
            @for (m of missed(); track m.q.id) {
              <li><span class="rq">{{ m.q.text }}</span><span class="ra"><mat-icon>check</mat-icon> {{ m.q.options[m.q.answer] }}</span></li>
            }
          </ul>
        }

        <div class="actions">
          <button type="button" class="btn primary" (click)="again()"><mat-icon>replay</mat-icon> Jogar de novo, com outras perguntas</button>
          @if (g.read; as r) { <a class="btn" [routerLink]="r.link"><mat-icon>menu_book</mat-icon> {{ r.label }}</a> }
          @for (n of g.next; track n.label) { <a class="btn" [routerLink]="n.link"><mat-icon>quiz</mat-icon> {{ n.label }}</a> }
          <a class="btn" routerLink="/quiz"><mat-icon>apps</mat-icon> Outros jogos</a>
        </div>
      }
    } @else {
      <p class="loading" role="status">Preparando as perguntas…</p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .head h1 { margin: 2px 0 4px; }
    .head p { margin: 0; color: var(--mat-sys-on-surface-variant); }
    .segments { display: flex; gap: 4px; margin: 14px 0 4px; }
    .segments span { flex: 1; height: 5px; border-radius: 3px; background: var(--mat-sys-outline-variant); }
    .segments .done { background: var(--accent-gold); opacity: .6; }
    .segments .now { background: var(--accent-gold); }
    .count { margin: 6px 2px 10px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--accent-gold); }
    .card { padding: 18px 16px 14px; border-radius: 24px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    .text { margin: 0 0 14px; white-space: pre-line; font: 500 19px/1.5 var(--reading-font); }
    .options { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .option { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 8px 14px 8px 10px; border-radius: 16px; cursor: pointer; text-align: left; color: var(--mat-sys-on-surface); background: var(--mat-sys-surface); border: 2px solid var(--mat-sys-outline-variant); font: 500 16px/1.35 Inter, sans-serif; }
    .option:not(:disabled):hover { border-color: var(--mat-sys-primary); }
    .option:disabled { cursor: default; }
    .letter { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; font: 700 15px Inter, sans-serif; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .option.right { border-color: var(--mat-sys-primary); background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .option.right .letter { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .option.wrong { border-color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 16%, var(--mat-sys-surface)); }
    .option.wrong .letter { background: var(--accent-gold); color: #1d1608; }
    .mark mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    .explain { display: flex; flex-direction: column; gap: 6px; margin: 14px 0 10px; padding: 12px 14px; border-radius: 16px; background: var(--mat-sys-surface-container); font: 400 15px/1.5 Inter, sans-serif; border-left: 5px solid var(--accent-gold); }
    .explain.ok { border-left-color: var(--mat-sys-primary); }
    .explain strong { font: 700 16px Inter, sans-serif; }
    .links { display: flex; flex-wrap: wrap; gap: 6px 14px; }
    .links button, .links a { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: none; }
    .links mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 20px; border-radius: 26px; cursor: pointer; text-decoration: none; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-primary); font: 600 15px Inter, sans-serif; }
    .btn.primary { width: 100%; background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .result { display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 10px 0 6px; padding: 22px 16px; border-radius: 26px; text-align: center; background: linear-gradient(165deg, #2f4a3d, #1b2b23 80%); color: #fff8ec; }
    .score { font: 400 20px var(--heading-font); }
    .score strong { font: 600 56px/1 var(--heading-font); color: #e8c085; }
    .stars mat-icon { width: 34px; height: 34px; font-size: 34px; color: rgba(255, 248, 236, .3); }
    .stars mat-icon.on { color: #e8c085; font-variation-settings: 'FILL' 1; }
    .msg { margin: 6px 0 0; font: 500 17px/1.4 var(--reading-font); }
    .best { margin: 4px 0 0; font: 500 13px Inter, sans-serif; color: #eadfcb; }
    .review { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 8px; }
    .review li { display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: 14px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    .rq { white-space: pre-line; font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .ra { display: flex; align-items: center; gap: 6px; font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    .ra mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .actions { display: grid; gap: 10px; margin: 16px 0 8px; }
    .loading, .empty { padding: 16px; border-radius: 16px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface-variant); }
  `,
})
export class QuizPlayPage {
  /** Vem da rota: "capitulo", "livro" ou "historia". */
  readonly kind = input<'capitulo' | 'livro' | 'historia'>('capitulo');
  readonly book = input<string>();
  readonly chapter = input<string>();
  readonly id = input<string>();

  private readonly quiz = inject(QuizService);
  private readonly sheets = inject(Sheets);
  protected readonly letters = LETTERS;

  /** Muda a cada "jogar de novo", para buscar outras perguntas. */
  private readonly round = signal(0);

  protected readonly game = toSignal(
    toObservable(computed(() => ({ kind: this.kind(), book: this.book(), chapter: this.chapter(), id: this.id(), round: this.round() }))).pipe(
      switchMap(({ kind, book, chapter, id }) => {
        if (kind === 'livro' && book) return this.quiz.book(book);
        if (kind === 'historia' && id) return this.quiz.story(id);
        if (book && chapter) return this.quiz.chapter(book, Number(chapter));
        return of(undefined as QuizGame | undefined);
      }),
    ),
  );

  protected readonly index = signal(0);
  protected readonly picked = signal<number | null>(null);
  private readonly answers = signal<number[]>([]);
  protected readonly finished = signal(false);

  protected readonly q = computed(() => this.game()!.questions[this.index()]);
  protected readonly score = computed(() => this.answers().filter((a, i) => a === this.game()?.questions[i]?.answer).length);
  protected readonly missed = computed(() => (this.game()?.questions ?? []).map((q, i) => ({ q, a: this.answers()[i] })).filter((x) => x.a !== x.q.answer));
  protected readonly stars = computed(() => {
    const n = this.game()?.questions.length || 1;
    const r = this.score() / n;
    return r >= 0.99 ? 3 : r >= 0.6 ? 2 : r > 0 ? 1 : 0;
  });
  protected readonly best = computed(() => {
    const g = this.game();
    return g ? this.quiz.scores()[g.key] : undefined;
  });
  protected readonly message = computed(() => {
    const r = this.score() / (this.game()?.questions.length || 1);
    if (r >= 0.99) return 'Você leu com muita atenção. Parabéns!';
    if (r >= 0.6) return 'Muito bem! Você lembra bastante do que leu.';
    if (r > 0) return 'Foi um bom começo. Reler com calma ajuda a fixar.';
    return 'Que tal reler e tentar de novo? A segunda vez costuma ir melhor.';
  });
  protected readonly backLink = computed(() => (this.kind() === 'historia' ? `/artigo/${this.id() ?? ''}` : this.book() ? `/ler/${this.book()}/${this.chapter() ?? 1}` : '/quiz'));

  constructor() {
    const title = inject(Title);
    // Um jogo novo começa na primeira pergunta
    effect(() => {
      const g = this.game();
      this.index.set(0);
      this.picked.set(null);
      this.answers.set([]);
      this.finished.set(false);
      if (g) title.setTitle(`Você lembra o que leu? ${g.title} · Bíblia Sagrada`);
    });
  }

  protected pick(i: number): void {
    if (this.picked() !== null) return;
    this.picked.set(i);
    this.answers.update((a) => [...a, i]);
  }

  protected next(): void {
    const g = this.game()!;
    if (this.index() + 1 >= g.questions.length) {
      this.finished.set(true);
      this.quiz.record(g.key, this.score(), g.questions.length);
      return;
    }
    this.index.update((n) => n + 1);
    this.picked.set(null);
  }

  protected again(): void {
    this.round.update((n) => n + 1);
  }

  protected open(bookId: string, chapter: number, verse: number): void {
    const b = findBook(bookId);
    if (b) this.sheets.passage(`${b.abbrev} ${chapter}.${verse}`);
  }
}
