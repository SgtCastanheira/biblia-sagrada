import { Component, computed, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { featured, monthName } from '../../core/anniversaries';
import { findArticle } from '../../core/library';
import { StoryProgressService } from '../../core/story-progress.service';
import { Bookshelf } from '../../shared/bookshelf';
import { StudyFinder } from '../../shared/study-finder';
import { StoryBooks } from '../../shared/story-books';
import { findTrail, Trail, TRAILS, trailArticleIds, trailOfCollection } from '../../core/trails';
import { trailCard } from '../../core/share-card';
import { ShareImageButton } from '../../shared/share-image-button';

/**
 * Histórias: uma fileira de círculos (como os destaques do Instagram), um por assunto. Sem escolher nenhum,
 * mostra todos os assuntos; ao escolher um, mostra os seus ramos e as suas histórias.
 */
@Component({
  selector: 'app-history',
  imports: [RouterLink, MatIconModule, MatRippleModule, Bookshelf, ShareImageButton, StoryBooks, StudyFinder],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>História</h1>
      <p>@if (trail()) { Escolha um assunto. Cada um tem as suas histórias, em ordem, e leva a outras telas do app. } @else { Tudo num lugar só: histórias, mapas, personagens, contexto e palavras, como livros numa estante. Toque num livro para abri-lo. }</p>
    </header>

    @if (trail()) {
      <app-story-books [active]="trail()?.id" [all]="true" />
    }

    @if (trail(); as t) {
      <a class="by-era" matRipple routerLink="/epocas">
        <mat-icon>timeline</mat-icon>
        <span><strong>Ver por época</strong> Da Criação a hoje, as histórias e as crises do mundo na ordem do tempo.</span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
      <section class="cover" [style.--tone]="t.tone">
        <mat-icon class="watermark" aria-hidden="true">{{ t.icon }}</mat-icon>
        <app-share-image-button class="c-share" [card]="trailCard(t)" label="Compartilhar este assunto" />
        <span class="c-over">{{ count(t) }} {{ count(t) === 1 ? 'história' : 'histórias' }}@if (state(t).done) { · {{ state(t).done }} {{ state(t).done === 1 ? 'lida' : 'lidas' }} }</span>
        <h2>{{ t.name }}</h2>
        <p>{{ t.description }}</p>
        @if (state(t).done) {
          <span class="bar" aria-hidden="true"><span [style.width.%]="100 * state(t).done / state(t).total"></span></span>
        }
        @if (state(t).next; as nextId) {
          <!-- Só para quem já começou: para começar, a primeira história já está logo abaixo -->
          @if (state(t).started && article(nextId); as n) {
            <a class="go-on" matRipple [routerLink]="['/artigo', n.id]">
              <mat-icon>play_arrow</mat-icon>
              <span><small>Continuar a trilha</small>{{ n.title }}</span>
            </a>
          }
        } @else {
          <span class="all-read"><mat-icon>check_circle</mat-icon> Você leu todas as histórias desta trilha</span>
        }
      </section>

      @for (b of t.branches; track b.title) {
        <h2 class="section-title">{{ b.title }}</h2>
        <div class="grid">
          @for (a of articlesOf(b.ids); track a.id; let i = $index) {
            <a class="card row" matRipple [routerLink]="['/artigo', a.id]">
              <span class="badge"><mat-icon>{{ a.icon }}</mat-icon></span>
              <span class="texts">
                @if (meta(a, b.ids.length > 1 ? { n: i + 1, of: b.ids.length } : undefined); as m) { <span class="meta">{{ m }}</span> }
                <span class="name">{{ a.title }}</span>
                <span class="desc">{{ a.subtitle }}</span>
              </span>
              @if (progress.isDone(a.id)) {
                <mat-icon class="go done" aria-label="Lida">check_circle</mat-icon>
              } @else {
                <mat-icon class="go">chevron_right</mat-icon>
              }
            </a>
          }
          @for (l of b.links ?? []; track l.link) {
            <a class="card row shortcut" matRipple [routerLink]="l.link">
              <span class="badge"><mat-icon>{{ l.icon }}</mat-icon></span>
              <span class="texts">
                <span class="meta">Atalho</span>
                <span class="name">{{ l.name }}</span>
                <span class="desc">{{ l.description }}</span>
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      }

      @if (next(); as n) {
        <a class="next" matRipple [routerLink]="[]" [queryParams]="{ trilha: n.id }" replaceUrl>
          <span><small>Próximo assunto</small>{{ n.name }}</span>
          <mat-icon>arrow_forward</mat-icon>
        </a>
      }
    } @else {
      <app-study-finder [q]="q()">
        <a class="by-era dates" matRipple routerLink="/datas">
          <mat-icon>event</mat-icon>
          <span><strong>Datas de {{ month }}</strong> {{ monthCount }} {{ monthCount === 1 ? 'fato da história da Igreja' : 'fatos da história da Igreja' }} neste mês, com foto e imagem para compartilhar, e o ano inteiro logo ali.</span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
        <app-bookshelf [focus]="estante()" />

        <details class="howto card">
          <summary><mat-icon>route</mat-icon> Como estudar pelo leitor<mat-icon class="chevron">expand_more</mat-icon></summary>
          <ol>
            <li><strong>Leia o capítulo.</strong> No topo, abra <em>Estudar este capítulo</em> para saber quem escreveu, quando e o que acontecia na época.</li>
            <li><strong>Toque numa palavra sublinhada.</strong> O dicionário mostra o termo original e o sentido naquele versículo.</li>
            <li><strong>Toque num versículo.</strong> Veja as referências cruzadas e abra o mesmo texto em outras versões.</li>
            <li><strong>Siga os cartões do capítulo.</strong> Mapas, aulas de contexto e estudos aparecem onde o texto pede.</li>
          </ol>
        </details>

        <a class="sources" matRipple routerLink="/fontes">
          <mat-icon>library_books</mat-icon>
          <span><strong>Fontes das informações</strong> De onde vêm os textos de estudo: a Bíblia, fontes antigas, arqueologia e obras de referência.</span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      </app-study-finder>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .page-head + app-story-books { margin-bottom: 18px; }
    .howto { margin-top: 18px; padding: 0 18px; border-left: 3px solid var(--accent-gold); }
    .howto summary { display: flex; align-items: center; gap: 8px; min-height: 52px; cursor: pointer; list-style: none; font: 600 17px var(--heading-font); }
    .howto summary::-webkit-details-marker { display: none; }
    .howto summary mat-icon { color: var(--accent-gold); }
    .howto .chevron { margin-left: auto; color: var(--mat-sys-on-surface-variant); }
    .howto[open] .chevron { transform: rotate(180deg); }
    .howto ol { margin: 0 0 12px; padding-left: 22px; font: 400 15px/1.6 var(--reading-font); }
    .howto li { margin-bottom: 6px; }
    .howto li::marker { color: var(--accent-gold); font-weight: 600; }
    .sources {
      position: relative; overflow: hidden; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
      margin-top: 28px; padding: 14px 16px; border-radius: 16px; text-decoration: none; color: inherit; border: 1px dashed var(--mat-sys-outline-variant);
    }
    .sources > mat-icon { color: var(--accent-gold); }
    .sources span { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .sources strong { display: block; font: 600 16px var(--heading-font); color: var(--mat-sys-on-surface); }
    .sources .go { color: var(--mat-sys-on-surface-variant); }
    .by-era { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; margin: 0 0 18px; padding: 12px 16px; border-radius: 16px; text-decoration: none; color: inherit; border: 1px dashed var(--mat-sys-outline-variant); }
    .by-era > mat-icon:first-child { color: var(--accent-gold); }
    .by-era span { font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .by-era strong { display: block; font: 600 16px var(--heading-font); color: var(--mat-sys-on-surface); }
    .by-era .go { color: var(--mat-sys-on-surface-variant); }
    .cover {
      position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 6px; margin: 0 0 8px; padding: 22px 20px; border-radius: 24px; color: #fff8ec;
      background: radial-gradient(110% 90% at 100% 0%, rgba(241, 217, 168, .22), transparent 62%), linear-gradient(165deg, var(--tone, #2f4a3d), color-mix(in srgb, var(--tone, #2f4a3d) 55%, #000) 85%);
      /* Como um livro que acabou de abrir: a capa gira a partir da lombada */
      box-shadow: inset 12px 0 14px -10px rgba(0, 0, 0, .55); transform-origin: left center; animation: open-book .7s cubic-bezier(.3, .7, .2, 1) both;
    }
    .c-share { position: absolute; top: 6px; right: 6px; z-index: 2; color: #fff8ec; }
    @keyframes open-book { from { transform: perspective(1100px) rotateY(-70deg); opacity: .35; } to { transform: none; opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .cover { animation: none; } }
    .cover h2 { position: relative; margin: 0; font: 600 28px/1.15 var(--heading-font); }
    .cover p { position: relative; margin: 0; max-width: 560px; font: 400 15px/1.5 var(--reading-font); color: #eadfcb; }
    .c-over { position: relative; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: #f1d9a8; }
    .watermark { position: absolute; right: -14px; bottom: -22px; width: 140px; height: 140px; font-size: 140px; color: rgba(255, 255, 255, .1); }
    .grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
    @media (min-width: 840px) { .grid { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }
    .grid .card { margin: 0; }
    .shortcut { border-style: dashed; }
    .bar { position: relative; display: block; height: 6px; margin-top: 6px; border-radius: 3px; background: rgba(255, 255, 255, .18); overflow: hidden; }
    .bar span { display: block; height: 100%; border-radius: 3px; background: #f1d9a8; }
    .go-on {
      position: relative; display: flex; align-items: center; gap: 10px; align-self: flex-start; min-height: 48px; margin-top: 10px; padding: 6px 18px 6px 12px;
      border-radius: 24px; text-decoration: none; color: #1b2b23; background: #f1d9a8; font: 600 15px/1.25 var(--heading-font);
    }
    .go-on span { display: flex; flex-direction: column; }
    .go-on small { font: 600 13px Inter, sans-serif; color: #3d3220; }
    .all-read { position: relative; display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font: 600 14px Inter, sans-serif; color: #f1d9a8; }
    .go.done { color: var(--mat-sys-primary); }
    .next { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 22px; padding: 14px 18px; border-radius: 18px; text-decoration: none; color: var(--mat-sys-primary); background: var(--mat-sys-surface-container); font: 600 17px/1.3 var(--heading-font); }
    .next span { display: flex; flex-direction: column; }
    .next small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class HistoryPage {
  readonly trilha = input<string>();
  /** Links antigos, com a coleção. */
  readonly colecao = input<string>();
  /** Pesquisa na biblioteca (?q=). */
  readonly q = input<string>();
  /** Estante (assunto) em que a biblioteca abre (?estante=): é o link da imagem que compartilha uma prateleira. */
  readonly estante = input<string>();
  protected readonly progress = inject(StoryProgressService);
  protected trailCard = trailCard;
  /** O cartão das datas, no alto da biblioteca: o mês de hoje e quantos fatos ele tem. */
  private readonly today = new Date();
  protected readonly month = monthName(this.today.getMonth() + 1);
  protected readonly monthCount = featured(this.today).reduce((n, f) => n + f.events.length, 0);
  protected readonly trail = computed(() => findTrail(this.trilha()) ?? trailOfCollection(this.colecao()));
  protected readonly next = computed(() => {
    const i = TRAILS.findIndex((t) => t.id === this.trail()?.id);
    return i >= 0 ? TRAILS[(i + 1) % TRAILS.length] : null;
  });

  protected count(t: Trail): number {
    return trailArticleIds(t).length;
  }

  protected state(t: Trail) {
    return this.progress.trail(t);
  }

  protected article(id: string) {
    return findArticle(id);
  }

  /** Linha pequena sobre a história: o número na prateleira (“Livro 1 de 7”, só quando há mais de um), a época (quando há) e se já foi lida. */
  protected meta(a: { id: string; period?: string }, place?: { n: number; of: number }): string {
    const status = this.progress.isDone(a.id) ? 'lida' : this.progress.fraction(a.id) >= 0.05 ? `${this.percent(a.id)}% lida` : '';
    return [place ? `Livro ${place.n} de ${place.of}` : '', a.period, status].filter(Boolean).join(' · ');
  }

  protected percent(id: string): number {
    return Math.round(this.progress.fraction(id) * 100);
  }

  protected articlesOf(ids: string[]) {
    return ids.map((id) => findArticle(id)!).filter(Boolean);
  }
}
