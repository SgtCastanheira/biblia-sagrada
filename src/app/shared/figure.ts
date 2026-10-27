import { Component, input } from '@angular/core';
import { TanakhShelf } from './tanakh-shelf';

/**
 * Ilustrações desenhadas pelo app para os estudos (":::figura id" no texto).
 * São SVG com as cores do tema, para funcionar no claro, no escuro e sem internet.
 */
@Component({
  selector: 'app-figure',
  imports: [TanakhShelf],
  template: `
    @switch (id()) {
      @case ('biblia-judaica') { <app-tanakh-shelf /> }
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
  `,
})
export class Figure {
  readonly id = input.required<string>();
}
