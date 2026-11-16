import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import {
  bookIndexOf, bookSpan, CHAPTER_COUNT, chapterAt, chapterIndex, chapterSpan, ConnectionData, ConnectionGraph, isChapter, LEVELS, levelOf,
  spanFromParams, spanLabel, spanPath, START_POINTS, type LevelId, type Span,
} from '../../core/bible-connections';
import { BOOKS } from '../../core/books';
import { ContentService, Quotation } from '../../core/content.service';
import { LINK_TYPES } from '../../core/cross-references.service';
import { parseReferences } from '../../core/reference-parser';
import { connectionsCard } from '../../core/share-card';
import { distanceColor, shareArt } from '../../shared/arcs-draw';
import { BackButton } from '../../shared/back-button';
import { BibleArcs } from '../../shared/bible-arcs';
import { Sheets } from '../../shared/sheets';
import { ShareImageButton } from '../../shared/share-image-button';
import { SourcesBox } from '../../shared/sources-box';
import { ConnectionReadings } from './connection-readings';

const HARRISON = 'https://www.chrisharrison.net/index.php/Visualizations/BibleViz';
const sameSpan = (a: Span | null, b: Span | null): boolean => (a === null || b === null ? a === b : a.from === b.from && a.to === b.to);

/**
 * A Bíblia Conectada: os 1.189 capítulos numa linha e, por cima, um arco para cada ligação entre dois capítulos (as referências
 * cruzadas da OpenBible.info que o leitor já usa). Escolher um capítulo ou um livro acende as ligações dele; a lista “Siga o fio”
 * leva de um capítulo a outro. A ideia dos arcos vem de Bible Cross-References, de Chris Harrison e Christoph Römhild (2007).
 */
