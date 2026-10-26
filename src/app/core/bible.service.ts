import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, Observable, of, retry, shareReplay, switchMap, throwError, timer } from 'rxjs';
import { Verse } from './models';

interface ChapterResponse {
  verses: { verse: number; text: string }[];
}

/** Livro embutido no app: capítulos → pares [versículo, texto]. */
type LocalBook = [number, string][][];

/** Versões cujo texto vem junto com o app (domínio público ou licença livre). */
export const LOCAL_VERSIONS = new Set(['almeida', 'blivre', 'nbv', 'bpm', 'blt', 'nva', 'alm1911', 'lsg']);

/** Versões que só existem embutidas (a bible-api.com não as tem): não há para onde recorrer. */
const LOCAL_ONLY = new Set(['blivre', 'nbv', 'bpm', 'blt', 'nva', 'alm1911', 'lsg']);

/** Índice gerado junto com os arquivos: quais livros de cada versão estão embutidos. */
type LocalIndex = Record<string, string[]>;

// Limite da bible-api.com: ~15 requisições a cada 30 s por IP. Ficamos abaixo disso.
const WINDOW_MS = 30_000;
const MAX_PER_WINDOW = 12;

/** Erro de limite de requisições (o navegador o reporta como status 0 por falta de CORS no 429). */
export const isRateLimit = (err: HttpErrorResponse) => err.status === 429 || (err.status === 0 && navigator.onLine);

@Injectable({ providedIn: 'root' })
export class BibleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://bible-api.com/data';
  private readonly cache = new Map<string, Observable<Verse[]>>();
  private readonly books = new Map<string, Observable<LocalBook>>();

  /**
   * Lido uma única vez. Sem o índice (ou sem o livro nele), o app usa a API direto —
   * assim não há requisições a arquivos que não existem.
   */
  private readonly localIndex = this.http.get<LocalIndex>('bible/index.json').pipe(
    catchError(() => of({} as LocalIndex)),
    shareReplay(1),
  );

  private slots: number[] = [];
  private queue: Promise<void> = Promise.resolve();

  getChapter(versionId: string, bookId: string, chapter: number): Observable<Verse[]> {
    const key = `${versionId}/${bookId}/${chapter}`;
    let request = this.cache.get(key);
    if (!request) {
      const source = LOCAL_VERSIONS.has(versionId)
        ? this.localIndex.pipe(
            switchMap((index) =>
              index[versionId]?.includes(bookId)
                ? this.fromLocal(versionId, bookId, chapter).pipe(catchError((err) => (LOCAL_ONLY.has(versionId) ? throwError(() => err) : this.fromApi(key))))
                : LOCAL_ONLY.has(versionId)
                  ? throwError(() => new HttpErrorResponse({ status: 404 }))
                  : this.fromApi(key),
            ),
          )
        : this.fromApi(key);
      request = source.pipe(
        catchError((err) => {
          this.cache.delete(key);
          return throwError(() => err);
        }),
        shareReplay(1),
      );
      this.cache.set(key, request);
    }
    return request;
  }

  /** A versão está embutida por completo (busca e uso offline total)? */
  hasLocal(versionId: string): Observable<boolean> {
    return this.localIndex.pipe(map((index) => (index[versionId]?.length ?? 0) === 66));
  }

  /** Livro inteiro (usado pela busca). Só para versões embutidas. */
  getBook(versionId: string, bookId: string): Observable<LocalBook> {
    const key = `${versionId}/${bookId}`;
    let book = this.books.get(key);
    if (!book) {
      book = this.http.get<LocalBook>(`bible/${versionId}/${bookId}.json`).pipe(
        catchError((err) => {
          this.books.delete(key);
          return throwError(() => err);
        }),
        shareReplay(1),
      );
      this.books.set(key, book);
    }
    return book;
  }

  private fromLocal(versionId: string, bookId: string, chapter: number): Observable<Verse[]> {
    return this.getBook(versionId, bookId).pipe(
      map((book) => {
        const verses = book[chapter - 1];
        if (!verses) throw new HttpErrorResponse({ status: 404 });
        return verses.map(([verse, text]) => ({ verse, text }));
      }),
    );
  }

  private fromApi(key: string): Observable<Verse[]> {
    return defer(() => from(this.reserveSlot())).pipe(
      switchMap(() => this.http.get<ChapterResponse>(`${this.apiUrl}/${key}`)),
      // Se a API limitar, espera e tenta de novo sozinho (10 s, 20 s, 30 s)
      retry({
        count: 3,
        delay: (err: HttpErrorResponse, attempt) => (isRateLimit(err) ? timer(attempt * 10_000) : throwError(() => err)),
      }),
      map((res) => res.verses.map((v) => ({ verse: v.verse, text: v.text.trim() }))),
    );
  }

  /** Fila: no máximo MAX_PER_WINDOW requisições à API a cada WINDOW_MS. */
  private reserveSlot(): Promise<void> {
    const next = this.queue.then(async () => {
      const now = Date.now();
      this.slots = this.slots.filter((t) => now - t < WINDOW_MS);
      if (this.slots.length >= MAX_PER_WINDOW) {
        const wait = this.slots[0] + WINDOW_MS - now + 250;
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
      this.slots.push(Date.now());
    });
    this.queue = next;
    return next;
  }
}
