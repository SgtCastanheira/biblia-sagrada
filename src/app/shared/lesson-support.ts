import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { findBook } from '../core/books';
import { ContentService } from '../core/content.service';
import { articlesFor } from '../core/library';
import { parseReferences } from '../core/reference-parser';
import { PROGRAMS } from '../core/teaching';
import { TRIBE_CHAPTERS } from '../core/tribes';
import { fold } from '../core/dictionary';

interface SupportLink {
  icon: string;
  kind: string;
  title: string;
  link: string | (string | number)[];
  queryParams?: Record<string, string>;
  fragment?: string;
}

/** Chaves "LIVRO CAP" de todas as referências de um texto ("Ne 1.1-11; 2.1" → "NEH 1", "NEH 2"). */
export function chaptersOf(texts: string[]): Set<string> {
  const keys = new Set<string>();
  for (const text of texts) {
    for (const r of parseReferences(text ?? '').refs) keys.add(`${r.bookId} ${r.chapter}`);
  }
  return keys;
}

/**
 * Apoio ao professor de uma lição da EBD: reúne o que o app tem sobre os textos da lição
 * (aula de apoio, contexto do livro, estudos, profecias, personagens) — sem nada da revista.
 */
@Component({
  selector: 'app-lesson-support',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <div class="links">
      @for (l of links(); track l.title) {
        <a class="link" matRipple [routerLink]="l.link" [queryParams]="l.queryParams" [fragment]="l.fragment">
          <mat-icon>{{ l.icon }}</mat-icon>
          <span><small>{{ l.kind }}</small>{{ l.title }}</span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      }
    </div>
    @if (!chapters().size) {
      <p class="hint">Preencha o Texto Áureo e a Leitura Bíblica para ver aqui o material do app sobre esses textos.</p>
    }
  `,
  styles: `
    :host { display: block; }
    .links { display: flex; flex-direction: column; gap: 8px; }
    .link {
      position: relative; overflow: hidden; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 14px; text-decoration: none; color: inherit;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .link > mat-icon { color: var(--accent-gold); }
    .link span { display: flex; flex-direction: column; font: 600 15px/1.3 var(--heading-font); min-width: 0; }
    .link small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .link .go { color: var(--mat-sys-on-surface-variant); }
    .hint { margin: 8px 0 0; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class LessonSupport {
  /** Referências da lição (texto áureo, leitura, leitura diária). */
  readonly refs = input.required<string[]>();
  /** Classe da revista ("Jovens", "Adultos"…), para abrir a turma certa do apoio. */
  readonly className = input<string>('');

  private readonly content = inject(ContentService);
  private readonly people = toSignal(this.content.memorial, { initialValue: [] });
  private readonly prophecies = toSignal(this.content.prophecies, { initialValue: [] });

  protected readonly chapters = computed(() => chaptersOf(this.refs()));

  protected readonly links = computed<SupportLink[]>(() => {
    const chapters = this.chapters();
    const touches = (texts: string[]) => [...chaptersOf(texts)].some((k) => chapters.has(k));
    const program = PROGRAMS.ebd;
    const turma = program.classes.find((c) => fold(c.name) === fold(this.className()))?.id;
    const out: SupportLink[] = [];

    // Aulas de apoio da EBD sobre os mesmos textos
    for (const l of program.lessons.filter((x) => touches([x.refs, x.memoryVerse]))) {
      out.push({ icon: 'school', kind: l.example ? 'Aula de apoio (modelo)' : 'Aula de apoio', title: l.title, link: [program.path, 'aula', l.id], queryParams: turma ? { turma } : undefined });
    }
    if (!chapters.size) {
      out.push({ icon: 'volunteer_activism', kind: 'Apoio ao professor', title: 'Adolescentes, Jovens e Adultos', link: turma ? [program.path, turma] : program.path });
      return out;
    }

    // Contexto de cada livro citado
    const books = [...new Set([...chapters].map((k) => k.split(' ')[0]))];
    for (const id of books) {
      const book = findBook(id);
      if (book) out.push({ icon: 'info', kind: 'Contexto histórico', title: `Quem escreveu ${book.name}, quando e para quem`, link: ['/livro', id], fragment: 'contexto' });
    }
    // Estudos dos capítulos
    const articles = new Map<string, { id: string; title: string; collection: string }>();
    for (const k of chapters) {
      const [book, ch] = k.split(' ');
      for (const a of articlesFor(book, Number(ch))) articles.set(a.id, a);
    }
    for (const a of articles.values()) out.push({ icon: 'menu_book', kind: a.collection === 'contexto' ? 'Aula de contexto' : 'Estudo', title: a.title, link: ['/artigo', a.id] });
    if ([...chapters].some((k) => TRIBE_CHAPTERS.includes(k))) out.push({ icon: 'groups', kind: 'Estudo', title: 'As doze tribos de Israel', link: '/tribos' });

    // Profecias e personagens dos mesmos capítulos
    for (const p of this.prophecies().filter((p) => touches([p.ref, ...p.fulfillment.map((f) => f.ref)])).slice(0, 4)) {
      out.push({ icon: 'visibility', kind: 'Profecia', title: p.title, link: ['/profecias', p.id] });
    }
    for (const p of this.people().filter((p) => touches([p.keyVerse, ...p.refs])).slice(0, 6)) {
      out.push({ icon: 'military_tech', kind: 'Personagem', title: p.name, link: ['/memorial', p.id] });
    }

    out.push({ icon: 'volunteer_activism', kind: 'Apoio ao professor', title: turma ? `Turma de ${program.classes.find((c) => c.id === turma)!.name}` : 'Adolescentes, Jovens e Adultos', link: turma ? [program.path, turma] : program.path });
    return out;
  });
}
