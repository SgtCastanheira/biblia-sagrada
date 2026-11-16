import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import { chapterAt, type Span } from '../../core/bible-connections';
import { connectionPassages, type ConnectionPassage, type ReferenceBook } from './connection-passages';

export interface PairsResult {
  failed: boolean;
  pairs: ConnectionPassage[];
}

/** Carrega, uma vez só, as referências por livro e cruza os dois lados de uma ligação (cartões e mapa mental usam o mesmo). */
@Injectable({ providedIn: 'root' })
export class ConnectionReferences {
  private readonly http = inject(HttpClient);
  private readonly books = new Map<string, Observable<ReferenceBook | null>>();

  /** As referências de um livro; null se não vieram (e a próxima chamada tenta de novo). */
  book(id: string): Observable<ReferenceBook | null> {
    let request = this.books.get(id);
    if (!request) {
      request = this.http.get<ReferenceBook>(`bible/referencias/${id}.json`).pipe(
        catchError(() => { this.books.delete(id); return of(null); }),
        shareReplay(1),
      );
      this.books.set(id, request);
    }
    return request;
  }

  /** Os pares de versículos que ligam a passagem em foco a um capítulo. */
  pairs(span: Span, target: number): Observable<PairsResult> {
    return combineLatest([this.book(chapterAt(span.from).book.id), this.book(chapterAt(target).book.id)]).pipe(
      map(([source, destination]) => ({
        failed: !source || !destination,
        pairs: source && destination ? connectionPassages(span, target, source, destination) : [],
      })),
    );
  }
}
