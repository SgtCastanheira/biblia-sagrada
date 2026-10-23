import { BackButton } from '../../shared/back-button';
import { afterNextRender, Component, computed, effect, inject, Injector, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { findBook } from '../../core/books';
import { ContentService } from '../../core/content.service';
import { SettingsService } from '../../core/settings.service';
import { BookMaterialsView } from '../../shared/book-materials';
import { Sheets } from '../../shared/sheets';

@Component({
  selector: 'app-book',
  imports: [BackButton, BookMaterialsView, RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  template: `
    @if (bookInfo(); as b) {
      <header class="hero" [style.--c]="b.category.color">
        <app-back class="back" fallback="/livros" />
        <span class="category">{{ b.category.name }} · {{ b.testament === 'AT' ? 'Antigo' : 'Novo' }} Testamento</span>
        <h1>{{ b.name }}</h1>
        <div class="meta">
          <span>{{ b.chapters }} capítulo{{ b.chapters > 1 ? 's' : '' }}</span>
          <span>{{ read() }} lido{{ read() === 1 ? '' : 's' }}</span>
        </div>
        <div class="progress"><span [style.width.%]="(read() / b.chapters) * 100"></span></div>
        <a class="start" matRipple [routerLink]="['/ler', b.id, nextToRead()]">
          <mat-icon>play_arrow</mat-icon>
          {{ read() ? 'Continuar' : 'Começar' }} no capítulo {{ nextToRead() }}
        </a>
      </header>

      @if (intro(); as i) {
        <section class="intro" id="contexto">
          <h2>Introdução e contexto</h2>
          <dl class="facts">
            <div><dt>Autor</dt><dd>{{ i.author }}</dd></div>
            <div><dt>Data</dt><dd>{{ i.date }}</dd></div>
            @if (i.audience) { <div><dt>Destinatários</dt><dd>{{ i.audience }}</dd></div> }
          </dl>
          <h3>Contexto histórico</h3>
          <p>{{ i.context }}</p>
          <h3>Por que foi escrito</h3>
          <p>{{ i.purpose }}</p>
          <h3>Temas principais</h3>
          <ul class="themes">
            @for (t of i.themes; track t) { <li>{{ t }}</li> }
          </ul>
          <button class="key" (click)="openRef(i.keyVerse)"><mat-icon>format_quote</mat-icon> Versículo-chave: {{ i.keyVerse }}</button>
        </section>
      }

      <h2>Capítulos</h2>
      <div class="chapters">
        @for (c of chapters(); track c) {
          <a matRipple [routerLink]="['/ler', b.id, c]" [class.read]="settings.isRead(b.id, c)">{{ c }}</a>
        }
      </div>
      <section class="materials">
        <h2>Para estudar {{ b.name }}</h2>
        <app-book-materials [bookId]="b.id" />
      </section>
    } @else {
      <p>Livro não encontrado.</p>
    }
  `,
  styles: `
    .hero {
      position: relative; padding: 52px 22px 22px; border-radius: 24px; margin-top: 4px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); box-shadow: var(--shadow-soft);
    }
    .back { position: absolute; top: 6px; left: 6px; color: var(--mat-sys-on-surface-variant); }
    .category { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--c); }
    h1 { font: 600 38px/1.1 var(--heading-font); letter-spacing: -.5px; margin: 6px 0 10px; }
    .meta { display: flex; gap: 16px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .progress { height: 3px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); margin: 16px 0 20px; overflow: hidden; }
    .progress span { display: block; height: 100%; background: var(--mat-sys-primary); }
    .start {
      display: inline-flex; align-items: center; gap: 6px; height: 44px; padding: 0 20px 0 14px; position: relative; overflow: hidden;
      border-radius: 22px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 14px Inter, sans-serif; text-decoration: none;
    }
    h2 { font: 600 20px var(--heading-font); margin: 28px 4px 12px; }
    .chapters { display: grid; grid-template-columns: repeat(auto-fill, minmax(54px, 1fr)); gap: 10px; }
    .chapters a {
      aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; text-decoration: none; overflow: hidden; position: relative;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface); font: 500 16px var(--heading-font);
    }
    .intro {
      margin-top: 18px; padding: 4px 20px 18px; border-radius: 20px; scroll-margin-top: 72px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .intro h2 { margin: 18px 0 10px; }
    .intro h3 { font: 600 13px Inter, sans-serif; color: var(--accent-gold); margin: 16px 0 4px; text-transform: uppercase; letter-spacing: .8px; }
    .intro p { margin: 0; font: 400 16px/1.7 var(--reading-font); }
    .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin: 0; }
    .facts div { padding: 10px 12px; border-radius: 12px; background: var(--mat-sys-surface-container); }
    .facts dt { font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .facts dd { margin: 2px 0 0; font: 400 15px/1.45 var(--reading-font); }
    .themes { margin: 0; padding-left: 20px; font: 400 16px/1.6 var(--reading-font); }
    .themes li::marker { color: var(--accent-gold); }
    .key {
      display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); background: none; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
    .key mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    .chapters a.read { background: var(--mat-sys-primary-container); border-color: transparent; color: var(--mat-sys-on-primary-container); }
  `,})
export class BookPage {
  readonly book = input.required<string>();
  protected readonly settings = inject(SettingsService);
  private readonly sheets = inject(Sheets);
  private readonly content = inject(ContentService);
  protected readonly intro = toSignal(toObservable(this.book).pipe(switchMap((id) => this.content.intro(id))));
  protected readonly bookInfo = computed(() => findBook(this.book()));
  protected readonly chapters = computed(() => Array.from({ length: this.bookInfo()?.chapters ?? 0 }, (_, i) => i + 1));
  protected readonly read = computed(() => this.settings.readCount(this.book()));
  protected readonly nextToRead = computed(
    () => this.chapters().find((c) => !this.settings.isRead(this.book(), c)) ?? 1,
  );

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.bookInfo()?.name ?? 'Livro'} · Bíblia Sagrada`));

    // Vindo do leitor (#contexto), rola até a introdução depois que ela carregar
    const fragment = toSignal(inject(ActivatedRoute).fragment);
    const injector = inject(Injector);
    effect(() => {
      if (this.intro() && fragment() === 'contexto') {
        afterNextRender(() => document.getElementById('contexto')?.scrollIntoView({ behavior: 'smooth' }), { injector });
      }
    });
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