@Component({
  selector: 'app-connections',
  imports: [RouterLink, MatIconModule, BackButton, BibleArcs, ShareImageButton, SourcesBox, ConnectionReadings],
  template: `
    <div class="top"><app-back fallback="/historia" /><app-share-image-button [card]="shareCard()" label="Compartilhar estas conexões" /></div>
    <header class="page-head">
      <img class="head-art" src="conteudo/imagens/conexoes-capa.webp" width="1600" height="900" alt="" aria-hidden="true" fetchpriority="high" />
      <span class="overline">Contexto e cultura</span>
      <h1>A Bíblia Conectada</h1>
      <p class="invitation">Um fio leva a outra passagem.</p>
      <p>Cada arco liga dois capítulos que se citam ou falam do mesmo assunto.@if (graph(); as g) { São {{ fmt(g.size) }} ligações entre os {{ fmt(chapters) }} capítulos.}</p>
    </header>

    @if (failed()) {
      <p class="empty">Não foi possível carregar as ligações. Confira a internet e tente de novo.</p>
    } @else if (graph(); as g) {
      <div class="explorer">
      <section class="stage" aria-label="Diagrama das ligações">
        <picture class="stage-art" aria-hidden="true">
          <source media="(max-width: 600px)" srcset="conteudo/imagens/conexoes-fundo-celular.webp" />
          <img src="conteudo/imagens/conexoes-fundo.webp" width="1600" height="1000" alt="" />
        </picture>
        <div class="stage-meta"><span>De Gênesis a Apocalipse</span><span>{{ fmt(chapters) }} capítulos</span></div>
        <app-bible-arcs [graph]="g" [level]="levelInfo()" [selected]="focus()" [journey]="journey()" (picked)="onPicked($event)" (settled)="onSettled($event)" />
        <p class="legend">
          @if (focus()) {
            <span><i class="ot"></i>ligações com o Antigo Testamento</span>
            <span><i class="nt"></i>com o Novo</span>
          } @else {
            @for (d of distances; track d.label) { <span><i [style.background]="d.color"></i>{{ d.label }}</span> }
          }
        </p>
        <div class="stage-reading">
          @if (focus(); as f) {
            <strong>{{ spanLabel(f) }} se liga a estes capítulos:</strong>
            @if (readingChips().length) {
              <div class="chips">
                @for (c of readingChips(); track c.index) {
                  <button type="button" class="chip" [attr.aria-label]="'Ler ' + spanLabel(f) + ' junto com ' + c.label" (click)="showReadings(c.index)">{{ c.label }}</button>
                }
              </div>
              <p>Toque num capítulo para ler os versículos dos dois lados, um ao lado do outro.</p>
              <button type="button" (click)="showReadings()"><mat-icon aria-hidden="true">menu_book</mat-icon> Ver todas as ligações para ler</button>
            } @else {
              <p>Nenhuma passagem ligada nesta base.</p>
            }
          } @else {
            <p>Para descobrir quais textos estão ligados, escolha um livro e um capítulo abaixo ou um dos pontos de partida.</p>
            <button type="button" (click)="go(exampleChapter)">Ver as conexões de Isaías 53</button>
          }
        </div>
        <p class="credit">Ideia inspirada em <a [href]="harrison" target="_blank" rel="noopener">Bible Cross-References</a>, de Chris Harrison e Christoph Römhild (2007). O desenho e os dados desta tela são outros.</p>
      </section>

      <div class="controls">
        <span class="control-label">Explore as ligações</span>
        <div class="levels" role="group" aria-label="Quantas ligações mostrar na visão geral">
          @for (l of levels; track l.id) {
            <button type="button" [attr.aria-pressed]="level().id === l.id" (click)="setLevel(l.id)">{{ l.label }} · {{ fmt(g.count(l.min)) }}</button>
          }
        </div>
        <div class="pick">
          <label class="field">
            <span>Livro</span>
            <select aria-label="Livro" (change)="onBook($any($event.target).value)">
              <option value="" [selected]="!bookId()">Escolha um livro…</option>
              <optgroup label="Antigo Testamento">
                @for (b of oldBooks; track b.id) { <option [value]="b.id" [selected]="b.id === bookId()">{{ b.name }}</option> }
              </optgroup>
              <optgroup label="Novo Testamento">
                @for (b of newBooks; track b.id) { <option [value]="b.id" [selected]="b.id === bookId()">{{ b.name }}</option> }
              </optgroup>
            </select>
          </label>
          @if (bookId()) {
            <label class="field">
              <span>Capítulo</span>
              <select aria-label="Capítulo" (change)="onChapter($any($event.target).value)">
                <option value="" [selected]="!chapterNumber()">Livro inteiro</option>
                @for (c of chapterList(); track c) { <option [value]="c" [selected]="c === chapterNumber()">{{ c }}</option> }
              </select>
            </label>
          }
          @if (chapterNumber()) {
            <span class="steps">
              <button type="button" aria-label="Capítulo anterior" [disabled]="!canStep(-1)" (click)="step(-1)"><mat-icon>chevron_left</mat-icon></button>
              <button type="button" aria-label="Próximo capítulo" [disabled]="!canStep(1)" (click)="step(1)"><mat-icon>chevron_right</mat-icon></button>
            </span>
          }
        </div>
        <p class="tip">Arraste pela linha de baixo do desenho, com o dedo ou o mouse, para trocar de capítulo.</p>
      </div>
      </div>

      @if (trailItems().length > 1) {
        <nav class="trail" aria-label="Seu caminho">
          <span>Seu caminho:</span>
          @for (t of trailItems(); track t.index; let last = $last) {
            <button type="button" [attr.aria-current]="last ? 'true' : null" (click)="go(t.index)">{{ t.label }}</button>
            @if (!last) { <mat-icon aria-hidden="true">arrow_forward</mat-icon> }
          }
        </nav>
      }

      @if (focus(); as f) {
        <section class="focus">
          <p class="sr" role="status">{{ announcement() }}</p>
          <span class="section-kicker">A passagem em foco</span>
          <h2>{{ spanLabel(f) }}</h2>
          <p class="count">
            @if (summary(); as s) {
              @if (s.chapters) { Ligado a {{ fmt(s.chapters) }} {{ s.chapters === 1 ? 'capítulo' : 'capítulos' }}, em {{ s.books }} {{ s.books === 1 ? 'livro' : 'livros' }}@if (!isOne()) { (fora do próprio livro) } } @else { Este {{ isOne() ? 'capítulo' : 'livro' }} não tem ligações nesta base. }
            }
          </p>
          <a class="read" [routerLink]="readLink()"><mat-icon>menu_book</mat-icon> {{ readLabel() }}</a>

          @if (readingLinks().length) {
            <app-connection-readings [selected]="f" [links]="readingLinks()" [target]="readingTarget()" (targetChosen)="readingTarget.set($event)" />
          }

          @if (summary()?.top?.length) {
            <h3>Mais ligado com</h3>
            <ul class="bars">
              @for (t of summary()!.top; track t.book.id) {
                <li [class.new-testament]="t.book.testament === 'NT'"><span>{{ t.book.name }}</span><b [style.width.%]="(100 * t.refs) / topMax()" aria-hidden="true"></b><em>{{ t.refs }}</em></li>
              }
            </ul>
            <p class="note">Quantas referências há entre os dois textos, nos dois sentidos. Capítulos longos têm mais referências só por serem longos.</p>
          }

          @if (quotes().length) {
            <h3>Citações e alusões explicadas</h3>
            @for (q of quotes(); track q.ot + q.nt) {
              <article class="quote">
                <small>{{ linkType(q) }}</small>
                <p class="quote-refs">{{ q.ot }} ↔ {{ q.nt }}</p>
                <p>{{ q.note }}</p>
                <span><button type="button" (click)="open(q.ot)">{{ q.ot }}</button> <mat-icon aria-hidden="true">sync_alt</mat-icon> <button type="button" (click)="open(q.nt)">{{ q.nt }}</button></span>
                <button class="compare" type="button" [attr.aria-label]="'Ler juntos: ' + q.ot + ' e ' + q.nt" (click)="open(q.ot + '; ' + q.nt)">Ler os dois textos juntos</button>
              </article>
            }
          }

          @if (groups().length) {
            <h3>Siga o fio</h3>
            <p class="note">“Ler” mostra os textos que ligam {{ spanLabel(f) }} àquele capítulo. Toque no nome do capítulo para explorar as ligações dele.</p>
            @for (grp of shownGroups(); track grp.bookIndex) {
              <div class="group" [class.new-testament]="grp.bookIndex >= oldBooks.length">
                <h4>{{ grp.book.name }} <small>{{ grp.refs }}</small></h4>
                <div class="chips">
                  @for (c of grp.chapters.slice(0, 14); track c.index) {
                    <span class="connection-choice">
                      <button type="button" [attr.aria-label]="'Ver as ligações de ' + grp.book.name + ' ' + c.chapter + ', ' + c.refs + ' referências'" (click)="go(c.index)">{{ grp.book.name }} {{ c.chapter }} · {{ c.refs }}</button>
                      <button type="button" [attr.aria-label]="'Ler conexão com ' + grp.book.name + ' ' + c.chapter" (click)="showReadings(c.index)">Ler</button>
                    </span>
                  }
                  @if (grp.chapters.length > 14) { <span class="more">+ {{ grp.chapters.length - 14 }}</span> }
                </div>
              </div>
            }
            @if (groups().length > 8) {
              <button type="button" class="expand" (click)="allGroups.set(!allGroups())">{{ allGroups() ? 'Mostrar menos livros' : 'Mostrar os ' + groups().length + ' livros' }}</button>
            }
          }
        </section>
      } @else {
        <section class="start">
          <span class="section-kicker">Escolha um ponto de partida</span>
          <h2>Comece por aqui</h2>
          <p class="note">Abra uma passagem e acompanhe os fios que a ligam ao restante da Bíblia.</p>
          <div class="grid">
            @for (s of starts(); track s.index; let i = $index) {
              <button type="button" class="card start-card" (click)="go(s.index)">
                <span class="start-number" aria-hidden="true">0{{ i + 1 }}</span>
                <strong>{{ s.label }}</strong>
                <span>{{ s.why }}</span>
                <small>{{ fmt(s.links) }} capítulos ligados <mat-icon aria-hidden="true">arrow_forward</mat-icon></small>
              </button>
            }
          </div>
          <h3>Os capítulos mais ligados</h3>
          <div class="chips">
            @for (m of mostConnected(); track m.index) { <button type="button" (click)="go(m.index)">{{ m.label }} · {{ fmt(m.links) }}</button> }
          </div>
          <p class="note">{{ mostConnected()[0].label }} é o capítulo ligado a mais capítulos nesta base. Capítulos longos têm mais ligações só por serem longos.</p>
        </section>
      }

      <details class="howto">
        <summary><mat-icon>help</mat-icon> Como ler este desenho<mat-icon class="chevron">expand_more</mat-icon></summary>
        <ul>
          <li>A linha de baixo é a Bíblia inteira, de Gênesis (à esquerda) a Apocalipse (à direita). Cada faixa colorida é um livro.</li>
          <li>Cada arco liga dois capítulos. Quanto mais alto o arco, mais distantes estão os dois capítulos na Bíblia; a cor também mostra isso.</li>
          <li>“Ligação” junta citações diretas, alusões e assuntos parecidos: o desenho não separa um do outro. Quando o app tem uma explicação para a citação, ela aparece ao escolher o capítulo.</li>
          <li>Na visão geral só aparecem as ligações mais fortes (com {{ levels[0].min }} ou mais referências entre os dois capítulos), para o desenho não virar uma mancha. Ao escolher um capítulo ou um livro, aparecem todas as dele.</li>
        </ul>
        <h3>De onde vêm os dados</h3>
        <p>As referências cruzadas são da OpenBible.info (licença Creative Commons Atribuição), que reúne sobretudo o Treasury of Scripture Knowledge, em domínio público, e votos de leitores. Aqui entram as que têm 3 votos ou mais, até 8 por versículo, juntadas por capítulo: {{ fmt(g.size) }} ligações. O número é deste conjunto de dados; outras bases têm mais ou menos referências.</p>
        <h3>A ideia</h3>
        <p>A ideia de ligar os capítulos da Bíblia por arcos vem de <a [href]="harrison" target="_blank" rel="noopener">Bible Cross-References</a>, de Chris Harrison e do pastor Christoph Römhild, que começaram esse trabalho em 2007. A imagem deles tem direitos reservados e não é usada aqui.</p>
      </details>
    } @else {
      <p class="status" role="status"><mat-icon>hourglass_top</mat-icon> Preparando as ligações…</p>
    }
    <app-sources topic="conexoes" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    :host { --thread-gold: #f1d9a8; --thread-rose: #ff8fb8; }
    .page-head { position: relative; isolation: isolate; overflow: hidden; margin: 8px 0 20px; padding: 28px 30px; border-radius: 24px; background: #12231a; color: #fff8ec; border: 1px solid #415647; }
    .head-art, .stage-art, .stage-art img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .head-art { z-index: -2; object-position: center 60%; }
    .page-head::after { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(18,35,26,.97), rgba(18,35,26,.86) 56%, rgba(18,35,26,.24)); }
    .page-head .overline { color: #f1d9a8; }
    .page-head h1 { margin: 10px 0 6px; font-size: clamp(32px, 4.5vw, 46px); letter-spacing: -1px; }
    .page-head p { max-width: 540px; color: #fff8ec; font: 400 14px/1.65 Inter, sans-serif; }
    .page-head .invitation { margin: 0 0 10px; color: #f1d9a8; font: 400 italic 20px/1.4 var(--heading-font); }
    .explorer { display: grid; gap: 16px; margin-bottom: 24px; }
    .stage { position: relative; isolation: isolate; overflow: hidden; min-width: 0; padding: 16px 10px 14px; border-radius: 24px; border: 1px solid #52614b; color: #fff8ec; background: linear-gradient(165deg, #243f33, #12231a 88%); box-shadow: 0 14px 36px #12231a1c, inset 0 1px #f1d9a826; }
    .stage-art { z-index: -2; }
    .stage::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(ellipse at 50% 30%, #12231a55, #12231af2 94%); }
    .stage-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 12px; margin: 0 8px 4px; color: #f1d9a8; font: 500 13px/1.5 Inter, sans-serif; }
    .legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 8px 8px 10px; font: 500 13px/1.5 Inter, sans-serif; color: #fff8ec; }
    .legend i { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; vertical-align: 1px; box-shadow: 0 0 8px #f1d9a840; }
    .legend .ot { background: #f1d9a8; } .legend .nt { background: #ff8fb8; }
    .stage-reading { margin: 12px 8px; font: 500 14px/1.5 Inter, sans-serif; color: #fff8ec; }
    .stage-reading p { margin: 4px 0 10px; }
    .stage-reading button { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 14px; border: 1px solid #f1d9a8; border-radius: 14px; color: #12231a; background: #f1d9a8; font: 600 14px Inter, sans-serif; cursor: pointer; }
    .stage-reading button:focus-visible { outline-color: #fff8ec; }
    .stage-reading .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 4px; }
    .stage-reading .chip { background: transparent; color: #fff8ec; border-color: #f1d9a8; }
    .credit { margin: 0 8px; padding-top: 10px; border-top: 1px solid #f1d9a82b; font: 400 13px/1.55 Inter, sans-serif; color: #e4d9c5; }
    .credit a { color: #f1d9a8; text-underline-offset: 3px; }
    .credit a:focus-visible { outline-color: #f1d9a8; }
    .sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .controls { display: grid; gap: 14px; align-content: start; padding: 18px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 20px; background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); }
    .control-label, .section-kicker { font: 600 13px/1.5 Inter, sans-serif; letter-spacing: .9px; text-transform: uppercase; color: var(--mat-sys-primary); }
    .levels { display: flex; flex-wrap: wrap; gap: 8px; }
    .levels button, .trail button, .chips button, .expand, .quote button, .steps button { min-height: 42px; min-width: 40px; padding: 0 14px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 16px; background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif; cursor: pointer; transition: border-color .2s, box-shadow .2s, background-color .2s; }
    .levels button[aria-pressed='true'] { background: #243f33; border-color: #243f33; color: #fff8ec; box-shadow: inset 0 1px #f1d9a842; }
    .pick { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; }
    .field { display: grid; flex: 1 1 132px; min-width: 0; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .field select { min-height: 46px; min-width: 0; width: 100%; padding: 0 8px; border: 1px solid var(--mat-sys-outline); border-radius: 12px; background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 16px Inter, sans-serif; }
    .steps { display: inline-flex; gap: 6px; }
    .steps button { display: grid; place-items: center; width: 44px; min-height: 44px; padding: 0; }
    .steps button:disabled { opacity: .4; cursor: default; }
    .tip { margin: 0; font: 400 13px/1.65 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .trail { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 24px; padding: 14px; border-radius: 18px; background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); font: 600 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .trail button[aria-current='true'] { background: var(--mat-sys-secondary-container); border-color: var(--mat-sys-outline); }
    .trail mat-icon { width: 18px; height: 18px; font-size: 18px; color: var(--accent-gold); }
    .focus h2, .start h2 { margin: 6px 0; font: 600 30px/1.2 var(--heading-font); letter-spacing: -.4px; }
    .focus h3, .start h3, .howto h3 { margin: 26px 0 10px; font: 700 13px/1.5 Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--mat-sys-on-surface-variant); }
    .count { margin: 0 0 14px; font: 500 16px/1.6 Inter, sans-serif; }
    .read { display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 18px; border-radius: 16px; text-decoration: none; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 15px Inter, sans-serif; }
    .bars { list-style: none; margin: 0; padding: 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 18px; background: var(--mat-sys-surface-container-low); display: grid; gap: 10px; }
    .bars li { display: grid; grid-template-columns: 108px minmax(0, 1fr) 34px; align-items: center; gap: 8px; font: 500 14px Inter, sans-serif; }
    .bars b { display: block; height: 6px; border-radius: 6px; background: linear-gradient(90deg, #a8775c, #f1d9a8); box-shadow: 0 0 9px #f1d9a840; }
    .bars .new-testament b { background: linear-gradient(90deg, #a86f6f, #ff8fb8); box-shadow: 0 0 9px #ff8fb833; }
    .bars em { font: 500 13px Inter, sans-serif; font-style: normal; text-align: right; color: var(--mat-sys-on-surface-variant); }
    .note { margin: 8px 0 0; font: 400 14px/1.65 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .quote { margin: 10px 0; padding: 18px; border: 1px solid var(--mat-sys-outline-variant); border-left: 3px solid var(--accent-gold); border-radius: 4px 18px 18px 4px; background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); }
    .quote small { font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; color: var(--mat-sys-primary); }
    .quote p { margin: 8px 0 12px; font: 400 16px/1.65 var(--reading-font); }
    .quote .quote-refs { font: 600 16px/1.5 var(--heading-font); }
    .quote .compare { display: block; margin-top: 10px; }
    .quote span { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .quote mat-icon { width: 18px; height: 18px; font-size: 18px; color: var(--accent-gold); }
    .group { margin: 10px 0; padding: 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 18px; background: var(--mat-sys-surface-container-low); }
    .group h4 { display: flex; align-items: baseline; gap: 8px; margin: 0 0 12px; font: 600 18px var(--heading-font); }
    .group h4::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #a8775c; }
    .group.new-testament h4::before { background: #ff8fb8; }
    .group h4 small { margin-left: auto; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; overflow: visible; }
    .chips button { height: auto; padding: 8px 12px; }
    .connection-choice { display: inline-flex; flex-wrap: wrap; gap: 4px; max-width: 100%; }
    .connection-choice button:last-child { border-color: var(--mat-sys-primary); color: var(--mat-sys-primary); }
    .more { align-self: center; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .expand { margin-top: 6px; }
    .grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); margin-top: 18px; }
    .start-card { display: grid; grid-template-columns: 28px minmax(0, 1fr); column-gap: 12px; row-gap: 6px; padding: 20px 18px; text-align: left; cursor: pointer; font: inherit; color: inherit; transition: border-color .2s, box-shadow .2s; }
    .start-card .start-number { grid-row: 1 / 4; color: var(--accent-gold); font: 500 italic 19px var(--heading-font); }
    .start-card strong { font: 600 21px var(--heading-font); }
    .start-card span { font: 400 14px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .start-card small { display: flex; align-items: center; gap: 8px; margin-top: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .start-card mat-icon { margin-left: auto; width: 18px; height: 18px; font-size: 18px; }
    .howto { margin-top: 28px; padding: 0 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 18px; }
    .howto summary { display: flex; align-items: center; gap: 8px; min-height: 56px; cursor: pointer; list-style: none; font: 600 16px var(--heading-font); }
    .howto summary::-webkit-details-marker { display: none; }
    .howto summary mat-icon:first-child { color: var(--accent-gold); }
    .howto .chevron { margin-left: auto; }
    .howto[open] .chevron { transform: rotate(180deg); }
    .howto ul { margin: 0 0 8px; padding-left: 20px; font: 400 15px/1.6 var(--reading-font); }
    .howto p { margin: 0 0 12px; font: 400 15px/1.6 var(--reading-font); }
    .howto a { color: var(--mat-sys-primary); }
    .status { display: flex; align-items: center; gap: 8px; font: 500 15px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    button:focus-visible, select:focus-visible, a:focus-visible, summary:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 3px; }
    @media (hover: hover) { button:enabled:hover, .start-card:hover { border-color: var(--mat-sys-primary); box-shadow: var(--shadow-soft); } }
    @media (min-width: 640px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (min-width: 1150px) { .explorer { grid-template-columns: minmax(0, 1fr) 248px; align-items: start; } .controls .levels { display: grid; } .controls .levels button { text-align: left; } }
    @media (max-width: 600px) { .page-head { padding: 24px 20px; border-radius: 20px; } .page-head::after { background: #12231ad9; } .stage { border-radius: 20px; padding: 14px 6px; } .stage-meta { flex-direction: column; gap: 0; } .controls { padding: 16px; } .bars { padding: 14px 12px; } }
    @media (prefers-reduced-motion: reduce) { button, .start-card { transition: none; } }
  `,
})
export class ConnectionsPage {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);

  /** Do endereço: `/conexoes/ISA/53` (capítulo), `/conexoes/ISA` (livro) e `?mostrar=` (quantas ligações). */
  readonly book = input<string>();
  readonly chapter = input<string>();
  readonly mostrar = input<string>();

  protected readonly harrison = HARRISON;
  protected readonly chapters = CHAPTER_COUNT;
  protected readonly exampleChapter = chapterIndex('ISA', 53)!;
  protected readonly levels = LEVELS;
  protected readonly oldBooks = BOOKS.filter((b) => b.testament === 'AT');
  protected readonly newBooks = BOOKS.filter((b) => b.testament === 'NT');
  protected readonly distances = [
    { label: 'perto', color: distanceColor(3) },
    { label: 'médio', color: distanceColor(60) },
    { label: 'longe', color: distanceColor(700) },
  ];

  protected readonly graph = signal<ConnectionGraph | null>(null);
  protected readonly failed = signal(false);
  protected readonly focus = signal<Span | null>(null);
  protected readonly readingTarget = signal<number | null>(null);
  private readonly readings = viewChild(ConnectionReadings);
  protected readonly journey = signal<{ from: number; to: number; id: number } | null>(null);
  private journeyId = 0;
  protected readonly level = signal(LEVELS[0]);
  protected readonly trail = signal<number[]>([]);
  protected readonly allGroups = signal(false);
  protected readonly levelInfo = computed(() => this.level());
  protected readonly spanLabel = spanLabel;

  private readonly quotations = toSignal(inject(ContentService).quotations, { initialValue: [] as Quotation[] });
  /** As citações e alusões que o app explica, por capítulo (dos dois lados: o do Antigo e o do Novo Testamento). */
  private readonly quoteIndex = computed(() => {
    const index = new Map<number, Quotation[]>();
    for (const q of this.quotations()) {
      for (const ref of [q.ot, q.nt]) {
        for (const r of parseReferences(ref).refs) {
          const i = chapterIndex(r.bookId, r.chapter);
          if (i === null) continue;
          const list = index.get(i) ?? [];
          if (!list.includes(q)) list.push(q);
          index.set(i, list);
        }
      }
    }
    return index;
  });

  protected readonly isOne = computed(() => {
    const f = this.focus();
    return !f || isChapter(f);
  });
  protected readonly bookId = computed(() => {
    const f = this.focus();
    return f ? BOOKS[bookIndexOf(f.from)].id : '';
  });
  protected readonly chapterNumber = computed(() => {
    const f = this.focus();
    return f && isChapter(f) ? chapterAt(f.from).chapter : 0;
  });
  protected readonly chapterList = computed(() => {
    const id = this.bookId();
    const book = BOOKS.find((b) => b.id === id);
    return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
  });
  protected readonly summary = computed(() => {
    const g = this.graph();
    const f = this.focus();
    return g && f ? g.summary(f) : null;
  });
  protected readonly readingLinks = computed(() => {
    const graph = this.graph();
    const span = this.focus();
    return graph && span ? graph.linksOf(span) : [];
  });
  /** Os capítulos mais ligados à passagem em foco, para a pessoa tocar e ler sem procurar. */
  protected readonly readingChips = computed(() => this.readingLinks().slice(0, 4).map((link) => ({ index: link.index, label: chapterAt(link.index).label })));
  /** A frase que o leitor de tela anuncia quando o que está em foco muda (o painel inteiro seria longo demais). */
  protected readonly announcement = computed(() => {
    const f = this.focus();
    const s = this.summary();
    if (!f || !s) return '';
    return `${spanLabel(f)}. ${s.chapters ? `Ligado a ${this.fmt(s.chapters)} capítulos, em ${s.books} livros.` : 'Sem ligações nesta base.'}`;
  });
  protected readonly topMax = computed(() => Math.max(1, ...(this.summary()?.top.map((t) => t.refs) ?? [1])));
  protected readonly groups = computed(() => {
    const g = this.graph();
    const f = this.focus();
    return g && f ? g.groupByBook(f) : [];
  });
  protected readonly shownGroups = computed(() => (this.allGroups() ? this.groups() : this.groups().slice(0, 8)));
  protected readonly quotes = computed(() => {
    const f = this.focus();
    return f && isChapter(f) ? (this.quoteIndex().get(f.from) ?? []) : [];
  });
  protected readonly trailItems = computed(() => this.trail().map((i) => chapterAt(i)));
  protected readonly starts = computed(() => {
    const g = this.graph();
    if (!g) return [];
    return START_POINTS.flatMap((s) => {
      const index = chapterIndex(s.bookId, s.chapter);
      return index === null ? [] : [{ index, label: chapterAt(index).label, why: s.why, links: g.degree(index) }];
    });
  });
  protected readonly mostConnected = computed(() => {
    const g = this.graph();
    return g ? g.mostConnected(6).map((index) => ({ index, label: chapterAt(index).label, links: g.degree(index) })) : [];
  });
  protected readonly readLink = computed(() => {
    const f = this.focus();
    if (!f) return '/livros';
    const c = chapterAt(f.from);
    return isChapter(f) ? ['/ler', c.book.id, String(c.chapter)] : ['/livro', c.book.id];
  });
  protected readonly readLabel = computed(() => {
    const f = this.focus();
    return f ? (isChapter(f) ? `Ler ${spanLabel(f)}` : `Abrir ${spanLabel(f)}`) : '';
  });

  /** O cartão da imagem de compartilhar: o desenho no estado em que está, com o título e a contagem do que está em foco. */
  protected readonly shareCard = computed(() => {
    const g = this.graph();
    if (!g) return null;
    const f = this.focus();
    const s = this.summary();
    return connectionsCard({
      path: spanPath(f),
      theme: f ? 'A Bíblia Conectada' : 'Contexto e Cultura',
      title: f ? spanLabel(f) : 'A Bíblia Conectada',
      subtitle: f ? (s?.chapters ? `Ligado a ${this.fmt(s.chapters)} capítulos, em ${s.books} livros` : 'Sem ligações nesta base') : `${this.fmt(g.size)} ligações entre os ${this.fmt(CHAPTER_COUNT)} capítulos da Bíblia`,
      art: shareArt(g, f, LEVELS[0].min),
    });
  });

  constructor() {
    this.http
      .get<ConnectionData>('bible/conexoes.json')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          try {
            this.graph.set(new ConnectionGraph(data));
          } catch {
            this.failed.set(true);
          }
        },
        error: () => this.failed.set(true),
      });
    // O endereço manda: ao abrir ou ao voltar, o que está em foco e o nível seguem ele
    effect(() => {
      const span = spanFromParams(this.book(), this.chapter());
      untracked(() => {
        if (sameSpan(this.focus(), span)) return;
        this.focus.set(span);
        this.trail.set(span && isChapter(span) ? [span.from] : []);
      });
    });
    effect(() => this.level.set(levelOf(this.mostrar())));
  }

  protected fmt(n: number): string {
    return n.toLocaleString('pt-BR');
  }

  protected linkType(q: Quotation): string {
    return LINK_TYPES[q.type];
  }

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }

  protected showReadings(target?: number): void {
    if (target !== undefined) this.readingTarget.set(target);
    this.readings()?.focus();
  }

  /** Muda o que está em foco, guarda no endereço (sem encher o histórico) e acompanha o “caminho”. */
  protected choose(span: Span | null, keepTrail = false): void {
    if (!keepTrail) this.journey.set(null);
    this.focus.set(span);
    this.readingTarget.set(null);
    this.allGroups.set(false);
    if (!span || !isChapter(span)) this.trail.set([]);
    else if (keepTrail) this.trail.update((t) => this.extend(t, span.from));
    else this.trail.set([span.from]);
    const query = this.level().id === LEVELS[0].id ? '' : `?mostrar=${this.level().id}`;
    void this.router.navigateByUrl(spanPath(span) + query, { replaceUrl: true });
  }

  private extend(trail: number[], index: number): number[] {
    const at = trail.indexOf(index);
    return (at >= 0 ? trail.slice(0, at + 1) : [...trail, index]).slice(-8);
  }

  /** Um capítulo da lista “Siga o fio”, do caminho ou dos pontos de partida. */
  protected go(index: number): void {
    const previous = this.focus();
    const connected = previous && isChapter(previous) && this.graph()?.neighbors(previous.from).some((link) => link.index === index);
    this.journey.set(connected && previous
      ? { from: previous.from, to: index, id: ++this.journeyId }
      : null);
    this.choose(chapterSpan(index), true);
  }

  protected onBook(id: string): void {
    const i = BOOKS.findIndex((b) => b.id === id);
    this.choose(i < 0 ? null : bookSpan(i));
  }

  protected onChapter(value: string): void {
    const id = this.bookId();
    const index = value ? chapterIndex(id, Number(value)) : null;
    this.choose(index === null ? bookSpan(BOOKS.findIndex((b) => b.id === id)) : chapterSpan(index));
  }

  protected canStep(delta: number): boolean {
    const f = this.focus();
    return !!f && isChapter(f) && f.from + delta >= 0 && f.from + delta < CHAPTER_COUNT;
  }

  protected step(delta: number): void {
    const f = this.focus();
    if (f && this.canStep(delta)) this.choose(chapterSpan(f.from + delta));
  }

  protected setLevel(id: LevelId): void {
    this.level.set(levelOf(id));
    void this.router.navigate([], { queryParams: { mostrar: id === LEVELS[0].id ? null : id }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  /** Enquanto o dedo arrasta pela linha: o capítulo muda na hora, sem mexer no endereço. */
  protected onPicked(index: number): void {
    this.journey.set(null);
    this.focus.set(chapterSpan(index));
    this.readingTarget.set(null);
  }

  protected onSettled(index: number): void {
    this.choose(chapterSpan(index));
  }
}
