import { Component, input } from '@angular/core';
import { CalendarArt } from './calendar-art';
import { TanakhShelf } from './tanakh-shelf';

/**
 * Ilustrações desenhadas pelo app para os estudos (":::figura id" no texto).
 * São SVG com as cores do tema, para funcionar no claro, no escuro e sem internet.
 */
@Component({
  selector: 'app-figure',
  imports: [TanakhShelf, CalendarArt],
  template: `
    @switch (id()) {
      @case ('biblia-judaica') { <app-tanakh-shelf /> }
      @case ('calendario-outubro-1582') { <app-calendar-art kind="outubro-1582" /> }
      @case ('calendario-meses-romanos') { <app-calendar-art kind="meses-romanos" /> }
      @case ('calendario-ano-judaico') { <app-calendar-art kind="ano-judaico" /> }
      @case ('calendario-natal-13-dias') { <app-calendar-art kind="natal-13-dias" /> }
      @case ('calendario-ano-2026') { <app-calendar-art kind="ano-2026" /> }
      @case ('tsc-plano') {
        <svg viewBox="0 0 340 352" role="img" aria-label="O plano da Teologia Sistemático-Carismática: a primeira parte tem dois capítulos de método e a segunda tem oito capítulos de doutrina; o do Espírito Santo vem logo depois do de Deus">
          <text x="170" y="20" class="label">PRIMEIRA PARTE</text>
          <text x="170" y="38" class="sub">questões teórico-metodológicas</text>
          <g class="node"><rect x="8" y="46" width="160" height="64" rx="10" />
            <text x="88" y="65" class="year">Capítulo 1</text><text x="88" y="82" class="sub">O porquê de uma</text><text x="88" y="99" class="sub">teologia carismática</text></g>
          <g class="node"><rect x="172" y="46" width="160" height="64" rx="10" />
            <text x="252" y="65" class="year">Capítulo 2</text><text x="252" y="82" class="sub">Da experiência de fé</text><text x="252" y="99" class="sub">à teologia sistemática</text></g>
          <text x="170" y="138" class="label">SEGUNDA PARTE</text>
          <text x="170" y="156" class="sub">análises doutrinárias</text>
          @for (d of tscDoctrines; track d.n; let i = $index) {
            <g class="node" [class.key]="d.n === 4">
              <rect [attr.x]="8 + (i % 2) * 164" [attr.y]="166 + floor(i / 2) * 46" width="160" height="38" rx="10" />
              <text [attr.x]="88 + (i % 2) * 164" [attr.y]="182 + floor(i / 2) * 46" class="year">{{ d.n }} · {{ d.name }}</text>
              <text [attr.x]="88 + (i % 2) * 164" [attr.y]="197 + floor(i / 2) * 46" class="sub">{{ d.about }}</text>
            </g>
          }
        </svg>
      }
      @case ('tsc-historia') {
        <svg viewBox="0 0 340 268" role="img" aria-label="A experiência com o Espírito Santo ao longo da história: Antigo Testamento, Novo Testamento, primeiros séculos da Igreja e hoje">
          <g class="links"><path d="M36 34 V234" /></g>
          @for (s of tscSteps; track s.title; let i = $index) {
            <g class="place"><circle cx="36" [attr.cy]="34 + i * 66" r="9" /></g>
            <text x="62" [attr.y]="30 + i * 66" class="year start">{{ s.title }}</text>
            <text x="62" [attr.y]="50 + i * 66" class="sub start">{{ s.text }}</text>
          }
        </svg>
      }
      @case ('ad-arvore') {
        <svg viewBox="0 0 340 618" role="img" aria-label="Árvore das Assembleias de Deus no Brasil, de 1911 até hoje">
          <g class="links">
            <path d="M170 74 V104 M170 152 V182 M170 230 V252 H88 V272 M170 252 H252 V272 M252 336 V366" />
            <path class="dashed" d="M88 336 V478 M252 430 V478" />
            <path d="M170 542 V560" />
          </g>
          <g class="node key"><rect x="40" y="10" width="260" height="64" rx="12" />
            <text x="170" y="32" class="year">1911 · Belém (PA)</text>
            <text x="170" y="50">Missão da Fé Apostólica</text>
            <text x="170" y="66" class="sub">Gunnar Vingren e Daniel Berg</text></g>
          <g class="node"><rect x="40" y="104" width="260" height="48" rx="12" />
            <text x="170" y="125" class="year">1918 · Assembleia de Deus</text>
            <text x="170" y="142" class="sub">a igreja é registrada com o novo nome</text></g>
          <g class="node"><rect x="40" y="182" width="260" height="48" rx="12" />
            <text x="170" y="203" class="year">1924 · Rio de Janeiro</text>
            <text x="170" y="220" class="sub">Vingren pastoreia em São Cristóvão</text></g>
          <g class="node"><rect x="10" y="272" width="156" height="64" rx="12" />
            <text x="88" y="294" class="year">1930 · CGADB</text>
            <text x="88" y="311">Convenção Geral</text>
            <text x="88" y="327" class="sub">1ª assembleia em Natal</text></g>
          <g class="node madureira"><rect x="174" y="272" width="156" height="64" rx="12" />
            <text x="252" y="294" class="year">1929 · Madureira</text>
            <text x="252" y="311">Ministério</text>
            <text x="252" y="327" class="sub">no subúrbio do Rio</text></g>
          <g class="node madureira"><rect x="174" y="366" width="156" height="64" rx="12" />
            <text x="252" y="388" class="year">1958 · Convenção</text>
            <text x="252" y="405">de Madureira</text>
            <text x="252" y="421" class="sub">hoje CONAMAD</text></g>
          <g class="node event"><rect x="20" y="478" width="300" height="64" rx="12" />
            <text x="170" y="500" class="year">1989 · Assembleia em Salvador</text>
            <text x="170" y="517">Madureira deixa a CGADB</text>
            <text x="170" y="533" class="sub">e a CONAMAD segue independente</text></g>
          <g class="node key"><rect x="20" y="560" width="300" height="52" rx="12" />
            <text x="170" y="582">Hoje: “Missão” (CGADB e CADB)</text>
            <text x="170" y="600">e “Madureira” (CONAMAD)</text></g>
        </svg>
      }
      @case ('frida-caminho') {
        <svg viewBox="0 0 340 320" role="img" aria-label="O caminho de Frida Vingren: da Suécia a Belém, ao Rio de Janeiro e de volta à Suécia">
          <g class="region"><rect x="186" y="8" width="146" height="128" rx="18" /><text x="259" y="30" class="label">SUÉCIA</text></g>
          <g class="region"><rect x="8" y="150" width="170" height="162" rx="18" /><text x="93" y="172" class="label">BRASIL</text></g>
          <g class="links">
            <path class="route" d="M232 100 C 150 80, 120 120, 92 198" />
            <path d="M92 210 V262" />
            <path class="route back" d="M96 274 C 190 300, 246 230, 246 110" />
          </g>
          <text x="152" y="96" class="year">1917</text>
          <text x="102" y="242" class="year">1924</text>
          <text x="276" y="214" class="year">1932</text>
          <g class="place"><circle cx="270" cy="52" r="6" /><text x="270" y="72" class="sub">Själevad · 1891</text></g>
          <g class="place"><circle cx="246" cy="100" r="7" /><text x="258" y="105" class="sub start">Estocolmo</text></g>
          <g class="place"><circle cx="92" cy="204" r="7" /><text x="106" y="209" class="sub start">Belém</text></g>
          <g class="place"><circle cx="92" cy="268" r="7" /><text x="78" y="294" class="sub">Rio de Janeiro</text></g>
        </svg>
      }
      @case ('duas-maos') {
        <svg viewBox="0 0 340 330" role="img" aria-label="O que a igreja e o Estado levam para a cidade">
          <g class="node key"><rect x="6" y="8" width="158" height="206" rx="14" />
            <text x="85" y="34" class="label">IGREJA</text>
            <text x="85" y="52" class="sub">forma a comunidade</text></g>
          <g class="node madureira"><rect x="176" y="8" width="158" height="206" rx="14" />
            <text x="255" y="34" class="label">ESTADO</text>
            <text x="255" y="52" class="sub">constrói a estrutura</text></g>
          @for (t of churchGives; track t; let i = $index) {
            <circle class="dot gold" cx="22" [attr.cy]="80 + i * 27" r="4" />
            <text x="32" [attr.y]="85 + i * 27" class="start">{{ t }}</text>
          }
          @for (t of stateGives; track t; let i = $index) {
            <circle class="dot" cx="192" [attr.cy]="80 + i * 27" r="4" />
            <text x="202" [attr.y]="85 + i * 27" class="start">{{ t }}</text>
          }
          <g class="links"><path d="M85 214 C 85 244, 150 238, 160 262 M255 214 C 255 244, 190 238, 180 262" /></g>
          <g class="node event"><rect x="60" y="262" width="220" height="60" rx="14" />
            <text x="170" y="286" class="year">A CIDADE</text>
            <text x="170" y="306">comunidade + estrutura</text></g>
        </svg>
      }
      @case ('cidade-capela') {
        <svg viewBox="0 0 340 568" role="img" aria-label="Como uma cidade do interior nascia em volta da capela, em quatro etapas">
          <defs>
            <g id="fig-capela"><rect class="bldg chapel" x="-22" y="-40" width="44" height="40" /><polygon class="roof" points="-27,-40 0,-61 27,-40" />
              <rect class="door" x="-6" y="-18" width="12" height="18" /><path class="cross" d="M0 -76 V-61 M-6 -70 H6" /></g>
            <g id="fig-casa"><rect class="bldg" x="-11" y="-18" width="22" height="18" /><polygon class="roof" points="-14,-18 0,-30 14,-18" /></g>
            <g id="fig-arvore"><path class="trunk" d="M0 0 V-14" /><circle class="tree" cy="-24" r="11" /></g>
            <g id="fig-camara"><polygon class="roof" points="-31,-34 0,-47 31,-34" /><rect class="bldg" x="-27" y="-34" width="54" height="34" />
              <path class="cols" d="M-17 -30 V-3 M-6 -30 V-3 M6 -30 V-3 M17 -30 V-3" /></g>
            <g id="fig-escola"><rect class="bldg" x="-25" y="-28" width="50" height="28" /><path class="pole" d="M20 -28 V-52" /><polygon class="flag" points="20,-52 33,-47 20,-42" />
              <rect class="win" x="-18" y="-20" width="9" height="9" /><rect class="win" x="-4" y="-20" width="9" height="9" /></g>
            <g id="fig-poste"><path class="pole" d="M0 0 V-58 M-9 -52 H9" /></g>
            <g id="fig-caixa"><path class="pole" d="M-8 0 L-5 -36 M8 0 L5 -36" /><rect class="bldg" x="-12" y="-54" width="24" height="18" rx="3" /></g>
          </defs>
          @for (p of cityStages; track p.title; let i = $index) {
            <g [attr.transform]="'translate(0 ' + i * 140 + ')'">
              <rect class="panel" x="4" y="4" width="332" height="132" rx="14" />
              <text x="18" y="26" class="year start">{{ i + 1 }} · {{ p.title }}</text>
              <text x="18" y="44" class="sub start">{{ p.text }}</text>
              @if (i >= 2) { <rect class="road" [class.asphalt]="i === 3" x="14" y="124" width="312" height="7" rx="2" /> }
              <path class="ground" d="M14 124 H326" />
              @if (i === 3) { <path class="wire" d="M264 68 Q 277 76 290 68" /> }
              @for (e of p.items; track $index) {
                <use [attr.href]="'#fig-' + e[0]" [attr.x]="e[1]" y="124" />
              }
            </g>
          }
        </svg>
      }
      @case ('berg-vingren-viagem') {
        <svg viewBox="0 0 340 330" role="img" aria-label="A viagem de Gunnar Vingren e Daniel Berg: da Suécia aos Estados Unidos e de Nova York a Belém do Pará">
          <g class="region"><rect x="8" y="8" width="186" height="150" rx="18" /><text x="101" y="30" class="label">ESTADOS UNIDOS</text></g>
          <g class="region"><rect x="214" y="8" width="118" height="120" rx="18" /><text x="273" y="30" class="label">SUÉCIA</text></g>
          <g class="region"><rect x="96" y="196" width="236" height="126" rx="18" /><text x="214" y="218" class="label">BRASIL</text></g>
          <g class="links">
            <path class="route" d="M262 72 C 220 56, 110 56, 52 72" />
            <path d="M48 82 C 66 112, 104 124, 150 116" />
            <path class="route back" d="M158 122 C 200 150, 230 200, 210 262" />
          </g>
          <text x="200" y="50" class="year">1902–1903</text>
          <text x="248" y="186" class="year">nov. 1910</text>
          <g class="place"><circle cx="268" cy="72" r="7" /><text x="273" y="96" class="sub">Östra Husby</text><text x="273" y="112" class="sub">e Vargön</text></g>
          <g class="place"><circle cx="46" cy="76" r="7" /><text x="60" y="94" class="sub start">Chicago e</text><text x="60" y="110" class="sub start">South Bend</text></g>
          <g class="place"><circle cx="154" cy="118" r="7" /><text x="140" y="144" class="sub">Nova York</text></g>
          <g class="place"><circle cx="208" cy="268" r="8" /><text x="224" y="273" class="sub start">Belém do Pará</text><text x="224" y="290" class="sub start">1910–1911</text></g>
        </svg>
      }
    }
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; max-width: 420px; height: auto; margin: 0 auto; }
    text { font-family: Inter, sans-serif; font-size: 13px; text-anchor: middle; fill: var(--mat-sys-on-surface); }
    .year { font-weight: 700; fill: var(--accent-gold); }
    .sub { fill: var(--mat-sys-on-surface-variant); }
    .start { text-anchor: start; }
    .label { font-weight: 700; letter-spacing: 2px; fill: var(--mat-sys-on-surface-variant); }
    .node rect { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); stroke-width: 1.5; }
    .node.key rect { stroke: var(--accent-gold); }
    .node.madureira rect { stroke: var(--mat-sys-primary); }
    .node.event rect { fill: color-mix(in srgb, var(--accent-gold) 12%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .links path { fill: none; stroke: var(--mat-sys-outline); stroke-width: 2; }
    .links .dashed { stroke-dasharray: 6 5; }
    .links .route { stroke: var(--accent-gold); stroke-dasharray: 7 6; stroke-width: 2.5; }
    .links .back { stroke: var(--mat-sys-primary); }
    .region rect { fill: var(--mat-sys-surface-container); stroke: var(--mat-sys-outline-variant); }
    .place circle { fill: var(--mat-sys-primary); stroke: var(--mat-sys-surface); stroke-width: 2; }
    .dot { fill: var(--mat-sys-primary); }
    .dot.gold { fill: var(--accent-gold); }
    .panel { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); }
    .ground { stroke: var(--mat-sys-outline); stroke-width: 1.5; }
    .road { fill: color-mix(in srgb, var(--accent-gold) 30%, var(--mat-sys-surface)); }
    .road.asphalt { fill: var(--mat-sys-on-surface-variant); }
    .bldg { fill: var(--mat-sys-surface-container-high); stroke: var(--mat-sys-on-surface-variant); stroke-width: 1.2; }
    .bldg.chapel { fill: var(--mat-sys-surface); stroke: var(--accent-gold); stroke-width: 1.8; }
    .roof { fill: color-mix(in srgb, var(--accent-gold) 55%, var(--mat-sys-surface)); stroke: var(--accent-gold); stroke-width: 1.2; }
    .door, .win { fill: var(--mat-sys-on-surface-variant); }
    .cross, .pole, .cols, .trunk { fill: none; stroke: var(--mat-sys-on-surface-variant); stroke-width: 2; }
    .cross { stroke: var(--accent-gold); }
    .flag { fill: var(--mat-sys-primary); }
    .tree { fill: color-mix(in srgb, var(--mat-sys-primary) 45%, var(--mat-sys-surface)); }
    .wire { fill: none; stroke: var(--mat-sys-on-surface-variant); stroke-width: 1; }
  `,
})
export class Figure {
  readonly id = input.required<string>();
  /** Os oito capítulos de doutrina da Teologia Sistemático-Carismática, na ordem da introdução geral. */
  protected readonly tscDoctrines = [
    { n: 3, name: 'Teologia', about: 'Deus' }, { n: 4, name: 'Pneumatologia', about: 'o Espírito Santo' },
    { n: 5, name: 'Cristologia', about: 'Jesus Cristo' }, { n: 6, name: 'Antropologia', about: 'o ser humano' },
    { n: 7, name: 'Hamartiologia', about: 'o pecado' }, { n: 8, name: 'Soteriologia', about: 'a salvação' },
    { n: 9, name: 'Eclesiologia', about: 'a Igreja' }, { n: 10, name: 'Escatologia', about: 'as últimas coisas' },
  ];
  protected floor(n: number): number {
    return Math.floor(n);
  }
  /** A experiência com o Espírito ao longo da história, como a Teologia Sistemático-Carismática a apresenta. */
  protected readonly tscSteps = [
    { title: 'Antigo Testamento', text: 'o Espírito sobre juízes, reis e profetas' },
    { title: 'Novo Testamento', text: 'Jesus ungido, Pentecostes e Atos' },
    { title: 'Primeiros séculos', text: 'os pais da Igreja (patrística)' },
    { title: 'Movimentos de renovação', text: 'do fim do século XIX em diante' },
  ];

