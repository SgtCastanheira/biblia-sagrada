import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ATLAS_MAP } from '../../core/atlas';
import { formatLong } from '../../core/dates';
import { EbdService } from '../../core/ebd.service';
import { BibleMapView } from '../../shared/bible-map';

interface Shelf {
  link: string;
  queryParams?: Record<string, string>;
  icon: string;
  name: string;
  description: string;
}

interface Section {
  title: string;
  icon: string;
  shelves: Shelf[];
}

/** Biblioteca de estudo: organizada por tema, da leitura simples ao estudo aprofundado. */
@Component({
  selector: 'app-study',
  imports: [RouterLink, MatIconModule, MatRippleModule, BibleMapView],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Estudo</h1>
      <p>Personagens, geografia, profecias, idiomas originais, contexto histórico e cultural — tudo ligado ao texto bíblico, para ir da leitura simples ao estudo aprofundado.</p>
    </header>

    <!-- EBD e estudo livro por livro -->
    <div class="top-cards">
      @if (ebd.nextLesson(); as lesson) {
        <a class="card top-card ebd" matRipple [routerLink]="['/ebd/licao', lesson.number]">
          <span class="badge"><mat-icon>school</mat-icon></span>
          <span class="texts">
            <span class="kicker">EBD · {{ formatLong(lesson.date) }}</span>
            <span class="name">Lição {{ lesson.number }}@if (lesson.title) {: {{ lesson.title }}}</span>
          </span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      } @else {
        <a class="card top-card ebd" matRipple routerLink="/ebd">
          <span class="badge"><mat-icon>school</mat-icon></span>
          <span class="texts"><span class="kicker">Escola Bíblica Dominical</span><span class="name">Minhas aulas da revista</span></span>
          <mat-icon class="go">chevron_right</mat-icon>
        </a>
      }
      <a class="card top-card" matRipple routerLink="/estudo/livros">
        <span class="badge"><mat-icon>menu_book</mat-icon></span>
        <span class="texts"><span class="kicker">De Gênesis a Apocalipse</span><span class="name">Estudo livro por livro</span></span>
        <mat-icon class="go">chevron_right</mat-icon>
      </a>
    </div>

    <!-- Destaques -->
    <div class="featured">
      <a class="card hero" matRipple routerLink="/atlas">
        <app-bible-map [map]="atlas" [compact]="true" />
        <span class="hero-info">
          <span class="overline">Atlas histórico</span>
          <span class="hero-title">O mundo da Bíblia, época por época</span>
          <span class="hero-sub">Reinos, impérios e povos — de antes de Abraão ao Império Romano.</span>
        </span>
      </a>
      <div class="side">
        @for (h of highlights; track h.name) {
          <a class="card highlight" matRipple [routerLink]="h.link">
            <span class="badge"><mat-icon>{{ h.icon }}</mat-icon></span>
            <span class="texts"><span class="name">{{ h.name }}</span><span class="desc">{{ h.description }}</span></span>
          </a>
        }
      </div>
    </div>

    <!-- Como estudar -->
    <section class="howto card">
      <h2><mat-icon>route</mat-icon> Do texto ao estudo</h2>
      <ol>
        <li><strong>Leia o capítulo.</strong> No topo, abra <em>Contexto e notas</em> para saber quem escreveu, quando e o que acontecia na época.</li>
        <li><strong>Toque numa palavra sublinhada.</strong> O dicionário mostra o termo original e o sentido naquele versículo.</li>
        <li><strong>Toque num versículo.</strong> Veja as referências cruzadas: citações, alusões e textos relacionados.</li>
        <li><strong>Siga os cartões do capítulo.</strong> Mapas, aulas de contexto e estudos aparecem onde o texto pede.</li>
      </ol>
    </section>

    @for (s of sections; track s.title) {
      <h2 class="section-title"><mat-icon>{{ s.icon }}</mat-icon>{{ s.title }}</h2>
      <div class="grid">
        @for (sh of s.shelves; track sh.name) {
          <a class="card row" matRipple [routerLink]="sh.link" [queryParams]="sh.queryParams">
            <span class="badge"><mat-icon>{{ sh.icon }}</mat-icon></span>
            <span class="texts">
              <span class="name">{{ sh.name }}</span>
              <span class="desc">{{ sh.description }}</span>
            </span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      </div>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .top-cards { display: grid; gap: 10px; margin-bottom: 14px; }
    @media (min-width: 700px) { .top-cards { grid-template-columns: 1fr 1fr; } }
    .top-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 14px 16px; }
    .top-card .badge {
      width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
      background: var(--mat-sys-primary); color: var(--mat-sys-on-primary);
    }
    .top-card .texts { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .top-card .kicker { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .top-card .name { font: 600 17px/1.3 var(--heading-font); }
    .top-card .go { color: var(--mat-sys-on-surface-variant); }
    .featured { display: grid; gap: 12px; margin-bottom: 14px; }
    @media (min-width: 840px) { .featured { grid-template-columns: 1.4fr 1fr; } }
    .hero app-bible-map { display: block; aspect-ratio: 16 / 9; overflow: hidden; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .hero-info { display: flex; flex-direction: column; gap: 4px; padding: 14px 18px 16px; }
    .hero-title { font: 600 22px/1.25 var(--heading-font); }
    .hero-sub { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .side { display: grid; gap: 10px; align-content: start; }
    .highlight { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 14px; padding: 14px 16px; }
    .highlight .badge {
      width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
      color: var(--accent-gold); background: color-mix(in srgb, var(--accent-gold) 14%, transparent);
    }
    .highlight .texts { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .highlight .name { font: 600 17px/1.3 var(--heading-font); }
    .highlight .desc { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .howto { padding: 6px 18px 10px; margin-bottom: 6px; border-left: 3px solid var(--accent-gold); }
    .howto h2 { display: flex; align-items: center; gap: 8px; font: 600 18px var(--heading-font); margin: 12px 0 6px; }
    .howto h2 mat-icon { color: var(--accent-gold); }
    .howto ol { margin: 0 0 8px; padding-left: 22px; font: 400 15px/1.6 var(--reading-font); }
    .howto li { margin-bottom: 6px; }
    .howto li::marker { color: var(--accent-gold); font-weight: 600; }
    .section-title mat-icon { color: var(--accent-gold); font-size: 22px; width: 22px; height: 22px; }
  `,
})
export class StudyPage {
  protected readonly ebd = inject(EbdService);
  protected readonly formatLong = formatLong;
  protected readonly atlas = ATLAS_MAP;

  protected readonly highlights: Shelf[] = [
    { link: '/genealogia', icon: 'account_tree', name: 'A genealogia de Jesus', description: 'De Adão a Maria, com os reis e os profetas de cada tempo.' },
    { link: '/profecias', icon: 'visibility', name: 'Promessas e profecias', description: 'Do anúncio ao cumprimento — e o que ainda é esperado.' },
    { link: '/artigo/legiao-e-o-exercito-romano', icon: 'shield', name: 'Aula: “Legião”', description: 'O exército romano e o endemoninhado gadareno.' },
  ];

  protected readonly sections: Section[] = [
    {
      title: 'Personagens',
      icon: 'groups',
      shelves: [
        { link: '/memorial', icon: 'military_tech', name: 'Memorial da Fé', description: 'Heróis da fé, patriarcas, juízes, profetas, reis de Israel e de Judá, nazireus, mulheres de fé e apóstolos.' },
        { link: '/memorial', queryParams: { grupo: 'linha-do-tempo' }, icon: 'timeline', name: 'Linha do tempo', description: 'Todos os personagens na ordem da história, de Adão aos apóstolos.' },
        { link: '/genealogia', icon: 'account_tree', name: 'Genealogia de Jesus', description: 'As linhas de Mateus (por Salomão) e de Lucas (por Natã), com explicações.' },
      ],
    },
    {
      title: 'Mapas e geografia',
      icon: 'public',
      shelves: [
        { link: '/atlas', icon: 'public', name: 'Atlas histórico', description: 'Reinos e impérios época por época, com os povos, as cidades e os países de hoje.' },
        { link: '/mapas', icon: 'map', name: 'Mapas das jornadas', description: 'Abraão, Moisés, o Êxodo, os cativeiros, Jesus, os discípulos e Paulo — com distâncias e lugares ao redor.' },
      ],
    },
    {
      title: 'Profecias',
      icon: 'visibility',
      shelves: [
        { link: '/profecias', icon: 'star', name: 'Promessas e profecias', description: 'Cerca de 50 profecias com contexto, cumprimento e as interpretações cristãs.' },
        { link: '/artigo/profecias-de-daniel', icon: 'visibility', name: 'As profecias de Daniel', description: 'A estátua, os quatro animais, as setenta semanas e os reis do Norte e do Sul.' },
        { link: '/artigo/apocalipse', icon: 'wb_twilight', name: 'O Apocalipse', description: 'Patmos, as sete igrejas, os símbolos e as escolas de interpretação.' },
        { link: '/artigo/como-interpretar-profecias', icon: 'explore', name: 'Como interpretar as profecias', description: 'Princípios de leitura e as visões do milênio.' },
      ],
    },
    {
      title: 'Contexto histórico e cultural',
      icon: 'school',
      shelves: [
        { link: '/historia', queryParams: { colecao: 'contexto' }, icon: 'school', name: 'Aulas de contexto', description: 'O exército romano, a crucificação, o casamento judaico, os Herodes, as moedas, o templo, pastores e agricultura.' },
        { link: '/livros', icon: 'info', name: 'Contexto dos livros', description: 'Autor, data e cenário histórico de cada livro — e notas de estudo dentro dos capítulos.' },
        { link: '/artigo/cativeiros-de-israel', icon: 'link_off', name: 'Os cativeiros de Israel', description: 'Egito, Assíria, Babilônia e o retorno — com mapa interativo.' },
      ],
    },
    {
      title: 'Idiomas originais',
      icon: 'translate',
      shelves: [
        { link: '/dicionario', icon: 'translate', name: 'Dicionário bíblico', description: 'Termos e verbos com o hebraico, o aramaico, o grego e o latim, os sentidos e as conjugações.' },
        { link: '/artigo/idiomas-da-biblia', icon: 'menu_book', name: 'Como ler as palavras originais', description: 'Alfabetos, raízes, tempos verbais e os números de Strong.' },
      ],
    },
    {
      title: 'História',
      icon: 'history_edu',
      shelves: [
        { link: '/historia', icon: 'history_edu', name: 'História da Igreja', description: 'De Pentecostes às reformas, aos avivamentos e ao pentecostalismo no Brasil.' },
        { link: '/historia', queryParams: { colecao: 'biblia' }, icon: 'auto_stories', name: 'De onde veio a Bíblia', description: 'O cânon, os manuscritos, as traduções e a história de Almeida.' },
        { link: '/avivamento', icon: 'campaign', name: 'Sermões que marcaram a história', description: 'Wesley, Edwards, Spurgeon, Moody, Seymour, Billy Graham e outros.' },
        { link: '/curiosidades', icon: 'lightbulb', name: 'Você sabia?', description: 'Curiosidades bíblicas com os versículos que as explicam.' },
      ],
    },
  ];
}
