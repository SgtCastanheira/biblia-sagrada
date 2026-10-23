import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';
import { bookOfRef, inBibleOrder, positionOfChapter, positionOfRef } from './bible-order';
import { BOOKS } from './books';
import { ContentService } from './content.service';
import { CURIOSITIES_IN_ORDER, Curiosity } from './curiosities';
import { Article, articlesOfBook } from './library';
import { BibleMap, MAPS_IN_ORDER } from './maps';
import { Person } from './memorial';
import { Prophecy } from './prophecy';

/** Tudo o que o app tem para estudar um livro da Bíblia. */
export interface BookMaterials {
  bookId: string;
  intro: boolean;
  /** Capítulos com notas de estudo. */
  notes: number[];
  maps: BibleMap[];
  articles: Article[];
  prophecies: Prophecy[];
  people: Person[];
  curiosities: Curiosity[];
  total: number;
}

/** Índice do material de estudo organizado pela ordem da Bíblia, livro a livro. */
@Injectable({ providedIn: 'root' })
export class StudyIndexService {
  private readonly content = inject(ContentService);

  readonly byBook: Observable<Map<string, BookMaterials>> = combineLatest([
    this.content.bookIntros,
    this.content.chapterNotes,
    this.content.prophecies,
    this.content.memorial,
  ]).pipe(
    map(([intros, notes, prophecies, people]) => {
      const index = new Map<string, BookMaterials>();
      for (const book of BOOKS) {
        const m: BookMaterials = {
          bookId: book.id,
          intro: !!intros[book.id],
          notes: Object.keys(notes)
            .filter((k) => k.startsWith(`${book.id} `))
            .map((k) => Number(k.split(' ')[1]))
            .sort((a, b) => a - b),
          maps: MAPS_IN_ORDER.filter((mp) => mp.chapters.some((c) => c.startsWith(`${book.id} `))),
          articles: inBibleOrder(articlesOfBook(book.id), (a) => Math.min(...a.passages!.map(positionOfChapter))),
          prophecies: inBibleOrder(prophecies.filter((p) => bookOfRef(p.ref) === book.id), (p) => positionOfRef(p.ref)),
          // O personagem fica no livro onde a sua história começa (primeira passagem)
          people: people.filter((p) => bookOfRef(p.refs[0]) === book.id),
          curiosities: CURIOSITIES_IN_ORDER.filter((c) => c.refs[0]?.bookId === book.id),
          total: 0,
        };
        m.total = m.notes.length + m.maps.length + m.articles.length + m.prophecies.length + m.people.length + m.curiosities.length + (m.intro ? 1 : 0);
        index.set(book.id, m);
      }
      return index;
    }),
    shareReplay(1),
  );

  forBook(bookId: string): Observable<BookMaterials | undefined> {
    return this.byBook.pipe(map((all) => all.get(bookId)));
  }
}