  protected readonly churchGives = ['Reúne as pessoas', 'Ensina a Palavra', 'Acolhe quem chega', 'Cuida de quem sofre', 'Ora pela cidade'];
  protected readonly stateGives = ['Água e esgoto', 'Energia elétrica', 'Estrada e asfalto', 'Escola e saúde', 'Leis e segurança'];
  /** Etapas da cidade: [desenho, posição x] sobre a linha do chão. */
  protected readonly cityStages: { title: string; text: string; items: [string, number][] }[] = [
    { title: 'A capela', text: 'Terra doada ao santo e uma capela', items: [['arvore', 70], ['arvore', 96], ['capela', 170], ['arvore', 250], ['arvore', 278]] },
    { title: 'O arraial', text: 'Casas em volta da praça da igreja', items: [['casa', 84], ['casa', 114], ['capela', 170], ['casa', 226], ['casa', 256], ['arvore', 296]] },
    { title: 'A vila', text: 'Câmara municipal e estrada', items: [['casa', 50], ['casa', 78], ['capela', 136], ['camara', 220], ['casa', 274], ['casa', 302]] },
    { title: 'A cidade', text: 'Escola, água, luz e asfalto', items: [['escola', 40], ['casa', 82], ['capela', 122], ['camara', 186], ['casa', 236], ['poste', 264], ['poste', 290], ['caixa', 316]] },
  ];
}
