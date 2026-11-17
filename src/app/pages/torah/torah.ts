import { Component, computed, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { findBook } from '../../core/books';
import { SettingsService } from '../../core/settings.service';
import { COMBINED, parashaRange, type Parasha, parashotOf, TORAH_BOOKS } from '../../core/torah';
import { BackButton } from '../../shared/back-button';
import { SourcesBox } from '../../shared/sources-box';

/** A Torá: os cinco livros de Moisés e as 54 porções da leitura semanal, com o texto da Almeida a um toque. */
@Component({
  selector: 'app-torah',
  imports: [BackButton, RouterLink, MatIconModule, MatRippleModule, SourcesBox],
  template: `
    <header class="hero">
      <app-back class="back" fallback="/livros" />
      <span class="kicker">Os cinco livros de Moisés</span>
      <h1>A Torá <span class="he" lang="he" dir="rtl">תורה</span></h1>
      <p class="lead">
        <em>Torá</em> quer dizer “instrução”, “ensino”. É o nome que os judeus dão a Gênesis, Êxodo, Levítico, Números e Deuteronômio, e que a nossa Bíblia traduz
        por “lei”. Na sinagoga, a Torá é lida em sequência, uma <strong>porção</strong> (<em>parashá</em>) por semana, e o ciclo todo tem 54 porções.
      </p>
      <p class="count">{{ read() }} de {{ chapters }} capítulos lidos</p>
      <div class="progress" role="img" [attr.aria-label]="read() + ' de ' + chapters + ' capítulos lidos'"><span [style.width.%]="(read() / chapters) * 100"></span></div>
      <div class="actions">
        <a class="start" matRipple [routerLink]="['/ler', next().book, next().chapter]">
          <mat-icon>play_arrow</mat-icon>{{ read() ? 'Continuar' : 'Começar' }} em {{ next().label }}
        </a>
        <a class="ghost" matRipple routerLink="/artigo/tora"><mat-icon>auto_stories</mat-icon> A história da Torá</a>
      </div>
    </header>

    <details class="how">
      <summary><mat-icon>info</mat-icon> Como os judeus leem a Torá</summary>
      <ul>
        <li>A leitura começa e termina na festa da <strong>Simchat Torá</strong> (“alegria da Torá”), logo depois da Festa dos Tabernáculos: lê-se o fim de Deuteronômio e, em seguida, o começo de Gênesis.</li>
        <li>Cada porção leva o nome das suas <strong>primeiras palavras</strong> em hebraico: Gênesis, por exemplo, é <em>Bereshit</em>, “no princípio”.</li>
        <li>Em alguns anos, <strong>sete pares de porções</strong> são lidos juntos, para o ciclo caber no número de semanas: {{ combined }}.</li>
        <li>O texto é lido de um <strong>rolo escrito à mão</strong>, em hebraico. Para ler o hebraico aqui, toque na sigla da versão no alto do capítulo e escolha “Bíblia hebraica (Delitzsch)”.</li>
        <li>Os limites das porções são os da divisão tradicional, na numeração da nossa Bíblia. Em alguns versículos a Bíblia hebraica numera de outro jeito (Gênesis 32.1, por exemplo, é o 31.55 da Almeida), e os números aqui já estão ajustados.</li>
      </ul>
    </details>

    @for (book of books; track book.id) {
      <section class="book">
        <header>
          <span class="b-he" lang="he" dir="rtl">{{ book.he }}</span>
          <h2>{{ book.pt }} <small>{{ book.name }} · “{{ book.meaning }}”</small></h2>
          <p>{{ book.theme }} {{ book.origin }}</p>
          <a class="whole" matRipple [routerLink]="['/livro', book.id]">Ver o livro inteiro · {{ chaptersOf(book.id) }} capítulos</a>
        </header>
        <ol>
          @for (p of portions(book.id); track p.n) {
            <li>
              <a matRipple [routerLink]="['/ler', p.book, p.from[0]]" [fragment]="p.from[1] > 1 ? 'v' + p.from[1] : undefined">
                <span class="n">{{ p.n }}</span>
                <span class="body">
                  <span class="name"><span class="he" lang="he" dir="rtl">{{ p.he }}</span> {{ p.name }} <small>“{{ p.meaning }}”</small></span>
                  <span class="refs">{{ range(p) }}</span>
                  <span class="summary">{{ p.summary }}</span>
                </span>
              </a>
            </li>
          }
        </ol>
      </section>
    }

    <aside class="more">
      <a matRipple routerLink="/talmude"><mat-icon>menu_book</mat-icon><span><strong>O Talmude</strong>A Torá oral, que explica a escrita: a Mishná e a Guemará.</span><mat-icon class="go">arrow_forward</mat-icon></a>
      <a matRipple routerLink="/artigo/biblia-judaica"><mat-icon>history_edu</mat-icon><span><strong>A Bíblia dos Judeus</strong>Lei, Profetas e Escritos: como era a Bíblia no tempo de Jesus.</span><mat-icon class="go">arrow_forward</mat-icon></a>
    </aside>
    <app-sources topic="tora" />
  `,
  styles: `
    :host { display: block; }
    .hero {
      position: relative; padding: 52px 22px 22px; border-radius: 24px; margin-top: 4px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); box-shadow: var(--shadow-soft);
    }
    .back { position: absolute; top: 6px; left: 6px; color: var(--mat-sys-on-surface-variant); }
    .kicker { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); }
    h1 { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; font: 600 38px/1.1 var(--heading-font); letter-spacing: -.4px; margin: 6px 0 10px; }
    .he { font-family: 'Frank Ruhl Libre', 'Noto Serif Hebrew', 'Times New Roman', serif; font-weight: 400; color: var(--accent-gold); }
    h1 .he { font-size: 34px; }
    .lead { margin: 0 0 14px; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .count { margin: 4px 0 8px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .progress { height: 4px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); overflow: hidden; margin-bottom: 16px; }
    .progress span { display: block; height: 100%; background: var(--mat-sys-primary); }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .start, .ghost {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 8px 20px 8px 14px; position: relative; overflow: hidden;
      border-radius: 22px; font: 600 14px Inter, sans-serif; text-decoration: none;
    }
    .start { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .ghost { border: 1px solid var(--mat-sys-outline); color: var(--mat-sys-primary); }
    .how { margin: 16px 0 8px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .how summary { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; cursor: pointer; font: 600 14px Inter, sans-serif; list-style: none; }
    .how summary::-webkit-details-marker { display: none; }
    .how summary mat-icon { color: var(--accent-gold); }
    .how ul { margin: 0; padding: 0 20px 14px 36px; font: 400 15px/1.6 var(--reading-font); }
    .how li { margin-top: 6px; }
    .book { margin-top: 22px; }
    .book header { padding: 0 4px; }
    .b-he { display: block; text-align: left; font-family: 'Frank Ruhl Libre', 'Noto Serif Hebrew', 'Times New Roman', serif; font-size: 40px; line-height: 1.2; color: var(--accent-gold); }
    h2 { margin: 2px 0 6px; font: 600 24px/1.2 var(--heading-font); }
    h2 small { display: block; margin-top: 2px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .book header p { margin: 0 0 8px; font: 400 15px/1.6 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .whole { display: inline-flex; align-items: center; min-height: 40px; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: none; position: relative; overflow: hidden; }
    ol { list-style: none; margin: 8px 0 0; padding: 4px 6px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    li + li { border-top: 1px solid var(--mat-sys-outline-variant); }
    li a { position: relative; overflow: hidden; display: flex; gap: 12px; min-height: 56px; padding: 12px 8px; border-radius: 12px; text-decoration: none; color: var(--mat-sys-on-surface); }
    .n {
      flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; margin-top: 2px;
      border: 1px solid var(--mat-sys-outline-variant); font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant);
    }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .name { font: 600 17px/1.3 var(--heading-font); }
    .name .he { font-size: 19px; margin-right: 4px; }
    .name small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .refs { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .summary { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .more { display: grid; gap: 10px; margin-top: 24px; }
    .more a {
      position: relative; overflow: hidden; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 16px; border-radius: 16px; text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); color: var(--mat-sys-on-surface-variant); font: 400 14px/1.45 Inter, sans-serif;
    }
    .more strong { display: block; color: var(--mat-sys-on-surface); font: 600 16px var(--heading-font); }
    .more span { flex: 1; min-width: 0; }
    .more mat-icon { color: var(--accent-gold); flex: none; }
  `,
})
export class TorahPage {
  private readonly settings = inject(SettingsService);

  protected readonly books = TORAH_BOOKS;
  protected readonly chapters = TORAH_BOOKS.reduce((sum, b) => sum + (findBook(b.id)?.chapters ?? 0), 0);
  protected readonly combined = COMBINED.map(([a, b]) => `${a} e ${b}`).join('; ');
  protected readonly range = (p: Parasha) => parashaRange(p, findBook(p.book)?.abbrev ?? p.book);
  protected readonly portions = parashotOf;
  protected readonly chaptersOf = (id: string) => findBook(id)?.chapters ?? 0;

  protected readonly read = computed(() => TORAH_BOOKS.reduce((sum, b) => sum + this.settings.readCount(b.id), 0));
  /** O primeiro capítulo da Torá que ainda não foi lido. */
  protected readonly next = computed(() => {
    for (const b of TORAH_BOOKS) {
      const info = findBook(b.id)!;
      for (let c = 1; c <= info.chapters; c++) {
        if (!this.settings.isRead(b.id, c)) return { book: b.id, chapter: c, label: `${info.name} ${c}` };
      }
    }
    return { book: 'GEN', chapter: 1, label: 'Gênesis 1' };
  });
}
