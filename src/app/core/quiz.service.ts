import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { BibleService } from './bible.service';
import { BOOKS, findBook } from './books';
import { ContentService } from './content.service';
import { articlesFor, articlesOfBook, findArticle } from './library';
import { bookInfoQuiz, chapterQuiz, type ChapterSource, interleave, makeRng, type QuizQuestion, shuffle, storyQuiz } from './quiz';

export interface QuizGame {
  /** Chave do jogo (para guardar a melhor pontuação). */
  key: string;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  /** Para onde voltar e o que jogar em seguida. */
  read?: { link: string[]; label: string };
  next: { label: string; link: string[] }[];
}

export interface QuizScore {
  best: number;
  total: number;
  plays: number;
}

const STORAGE_KEY = 'biblia.quiz';
/** O quiz usa sempre a Almeida embutida: funciona sem internet e com a mesma linguagem em todo lugar. */
const VERSION = 'almeida';

function load(): Record<string, QuizScore> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, QuizScore>;
  } catch {
    return {};
  }
}

/** Monta os jogos "Você lembra o que leu?": do capítulo (e da história dele), do livro todo e de uma história. */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly bible = inject(BibleService);
  private readonly content = inject(ContentService);

  readonly scores = signal<Record<string, QuizScore>>(load());

  /** Cinco perguntas sobre o capítulo; se ele tem uma história ligada, as duas últimas são dela. */
  chapter(bookId: string, chapter: number): Observable<QuizGame> {
    const book = findBook(bookId);
    const rng = this.rng(`cap-${bookId}-${chapter}`);
    if (!book) return of(this.empty('cap', 'Capítulo'));
    const story = articlesFor(bookId, chapter)[0];
    return forkJoin({
      target: this.source(bookId, chapter),
      pool: this.poolFor(bookId, chapter, rng),
      intros: this.content.bookIntros,
      md: story ? this.content.text(`artigos/${story.id}.md`) : of(null),
    }).pipe(
      map(({ target, pool, intros, md }) => {
        const own = chapterQuiz(target, pool, rng, 5);
        const tale = md && story ? storyQuiz(md, story.id, rng, 2) : [];
        const info = bookInfoQuiz(bookId, intros, rng, 3);
        // Primeiro o capítulo, depois a história; o que faltar vem das perguntas do livro
        const head = tale.length ? own.slice(0, 5 - tale.length) : own;
        const questions = interleave([[...head, ...tale], own.slice(head.length), info], 5).slice(0, 5);
        return {
          key: `cap-${bookId}-${chapter}`,
          title: `${book.name} ${chapter}`,
          subtitle: tale.length ? `3 perguntas do capítulo e 2 da história “${story!.title}”` : 'Perguntas sobre o que você leu neste capítulo',
          questions,
          read: { link: ['/ler', bookId, String(chapter)], label: `Ler ${book.name} ${chapter}` },
          next: [
            { label: `Desafio do livro todo: ${book.name}`, link: ['/quiz/livro', bookId] },
            ...(story ? [{ label: `Quiz da história: ${story.title}`, link: ['/quiz/historia', story.id] }] : []),
          ],
        };
      }),
      catchError(() => of(this.empty(`cap-${bookId}-${chapter}`, `${book.name} ${chapter}`))),
    );
  }

  /** Dez perguntas sobre o livro todo: autor e época, trechos de vários capítulos e as histórias ligadas ao livro. */
  book(bookId: string): Observable<QuizGame> {
    const book = findBook(bookId);
    const rng = this.rng(`livro-${bookId}`);
    if (!book) return of(this.empty('livro', 'Livro'));
    const picks = shuffle(Array.from({ length: book.chapters }, (_, i) => i + 1), rng).slice(0, Math.min(8, book.chapters));
    const stories = articlesOfBook(bookId);
    return forkJoin({
      chapters: forkJoin(picks.map((c) => this.source(bookId, c))),
      extra: this.otherBook(bookId, rng),
      intros: this.content.bookIntros,
      tales: stories.length ? forkJoin(stories.slice(0, 2).map((a) => this.content.text(`artigos/${a.id}.md`).pipe(map((md) => (md ? storyQuiz(md, a.id, rng, 1) : []))))) : of([] as QuizQuestion[][]),
    }).pipe(
      map(({ chapters, extra, intros, tales }) => {
        const info = bookInfoQuiz(bookId, intros, rng, 3);
        const parts = chapters.map((c, i) => chapterQuiz(c, [...chapters.filter((_, j) => j !== i).slice(0, 3), ...extra], rng, 2));
        const spread = interleave(parts, 20);
        const story = tales.flat();
        const questions = interleave([info, spread.slice(0, 5), story, spread.slice(5)], 10);
        return {
          key: `livro-${bookId}`,
          title: `Livro todo: ${book.name}`,
          subtitle: story.length ? 'Autor e época, trechos de vários capítulos e as histórias do livro' : 'Autor e época e trechos de vários capítulos',
          questions: shuffle(questions, rng),
          read: { link: ['/ler', bookId, '1'], label: `Ler ${book.name}` },
          next: [],
        };
      }),
      catchError(() => of(this.empty(`livro-${bookId}`, `Livro todo: ${book.name}`))),
    );
  }

  /** Cinco perguntas sobre uma história inteira. */
  story(articleId: string): Observable<QuizGame> {
    const article = findArticle(articleId);
    const rng = this.rng(`his-${articleId}`);
    if (!article) return of(this.empty('his', 'História'));
    return this.content.text(`artigos/${articleId}.md`).pipe(
      map((md) => ({
        key: `his-${articleId}`,
        title: article.title,
        subtitle: 'Perguntas sobre a história que você leu',
        questions: md ? storyQuiz(md, articleId, rng, 5) : [],
        read: { link: ['/artigo', articleId], label: 'Ler a história' },
        next: [] as { label: string; link: string[] }[],
      })),
      catchError(() => of(this.empty(`his-${articleId}`, article.title))),
    );
  }

  /** Guarda a pontuação do jogo (a melhor de todas e quantas vezes foi jogado). */
  record(key: string, score: number, total: number): void {
    const all = { ...this.scores() };
    const before = all[key];
    all[key] = { best: Math.max(before?.best ?? 0, score), total, plays: (before?.plays ?? 0) + 1 };
    this.scores.set(all);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // armazenamento indisponível: a pontuação vale só nesta sessão
    }
  }

  // ---------- internos ----------

  private rng(key: string) {
    // Uma semente nova a cada jogo: "jogar de novo" traz outras perguntas
    return makeRng(`${key}|${Date.now()}|${Math.random()}`);
  }

  private empty(key: string, title: string): QuizGame {
    return { key, title, subtitle: 'Não foi possível preparar as perguntas agora.', questions: [], next: [] };
  }

  private source(bookId: string, chapter: number): Observable<ChapterSource> {
    return this.bible.getChapter(VERSION, bookId, chapter).pipe(
      map((verses) => ({ bookId, chapter, verses: verses.map((v) => ({ verse: v.verse, text: v.text })) })),
      catchError(() => of({ bookId, chapter, verses: [] })),
    );
  }

  /** Outros capítulos do mesmo livro (e dois de outro livro) para as alternativas erradas parecerem do texto. */
  private poolFor(bookId: string, chapter: number, rng: () => number): Observable<ChapterSource[]> {
    const book = findBook(bookId)!;
    const others = shuffle(Array.from({ length: book.chapters }, (_, i) => i + 1).filter((c) => c !== chapter), rng).slice(0, 3);
    return forkJoin({
      same: others.length ? forkJoin(others.map((c) => this.source(bookId, c))) : of([] as ChapterSource[]),
      extra: this.otherBook(bookId, rng),
    }).pipe(map(({ same, extra }) => [...same, ...extra]));
  }

  private otherBook(bookId: string, rng: () => number): Observable<ChapterSource[]> {
    const index = BOOKS.findIndex((b) => b.id === bookId);
    const other = BOOKS[(index + 7) % BOOKS.length];
    const chapters = shuffle(Array.from({ length: other.chapters }, (_, i) => i + 1), rng).slice(0, 2);
    return forkJoin(chapters.map((c) => this.source(other.id, c)));
  }
}
