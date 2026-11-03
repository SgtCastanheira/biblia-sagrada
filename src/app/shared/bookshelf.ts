import { Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { findArticle } from '../core/library';
import { StoryProgressService } from '../core/story-progress.service';
import { Trail, TRAILS } from '../core/trails';

/** Tempo, em ms, que a capa leva para abrir antes de entrar na história (igual ao da animação no CSS). */
const OPEN_MS = 700;

/** Um livro da estante: uma história (ou um atalho para outra tela) de um assunto. */
export interface Book {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  minutes?: number;
  period?: string;
  url: string;
  trail: Trail;
  /** Atalho para outra tela do app, e não uma história. */
  shortcut: boolean;
  /** Lombada: largura e altura (em px) e quanto escurece a cor (%), sempre os mesmos para o mesmo livro. */
  w: number;
  h: number;
  dark: number;
  /** Uma lombada em cada cinco é cor de creme, com o texto escuro. */
  light: boolean;
}

function hash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function spine(key: string, minutes: number | undefined) {
  const h = hash(key);
  return {
    // Mais páginas, lombada mais grossa; nunca menos de 40 px, para o dedo acertar
    w: 46 + Math.min(minutes ?? 6, 14),
    h: 170 + (h % 5) * 11,
    dark: [0, 12, 22, 30][(h >>> 3) % 4],
    light: h % 5 === 0,
  };
}

/** Uma prateleira: um subtópico (ramo da trilha) com os seus livros. */
interface Shelf {
  title: string;
  books: Book[];
}

function shelvesOf(t: Trail): Shelf[] {
  return t.branches
    .map((b) => {
      const books: Book[] = [];
      for (const id of b.ids) {
        const a = findArticle(id);
        if (!a) continue;
        books.push({ key: `a:${a.id}`, title: a.title, subtitle: a.subtitle, icon: a.icon, minutes: a.minutes, period: a.period, url: `/artigo/${a.id}`, trail: t, shortcut: false, ...spine(a.id, a.minutes) });
      }
      for (const l of b.links ?? []) {
        books.push({ key: `l:${l.link}`, title: l.name, subtitle: l.description, icon: l.icon, url: l.link, trail: t, shortcut: true, ...spine(l.link, undefined) });
      }
      return { title: b.title, books };
    })
    .filter((sh) => sh.books.length);
}

/**
 * Biblioteca: todos os estudos, cada um como a lombada de um livro. Cada assunto (tópico) é uma estante, com a
 * sua cor; dentro dela, uma prateleira por subtópico (cor do assunto, com tons e alturas diferentes). Tocar numa lombada tira o livro da prateleira e mostra a capa, com o título
 * inteiro; "Abrir o livro" faz a capa girar e entra na história. Com "reduzir movimento", entra direto.
 */
@Component({
  selector: 'app-bookshelf',
  imports: [MatIconModule, RouterLink],
  template: `
    <nav class="jump" aria-label="Assuntos da biblioteca">
      @for (s of sections(); track s.trail.id) {
        <button type="button" class="stop" [style.--tone]="s.trail.tone" [attr.aria-label]="'Ir para ' + s.trail.name" (click)="goTo(s.trail.id)">
          <span class="disc"><mat-icon>{{ s.trail.icon }}</mat-icon></span>
          <span class="lab">{{ s.trail.short }}</span>
        </button>
      }
    </nav>

    <div class="case">
      @for (s of sections(); track s.trail.id) {
        <section class="bay" [id]="'bay-' + s.trail.id" [style.--tone]="s.trail.tone" [attr.aria-labelledby]="'bay-h-' + s.trail.id">
          <header class="plate">
            <mat-icon>{{ s.trail.icon }}</mat-icon>
            <h2 [id]="'bay-h-' + s.trail.id">{{ s.trail.name }}</h2>
            <span class="n">{{ s.total }}</span>
            <a class="see" routerLink="/historia" [queryParams]="{ trilha: s.trail.id }" [attr.aria-label]="'Ver o assunto ' + s.trail.name + ' em lista'">Ver em lista</a>
          </header>
          @for (sh of s.shelves; track sh.title) {
            <div class="shelf">
              <h3 class="sub-title">{{ sh.title }}</h3>
              <ul class="row">
                @for (b of sh.books; track b.key) {
                  <li class="cell" [style.width.px]="b.w">
                    <button type="button" class="spine" [class.light]="b.light" [class.shortcut]="b.shortcut" [style.--tone]="b.trail.tone" [style.--dark]="b.dark + '%'" [style.height.px]="b.h" [attr.aria-label]="label(b)" (click)="pick(b)">
                      <mat-icon class="ico" aria-hidden="true">{{ b.icon }}</mat-icon>
                      <span class="t">{{ b.title }}</span>
                      @if (isDone(b)) { <mat-icon class="done" aria-hidden="true">check_circle</mat-icon> }
                    </button>
                  </li>
                }
              </ul>
            </div>
          }
        </section>
      }
    </div>

    <!-- O clique fora da capa só fecha com o mouse; pelo teclado, Esc fecha a janela -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog #hold class="hold" aria-labelledby="hold-title" (close)="picked.set(null)" (click)="backdrop($event)">
      @if (picked(); as b) {
        <div class="vol" [class.opening]="opening()" [style.--tone]="b.trail.tone">
          <span class="inside" aria-hidden="true"></span>
          <span class="cover">
            <span class="front">
              <span class="foil"><mat-icon>{{ b.icon }}</mat-icon></span>
              <span class="over">{{ b.shortcut ? 'Atalho · ' : '' }}{{ b.trail.short }}</span>
              <h3 id="hold-title">{{ b.title }}</h3>
              @if (meta(b); as m) { <span class="meta">{{ m }}</span> }
            </span>
            <span class="back"></span>
          </span>
        </div>
        <p class="sub">{{ b.subtitle }}</p>
        <div class="actions">
          <button type="button" class="go" (click)="openBook(b)">{{ b.shortcut ? 'Abrir' : 'Abrir o livro' }}</button>
          <button type="button" class="close" (click)="hold.close()">Fechar</button>
        </div>
      }
    </dialog>
  `,
  styles: `
    :host { display: block; --row: 226px; --gap: 14px; }
    /* Índice: uma bolinha por assunto, que leva à estante dele */
    .jump { display: flex; gap: 14px; margin: 0 -20px 18px; padding: 4px 20px 6px; overflow-x: auto; scrollbar-width: none; }
    .jump::-webkit-scrollbar { display: none; }
    .stop { flex: none; width: 84px; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 0; border: 0; background: none; cursor: pointer; color: var(--mat-sys-on-surface); }
    .stop .disc { display: grid; place-items: center; width: 64px; height: 64px; box-sizing: border-box; border-radius: 6px 12px 12px 6px; color: #f1d9a8; background: linear-gradient(165deg, var(--tone), color-mix(in srgb, var(--tone) 62%, #000)); box-shadow: inset 5px 0 5px -3px rgba(0, 0, 0, .5), 0 2px 5px rgba(0, 0, 0, .25); transition: transform .15s; }
    .stop:hover .disc { transform: translateY(-3px); }
    .stop:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 2px; border-radius: 8px; }
    .stop .lab { font: 500 13px/1.25 Inter, sans-serif; text-align: center; max-width: 84px; }
    @media (min-width: 840px) { .jump { margin: 0 0 18px; padding: 4px 0 6px; flex-wrap: wrap; overflow: visible; gap: 18px 16px; } }
    .case { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; align-items: start; }
    @media (min-width: 1000px) { .case { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

    /* Cada assunto é um módulo da estante, com a sua plaquinha */
    .bay { scroll-margin-top: 72px; padding: 12px 12px 4px; border-radius: 18px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    .plate { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; padding-left: 8px; border-left: 4px solid var(--tone); }
    .plate mat-icon { flex: none; color: color-mix(in srgb, var(--tone) 80%, var(--mat-sys-on-surface)); }
    .plate h2 { margin: 0; flex: 1; min-width: 0; font: 600 18px/1.25 var(--heading-font); color: var(--mat-sys-on-surface); }
    .plate .n { flex: none; min-width: 24px; padding: 1px 8px; border-radius: 12px; text-align: center; font: 600 13px/1.5 Inter, sans-serif; background: var(--mat-sys-surface-container-highest); color: var(--mat-sys-on-surface-variant); }
    .shelf { margin: 0 0 4px; }
    .sub-title { display: flex; align-items: center; gap: 10px; margin: 6px 0 4px; font: 600 15px/1.3 var(--heading-font); color: var(--mat-sys-on-surface-variant); }
    .sub-title::after { content: ''; flex: 1; height: 1px; background: var(--mat-sys-outline-variant); }
    .see { flex: none; display: inline-flex; align-items: center; min-height: 40px; padding: 0 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }

    /* Prateleiras: todas as linhas têm a mesma altura, então as tábuas caem no lugar certo mesmo quando os livros quebram de linha */
    .row {
      list-style: none; margin: 0; padding: 0 4px var(--gap); display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--gap) 2px;
      background-image: repeating-linear-gradient(to bottom,
        transparent 0, transparent var(--row),
        color-mix(in srgb, var(--mat-sys-surface) 70%, #fff) var(--row), color-mix(in srgb, var(--mat-sys-outline-variant) 70%, var(--mat-sys-surface)) calc(var(--row) + 3px),
        color-mix(in srgb, var(--mat-sys-surface-container-highest) 90%, #000) calc(var(--row) + 3px), color-mix(in srgb, var(--mat-sys-surface-container-highest) 90%, #000) calc(var(--row) + 12px),
        color-mix(in srgb, var(--mat-sys-outline-variant) 60%, #000) calc(var(--row) + 12px), color-mix(in srgb, var(--mat-sys-outline-variant) 60%, #000) calc(var(--row) + var(--gap)));
      background-size: 100% calc(var(--row) + var(--gap));
    }
    .cell { position: relative; flex: none; height: var(--row); }

    .spine {
      position: absolute; left: 0; bottom: 0; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 20px 0 18px; box-sizing: border-box;
      border: 0; border-radius: 2px 3px 2px 2px; cursor: pointer; font: inherit; color: #fff8ec; -webkit-tap-highlight-color: transparent; transition: transform .2s ease;
      background:
        linear-gradient(90deg, rgba(0, 0, 0, .38) 0, rgba(0, 0, 0, 0) 16%, rgba(255, 255, 255, .13) 26%, rgba(0, 0, 0, 0) 42%, rgba(0, 0, 0, .28) 100%),
        color-mix(in srgb, var(--tone) calc(100% - var(--dark)), #000);
      box-shadow: 1px 0 0 rgba(0, 0, 0, .35), 0 -1px 0 rgba(255, 255, 255, .12) inset;
    }
    /* Fios dourados no alto e no pé da lombada */
    .spine::before, .spine::after { content: ''; position: absolute; left: 4px; right: 4px; height: 3px; border-top: 1px solid #f1d9a8; border-bottom: 1px solid #f1d9a8; opacity: .85; pointer-events: none; }
    .spine::before { top: 7px; }
    .spine::after { bottom: 7px; }
    .spine.light { color: #2b2118; background: linear-gradient(90deg, rgba(0, 0, 0, .22) 0, rgba(0, 0, 0, 0) 18%, rgba(255, 255, 255, .35) 30%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, .14) 100%), #efe3c8; }
    .spine.light::before, .spine.light::after { border-color: var(--tone); }
    .spine.shortcut { outline: 1px dashed rgba(241, 217, 168, .8); outline-offset: -4px; }
    .spine:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 2px; z-index: 1; }
    .ico { flex: none; width: 20px; height: 20px; font-size: 20px; color: #f1d9a8; }
    .spine.light .ico { color: color-mix(in srgb, var(--tone) 85%, #000); }
    .t { flex: 1 1 0; min-height: 0; max-height: 100%; writing-mode: vertical-rl; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; text-align: start; font: 600 13px/1.25 var(--heading-font); }
    .done { flex: none; width: 16px; height: 16px; font-size: 16px; color: #f1d9a8; }
    .spine.light .done { color: color-mix(in srgb, var(--tone) 85%, #000); }
    @media (hover: hover) { .spine:hover { transform: translateY(-9px); } }

    /* Livro na mão: a capa inteira, com o título por extenso */
    .hold { width: min(92vw, 360px); max-height: 92vh; overflow: auto; padding: 24px 22px 20px; border: 0; border-radius: 26px; color: var(--mat-sys-on-surface); background: var(--mat-sys-surface); box-shadow: 0 24px 60px rgba(0, 0, 0, .5); }
    .hold[open] { animation: lift .3s ease; }
    .hold::backdrop { background: rgba(24, 17, 10, .62); }
    @keyframes lift { from { opacity: 0; transform: translateY(14px) scale(.96); } }
    .vol { position: relative; width: min(66vw, 236px); aspect-ratio: 3 / 4.2; margin: 6px auto 18px; perspective: 1000px; transition: transform .4s ease; }
    .vol.opening { transform: scale(1.1); }
    .inside { position: absolute; inset: 2px 0 2px 3px; border-radius: 2px 6px 6px 2px; background: #f6ecd6; background-image: repeating-linear-gradient(#f6ecd6 0 15px, #e3d5b4 15px 16px); box-shadow: 3px 0 0 -1px #d9c9a4, 5px 0 0 -2px #cdbb92; }
    .cover { position: absolute; inset: 0; transform-style: preserve-3d; transform-origin: left center; transition: transform .7s cubic-bezier(.3, .7, .2, 1); }
    .vol.opening .cover { transform: rotateY(-158deg); }
    .front, .back { position: absolute; inset: 0; border-radius: 3px 8px 8px 3px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .front {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 14px 16px 20px; box-sizing: border-box; text-align: center;
      background:
        linear-gradient(90deg, rgba(0, 0, 0, .45) 0, rgba(0, 0, 0, 0) 9%, rgba(255, 255, 255, .08) 11%, rgba(0, 0, 0, 0) 16%),
        linear-gradient(165deg, var(--tone), color-mix(in srgb, var(--tone) 62%, #000));
      box-shadow: 0 8px 18px rgba(0, 0, 0, .4);
    }
    .front::before { content: ''; position: absolute; inset: 9px 8px 9px 14px; border: 1px solid rgba(241, 217, 168, .55); border-radius: 2px; pointer-events: none; }
    .back { transform: rotateY(180deg); background: color-mix(in srgb, var(--tone) 14%, #f1e6cc); }
    .foil { display: grid; place-items: center; width: 46px; height: 46px; border: 1.5px solid #f1d9a8; border-radius: 50%; color: #f1d9a8; }
    .foil mat-icon { width: 26px; height: 26px; font-size: 26px; }
    .over { font: 700 13px/1.2 Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: #f1d9a8; }
    .front h3 { margin: 0; font: 600 20px/1.2 var(--heading-font); color: #fff8ec; text-wrap: balance; overflow-wrap: anywhere; }
    .meta { font: 600 13px/1.2 Inter, sans-serif; color: #f1d9a8; }
    .sub { margin: 0 0 16px; font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface-variant); text-align: center; }
    .actions { display: flex; gap: 10px; }
    .actions button { flex: 1; min-height: 48px; border-radius: 24px; font: 600 16px Inter, sans-serif; cursor: pointer; }
    .go { border: 0; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .close { border: 1px solid var(--mat-sys-outline); background: transparent; color: var(--mat-sys-on-surface); max-width: 110px; }

    @media (min-width: 840px) {
      .bay { padding: 16px 18px 6px; }
      .row { gap: var(--gap) 3px; padding-left: 6px; }
      .t { font-size: 14px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .spine, .vol, .cover { transition: none; }
      .spine:hover { transform: none; }
      .hold[open] { animation: none; }
    }
  `,
})
export class Bookshelf {
  private readonly router = inject(Router);
  private readonly progress = inject(StoryProgressService);
  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('hold');
  protected readonly sections = computed(() =>
    TRAILS.map((trail) => {
      const shelves = shelvesOf(trail);
      return { trail, shelves, total: shelves.reduce((n, sh) => n + sh.books.length, 0) };
    }),
  );
  protected readonly picked = signal<Book | null>(null);
  /** A capa está abrindo (só durante a animação). */
  protected readonly opening = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected goTo(id: string): void {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`bay-${id}`)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }

  protected isDone(b: Book): boolean {
    return !b.shortcut && this.progress.isDone(b.key.slice(2));
  }

  protected label(b: Book): string {
    return `${b.shortcut ? 'Atalho' : 'Livro'}: ${b.title}, em ${b.trail.name}${this.isDone(b) ? ', já lida' : ''}`;
  }

  protected meta(b: Book): string {
    return [b.period, b.minutes ? `${b.minutes} min` : ''].filter(Boolean).join(' · ');
  }

  protected pick(b: Book): void {
    this.opening.set(false);
    this.picked.set(b);
    this.dialog().nativeElement.showModal();
  }

  protected backdrop(e: MouseEvent): void {
    const dlg = this.dialog().nativeElement;
    if (e.target === dlg) dlg.close();
  }

  protected openBook(b: Book): void {
    if (this.opening()) return;
    const go = () => this.router.navigateByUrl(b.url);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go();
      return;
    }
    this.opening.set(true);
    this.timer = setTimeout(go, OPEN_MS);
  }
}
