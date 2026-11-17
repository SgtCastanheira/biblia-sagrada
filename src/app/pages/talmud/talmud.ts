import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BAVLI_TRACTATES, PASSAGES, SEDARIM, TRACTATES } from '../../core/talmud';
import { BackButton } from '../../shared/back-button';
import { RichText } from '../../shared/rich-text';
import { SourcesBox } from '../../shared/sources-box';

/**
 * O Talmude: o que é, como se forma, como é a página, cinco trechos contados com palavras do app e o mapa dos
 * 63 tratados, cada um com o endereço do texto completo na Sefaria. O texto do Talmude não está no app (veja `core/talmud.ts`).
 */
@Component({
  selector: 'app-talmud',
  imports: [BackButton, RouterLink, MatIconModule, MatRippleModule, RichText, SourcesBox],
  template: `
    <header class="hero">
      <app-back class="back" fallback="/livros" />
      <span class="kicker">A Torá oral, posta por escrito</span>
      <h1>O Talmude <span class="he" lang="he" dir="rtl">תלמוד</span></h1>
      <p class="lead">
        <em>Talmud</em> quer dizer “estudo”, “aprendizado”. É a grande obra em que os sábios judeus registraram, durante séculos, como entender e viver a Torá:
        as leis, as discussões entre os mestres, histórias, provérbios e orações. Depois da Bíblia hebraica, é o texto de maior autoridade no judaísmo rabínico.
      </p>
      <div class="facts">
        <div><strong>{{ tractates }}</strong><span>tratados na Mishná, em 6 ordens</span></div>
        <div><strong>{{ bavli }}</strong><span>deles com Guemará no Talmude Babilônico</span></div>
        <div><strong>2.711</strong><span>folhas na edição de Vilna (cerca de 5.400 páginas)</span></div>
      </div>
    </header>

    <section class="box">
      <h2><mat-icon>info</mat-icon> O que o app traz, e o que não traz</h2>
      <p>
        O <strong>texto completo do Talmude não está aqui</strong>. Não existe uma tradução para o português que possa ser publicada livremente, e a tradução em inglês mais usada
        tem uma licença que não permite republicá-la (e, em qualquer língua, o Talmude tem milhões de palavras). O app traz o <strong>mapa do Talmude</strong>, a explicação de
        como ele se forma, <strong>cinco trechos contados com as nossas palavras</strong> e, para cada tratado, o caminho até o <strong>texto completo, grátis, na Sefaria</strong>
        (em hebraico e aramaico, com tradução para o inglês).
      </p>
      <a class="story" matRipple routerLink="/artigo/talmude"><mat-icon>auto_stories</mat-icon><span><strong>A história do Talmude</strong>Como nasceu, o que tem dentro e como se estuda.</span><mat-icon class="go">arrow_forward</mat-icon></a>
    </section>

    <section class="block">
      <h2>Mishná mais Guemará</h2>
      <ul class="plain">
        <li><strong>Mishná</strong> (“repetição”, “estudo por repetição”): a primeira coleção escrita da tradição oral, reunida, segundo a tradição, por Judá, o Príncipe, por volta do ano 200. Em seis ordens e 63 tratados, de frases curtas.</li>
        <li><strong>Guemará</strong> (“estudo”, “conclusão”): a longa conversa dos sábios dos séculos seguintes sobre cada frase da Mishná. O Talmude é a Mishná mais a Guemará.</li>
        <li><strong>Dois Talmudes.</strong> O de <em>Jerusalém</em> foi reunido na Galileia, no fim do século IV ou no começo do V. O <em>Babilônico</em>, mais extenso e mais usado, reúne materiais dos séculos III ao VI. Quando se diz só “o Talmude”, é o Babilônico.</li>
        <li><strong>Lei e história.</strong> O que é lei (<em>halachá</em>) se mistura com o que é narrativa, provérbio e conselho (<em>agadá</em>); no Babilônico, cerca de um terço é agadá.</li>
      </ul>
    </section>

    <section class="block">
      <h2>Como é uma página do Talmude</h2>
      <p class="cap">A página impressa de Vilna (1835), que quase todas as edições copiam. Toda folha (<em>daf</em>) tem dois lados, <em>a</em> e <em>b</em>: “Shabbat 31a” é o primeiro lado da folha 31 do tratado Shabbat.</p>
      <div class="page" role="img" aria-label="Esquema de uma página do Talmude: no centro, a Mishná e a Guemará; na margem de dentro, o comentário de Rashi; na margem de fora, as Tosafot.">
        <div class="inner"><strong>Rashi</strong><span>comentário na margem de dentro</span></div>
        <div class="center"><strong>Mishná e Guemará</strong><span>o texto, no centro</span></div>
        <div class="outer"><strong>Tosafot</strong><span>comentários na margem de fora</span></div>
      </div>
      <p class="cap">Rashi, de Troyes, na França, viveu no século XI; as Tosafot reúnem comentários de rabinos medievais que vieram depois dele. Essa disposição começou nas primeiras edições impressas (a de Soncino, em 1483) e se firmou com a edição de Veneza, de 1520 a 1523.</p>
    </section>

    <section class="block">
      <h2>Cinco trechos</h2>
      <p class="cap">Contados com as palavras do app; cada um leva ao texto completo.</p>
      @for (p of passages; track p.id) {
        <article class="passage">
          <h3>{{ p.title }}</h3>
          <p class="where">{{ p.where }}</p>
          @for (para of p.summary; track $index) { <p>{{ para }}</p> }
          @if (p.bible) { <div class="bible"><app-rich-text [source]="p.bible" /></div> }
          <a class="ext" matRipple [href]="p.link" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Ler o texto completo de ' + p.where + ' na Sefaria (abre em outra aba)'">
            <mat-icon>open_in_new</mat-icon> Ler o texto na Sefaria
          </a>
        </article>
      }
    </section>

    <section class="block">
      <h2>As seis ordens e os 63 tratados</h2>
      <p class="cap">
        O Talmude segue a ordem da Mishná. Cada tratado tem dois endereços: o da <strong>Mishná</strong> e, nos {{ bavli }} que a têm, o da <strong>Guemará</strong> do Talmude Babilônico.
        O de Jerusalém cobre outros tratados, e não está nesta lista.
      </p>
      @for (s of sedarim; track s.id) {
        <details class="seder">
          <summary>
            <span class="s-he" lang="he" dir="rtl">{{ s.he }}</span>
            <span class="s-name">{{ s.name }}<small>“{{ s.pt }}” · {{ s.tractates.length }} tratados</small></span>
            <mat-icon class="chev">expand_more</mat-icon>
          </summary>
          <p class="s-sum">{{ s.summary }}</p>
          <ul>
            @for (x of s.tractates; track x.name) {
              <li>
                <div class="t-head"><span class="t-he" lang="he" dir="rtl">{{ x.he }}</span> <strong>{{ x.name }}</strong> <small>“{{ x.pt }}”</small></div>
                <p>{{ x.theme }}</p>
                <div class="t-links">
                  <a matRipple [href]="x.mishnah" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Mishná, tratado ' + x.name + ', na Sefaria (abre em outra aba)'">Mishná</a>
                  @if (x.bavli) { <a matRipple [href]="x.bavli" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Guemará, tratado ' + x.name + ', na Sefaria (abre em outra aba)'">Guemará</a> }
                  @else { <span class="no">sem Guemará no Babilônico</span> }
                </div>
              </li>
            }
          </ul>
        </details>
      }
    </section>

    <aside class="more">
      <a matRipple routerLink="/tora"><mat-icon>menu_book</mat-icon><span><strong>A Torá</strong>Os cinco livros de Moisés e as 54 porções da leitura semanal.</span><mat-icon class="go">arrow_forward</mat-icon></a>
      <a matRipple routerLink="/artigo/biblia-judaica"><mat-icon>history_edu</mat-icon><span><strong>A Bíblia dos Judeus</strong>Lei, Profetas e Escritos: como era a Bíblia no tempo de Jesus.</span><mat-icon class="go">arrow_forward</mat-icon></a>
    </aside>
    <app-sources topic="talmude" />
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
    .he, .s-he, .t-he { font-family: 'Frank Ruhl Libre', 'Noto Serif Hebrew', 'Times New Roman', serif; font-weight: 400; color: var(--accent-gold); }
    h1 .he { font-size: 34px; }
    .lead { margin: 0 0 16px; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .facts div { padding: 12px; border-radius: 14px; background: var(--mat-sys-surface-container); }
    .facts strong { display: block; font: 600 26px var(--heading-font); }
    .facts span { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .box {
      margin-top: 16px; padding: 4px 18px 18px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low);
    }
    .box h2 { display: flex; align-items: center; gap: 8px; margin: 14px 0 8px; font: 600 18px var(--heading-font); }
    .box h2 mat-icon { color: var(--accent-gold); }
    .box p { margin: 0 0 12px; font: 400 15px/1.65 var(--reading-font); }
    .block { margin-top: 26px; }
    .block h2 { margin: 0 4px 8px; font: 600 24px/1.2 var(--heading-font); }
    .cap { margin: 0 4px 12px; font: 400 14px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .plain { margin: 0; padding: 0 4px 0 22px; font: 400 16px/1.65 var(--reading-font); }
    .plain li { margin-bottom: 8px; }
    .story, .more a {
      position: relative; overflow: hidden; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 16px; border-radius: 16px; text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface-variant); font: 400 14px/1.45 Inter, sans-serif;
    }
    .story strong, .more strong { display: block; color: var(--mat-sys-on-surface); font: 600 16px var(--heading-font); }
    .story span, .more span { flex: 1; min-width: 0; }
    .story mat-icon, .more mat-icon { color: var(--accent-gold); flex: none; }
    .page { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 6px; padding: 8px; border-radius: 14px; border: 1px solid var(--mat-sys-outline); background: var(--mat-sys-surface-container-low); }
    .page > div { display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 14px 8px; min-height: 150px; border-radius: 8px; text-align: center; background: var(--mat-sys-surface-container); }
    .page .center { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .page strong { font: 600 16px var(--heading-font); }
    .page span { font: 400 13px/1.4 Inter, sans-serif; }
    .passage { margin-bottom: 14px; padding: 4px 18px 16px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .passage h3 { margin: 14px 0 2px; font: 600 20px/1.25 var(--heading-font); }
    .where { margin: 0 0 10px; font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .passage p { margin: 0 0 10px; font: 400 16px/1.65 var(--reading-font); }
    .bible { margin: 6px 0 10px; font: 400 15px/1.6 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .ext { position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px 0 12px; border-radius: 22px; border: 1px solid var(--mat-sys-outline); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: none; }
    .seder { margin-bottom: 10px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .seder summary { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 14px; cursor: pointer; list-style: none; }
    .seder summary::-webkit-details-marker { display: none; }
    .s-he { font-size: 26px; flex: none; }
    .s-name { flex: 1; min-width: 0; font: 600 18px/1.25 var(--heading-font); }
    .s-name small { display: block; margin-top: 2px; font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chev { flex: none; transition: transform .2s; color: var(--mat-sys-on-surface-variant); }
    .seder[open] .chev { transform: rotate(180deg); }
    .s-sum { margin: 0 14px 6px; font: 400 15px/1.6 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .seder ul { list-style: none; margin: 0; padding: 0 14px 12px; }
    .seder li { padding: 12px 0; border-top: 1px solid var(--mat-sys-outline-variant); }
    .t-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font: 400 16px/1.3 var(--heading-font); }
    .t-head strong { font-weight: 600; }
    .t-he { font-size: 19px; }
    .t-head small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .seder li p { margin: 4px 0 8px; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .t-links { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .t-links a { position: relative; overflow: hidden; display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border-radius: 20px; border: 1px solid var(--mat-sys-outline); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: none; }
    .no { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .more { display: grid; gap: 10px; margin-top: 24px; }
    .more a { background: var(--mat-sys-surface-container-low); }
  `,
})
export class TalmudPage {
  protected readonly sedarim = SEDARIM;
  protected readonly passages = PASSAGES;
  protected readonly tractates = TRACTATES.length;
  protected readonly bavli = BAVLI_TRACTATES.length;
}
