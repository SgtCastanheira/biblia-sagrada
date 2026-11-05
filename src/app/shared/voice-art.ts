import { Component, computed, input } from '@angular/core';
import { LangCode } from '../core/guest-sermons';

interface ArtText {
  leech: { front: string; body: string; back: string; blood: string; alt: string };
  family: { mother: string; give: string; alt: string };
  cycle: { nodes: [string, string][]; arrows: [string, string]; alt: string };
  cistern: { spring: [string, string]; broken: [string, string]; alt: string };
}

/** Os rótulos dos desenhos em cada língua do jornal. */
const TEXT: Record<LangCode, ArtText> = {
  pt: {
    leech: { front: 'ventosa da frente (boca)', body: 'corpo em anéis', back: 'ventosa de trás', blood: 'sangue', alt: 'Desenho de uma sanguessuga: corpo mole em anéis, com uma ventosa em cada ponta' },
    family: { mother: 'a sanguessuga', give: 'Dá!', alt: 'A sanguessuga e as suas duas filhas, que pedem: Dá, Dá' },
    cycle: { nodes: [['1 · Desejo', 'atrai e engoda (Tg 1.14)'], ['2 · Pecado', 'o desejo concebe e o dá à luz'], ['3 · Morte', 'o pecado consumado a gera']], arrows: ['concebe', 'consumado'], alt: 'O caminho de Tiago 1: o desejo gera o pecado, e o pecado consumado gera a morte' },
    cistern: { spring: ['Deus', 'fonte de água viva'], broken: ['O que o mundo oferece', 'cisternas rotas'], alt: 'A fonte de água viva, cheia, ao lado de cisternas rotas, que deixam a água escapar' },
  },
  es: {
    leech: { front: 'ventosa delantera (boca)', body: 'cuerpo en anillos', back: 'ventosa trasera', blood: 'sangre', alt: 'Dibujo de una sanguijuela: cuerpo blando en anillos, con una ventosa en cada extremo' },
    family: { mother: 'la sanguijuela', give: '¡Trae!', alt: 'La sanguijuela y sus dos hijas, que piden: Trae, trae' },
    cycle: { nodes: [['1 · Deseo', 'atrae y seduce (Stg 1:14)'], ['2 · Pecado', 'el deseo concibe y lo da a luz'], ['3 · Muerte', 'el pecado consumado la engendra']], arrows: ['concibe', 'consumado'], alt: 'El camino de Santiago 1: el deseo engendra el pecado, y el pecado consumado engendra la muerte' },
    cistern: { spring: ['Dios', 'fuente de agua viva'], broken: ['Lo que ofrece el mundo', 'cisternas rotas'], alt: 'La fuente de agua viva, llena, junto a cisternas rotas que dejan escapar el agua' },
  },
  en: {
    leech: { front: 'front sucker (mouth)', body: 'ringed body', back: 'rear sucker', blood: 'blood', alt: 'Drawing of a leech: a soft body in rings, with a sucker at each end' },
    family: { mother: 'the leech', give: 'Give!', alt: 'The leech and her two daughters, who ask: Give, give' },
    cycle: { nodes: [['1 · Desire', 'draws away and entices (Jas 1:14)'], ['2 · Sin', 'desire conceives and gives birth'], ['3 · Death', 'full-grown sin brings it forth']], arrows: ['conceives', 'full-grown'], alt: 'The path of James 1: desire gives birth to sin, and full-grown sin brings forth death' },
    cistern: { spring: ['God', 'fountain of living water'], broken: ['What the world offers', 'broken cisterns'], alt: 'The fountain of living water, full, beside broken cisterns that let the water escape' },
  },
  fr: {
    leech: { front: 'ventouse avant (bouche)', body: 'corps annelé', back: 'ventouse arrière', blood: 'sang', alt: 'Dessin d’une sangsue : un corps mou en anneaux, avec une ventouse à chaque bout' },
    family: { mother: 'la sangsue', give: 'Donne !', alt: 'La sangsue et ses deux filles, qui demandent : Donne, donne' },
    cycle: { nodes: [['1 · Désir', 'attire et amorce (Jc 1:14)'], ['2 · Péché', 'le désir conçoit et l’enfante'], ['3 · Mort', 'le péché consommé la produit']], arrows: ['conçoit', 'consommé'], alt: 'Le chemin de Jacques 1 : le désir enfante le péché, et le péché consommé produit la mort' },
    cistern: { spring: ['Dieu', 'source d’eau vive'], broken: ['Ce que le monde offre', 'citernes crevassées'], alt: 'La source d’eau vive, pleine, à côté de citernes crevassées qui laissent fuir l’eau' },
  },
  de: {
    leech: { front: 'vorderer Saugnapf (Mund)', body: 'geringelter Körper', back: 'hinterer Saugnapf', blood: 'Blut', alt: 'Zeichnung eines Blutegels: ein weicher, geringelter Körper mit einem Saugnapf an jedem Ende' },
    family: { mother: 'der Blutegel', give: 'Bring her!', alt: 'Der Blutegel und seine zwei Töchter, die fordern: Bring her, bring her' },
    cycle: { nodes: [['1 · Begierde', 'reizt und lockt (Jak 1,14)'], ['2 · Sünde', 'die Begierde empfängt und gebiert'], ['3 · Tod', 'die vollendete Sünde gebiert ihn']], arrows: ['empfängt', 'vollendet'], alt: 'Der Weg aus Jakobus 1: Die Begierde gebiert die Sünde, und die vollendete Sünde gebiert den Tod' },
    cistern: { spring: ['Gott', 'Quelle lebendigen Wassers'], broken: ['Was die Welt bietet', 'löcherige Brunnen'], alt: 'Die Quelle lebendigen Wassers, voll, neben löcherigen Brunnen, aus denen das Wasser entweicht' },
  },
  ru: {
    leech: { front: 'передняя присоска (рот)', body: 'тело из колец', back: 'задняя присоска', blood: 'кровь', alt: 'Рисунок пиявки: мягкое тело из колец с присоской на каждом конце' },
    family: { mother: 'пиявка', give: 'Давай!', alt: 'Пиявка и две её дочери, которые просят: давай, давай' },
    cycle: { nodes: [['1 · Похоть', 'влечёт и обольщает (Иак 1:14)'], ['2 · Грех', 'похоть зачинает и рождает его'], ['3 · Смерть', 'совершившийся грех рождает её']], arrows: ['зачинает', 'совершился'], alt: 'Путь из Иакова 1: похоть рождает грех, а совершившийся грех рождает смерть' },
    cistern: { spring: ['Бог', 'источник воды живой'], broken: ['Что предлагает мир', 'разбитые водоёмы'], alt: 'Источник воды живой, полный, рядом с разбитыми водоёмами, из которых уходит вода' },
  },
};

/** Ilustrações do sermão “A Sanguessuga” (SVG com as cores do tema, desenhadas para o app): a sanguessuga, a mãe e as filhas, o caminho do desejo e a fonte e as cisternas. */
@Component({
  selector: 'app-voice-art',
  template: `
    @switch (id()) {
      @case ('sanguessuga') {
        <svg viewBox="0 0 340 190" role="img" [attr.aria-label]="t().leech.alt">
          <path class="body" [attr.d]="bodyPath" />
          <path class="rings" [attr.d]="bodyPath" />
          <ellipse class="sucker" cx="50" cy="130" rx="19" ry="16" transform="rotate(-18 50 130)" />
          <ellipse class="sucker" cx="297" cy="90" rx="16" ry="14" transform="rotate(38 297 90)" />
          <circle class="mouth" cx="301" cy="94" r="5" />
          <path class="drop" d="M316 124 C308 136 304 142 316 150 C328 142 324 136 316 124 Z" />
          <g class="lead"><path d="M297 74 L262 42 M115 96 L115 62 M50 148 L58 164" /></g>
          <text x="252" y="32" class="small">{{ t().leech.front }}</text>
          <text x="115" y="52" class="small">{{ t().leech.body }}</text>
          <text x="62" y="180" class="small">{{ t().leech.back }}</text>
          <text x="334" y="172" class="small end">{{ t().leech.blood }}</text>
        </svg>
      }
      @case ('da-da') {
        <svg viewBox="0 0 340 236" role="img" [attr.aria-label]="t().family.alt">
          <g class="lead"><path d="M150 84 L84 148 M190 84 L256 148" /></g>
          <g transform="translate(94 14) scale(0.8)">
            <path class="body" [attr.d]="miniPath" /><path class="rings" [attr.d]="miniPath" />
            <ellipse class="sucker" cx="10" cy="30" rx="15" ry="13" /><ellipse class="sucker" cx="196" cy="18" rx="13" ry="11" />
          </g>
          <text x="170" y="100" class="small">{{ t().family.mother }}</text>
          <g transform="translate(34 152) scale(0.5)">
            <path class="body" [attr.d]="miniPath" /><path class="rings" [attr.d]="miniPath" />
            <ellipse class="sucker" cx="10" cy="30" rx="15" ry="13" /><ellipse class="sucker" cx="196" cy="18" rx="13" ry="11" />
          </g>
          <g transform="translate(208 152) scale(0.5)">
            <path class="body" [attr.d]="miniPath" /><path class="rings" [attr.d]="miniPath" />
            <ellipse class="sucker" cx="10" cy="30" rx="15" ry="13" /><ellipse class="sucker" cx="196" cy="18" rx="13" ry="11" />
          </g>
          <g class="bubble"><rect x="42" y="190" width="94" height="32" rx="16" /><path d="M76 190 L84 180 L92 190" />
            <rect x="204" y="190" width="94" height="32" rx="16" /><path d="M238 190 L246 180 L254 190" /></g>
          <text x="89" y="212" class="shout">{{ t().family.give }}</text>
          <text x="251" y="212" class="shout">{{ t().family.give }}</text>
        </svg>
      }
      @case ('ciclo-do-desejo') {
        <svg viewBox="0 0 340 268" role="img" [attr.aria-label]="t().cycle.alt">
          <g class="links"><path d="M170 66 V102 M170 160 V196" /><path class="head" d="M162 96 L170 106 L178 96 M162 190 L170 200 L178 190" /></g>
          @for (n of t().cycle.nodes; track $index) {
            <g class="node" [class.key]="$index === 1" [class.danger]="$index === 2">
              <rect x="40" [attr.y]="12 + $index * 94" width="260" height="54" rx="12" />
              <text x="170" [attr.y]="34 + $index * 94" class="year">{{ n[0] }}</text>
              <text x="170" [attr.y]="54 + $index * 94" class="small">{{ n[1] }}</text>
            </g>
          }
          <text x="184" y="89" class="small start">{{ t().cycle.arrows[0] }}</text>
          <text x="184" y="183" class="small start">{{ t().cycle.arrows[1] }}</text>
        </svg>
      }
      @case ('cisternas') {
        <svg viewBox="0 0 340 236" role="img" [attr.aria-label]="t().cistern.alt">
          <!-- Fonte de água viva: o jato cai numa bacia cheia -->
          <path class="water-line" d="M82 14 C82 50 72 70 70 112 M82 14 C82 50 92 70 94 112" />
          <path class="basin" d="M18 104 H148 C148 156 128 172 83 172 C38 172 18 156 18 104 Z" />
          <path class="water" d="M23 112 H143 C142 152 126 166 83 166 C40 166 24 152 23 112 Z" />
          <path class="wave" d="M23 112 q15 -9 30 0 t30 0 t30 0 t30 0" />
          <text x="83" y="200" class="year">{{ t().cistern.spring[0] }}</text>
          <text x="83" y="220" class="small">{{ t().cistern.spring[1] }}</text>
          <!-- Cisterna rota: rachaduras e gotas que escapam -->
          <path class="basin" d="M192 104 H322 C322 156 302 172 257 172 C212 172 192 156 192 104 Z" />
          <path class="water low" d="M201 152 H313 C308 164 292 168 257 168 C222 168 206 164 201 152 Z" />
          <path class="crack" d="M232 106 L224 128 L236 142 L228 164 M286 106 L294 126 L282 144 L290 166" />
          <path class="drop water-drop" d="M221 176 c-4 6 -6 9 0 12 c6 -3 4 -6 0 -12 z M295 178 c-4 6 -6 9 0 12 c6 -3 4 -6 0 -12 z M258 182 c-3 5 -5 8 0 10 c5 -2 3 -5 0 -10 z" />
          <text x="257" y="212" class="year">{{ t().cistern.broken[0] }}</text>
          <text x="257" y="230" class="small">{{ t().cistern.broken[1] }}</text>
        </svg>
      }
    }
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; max-width: 380px; height: auto; margin: 0 auto; }
    text { font-family: Inter, sans-serif; font-size: 13px; text-anchor: middle; fill: var(--mat-sys-on-surface); }
    .small { fill: var(--mat-sys-on-surface-variant); }
    .year { font-weight: 700; fill: var(--accent-gold); }
    .start { text-anchor: start; }
    .end { text-anchor: end; }
    .shout { font: 700 16px Inter, sans-serif; fill: var(--mat-sys-on-surface); }
    .body { fill: none; stroke: color-mix(in srgb, var(--mat-sys-primary) 62%, var(--mat-sys-surface)); stroke-width: 28; stroke-linecap: round; }
    .rings { fill: none; stroke: var(--mat-sys-surface); stroke-opacity: .5; stroke-width: 28; stroke-dasharray: 2.5 9; }
    .sucker { fill: color-mix(in srgb, var(--mat-sys-primary) 78%, var(--mat-sys-on-surface)); stroke: var(--mat-sys-surface); stroke-width: 2; }
    .mouth { fill: var(--mat-sys-surface); }
    .drop { fill: var(--mat-sys-error, #b3261e); }
    .lead path { fill: none; stroke: var(--mat-sys-outline); stroke-width: 1.5; stroke-dasharray: 4 4; }
    .bubble rect, .bubble path { fill: var(--mat-sys-surface); stroke: var(--accent-gold); stroke-width: 2; }
    .links path { fill: none; stroke: var(--mat-sys-outline); stroke-width: 2; }
    .links .head { stroke: var(--accent-gold); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .node rect { fill: var(--mat-sys-surface); stroke: var(--mat-sys-outline-variant); stroke-width: 1.5; }
    .node.key rect { stroke: var(--accent-gold); stroke-width: 2; }
    .node.danger rect { stroke: var(--mat-sys-error, #b3261e); stroke-width: 2; }
    .basin { fill: var(--mat-sys-surface-container-high); stroke: var(--mat-sys-on-surface-variant); stroke-width: 2.5; stroke-linejoin: round; }
    .water { fill: color-mix(in srgb, #4a90c2 72%, var(--mat-sys-surface)); }
    .water.low { opacity: .7; }
    .drop.water-drop { fill: color-mix(in srgb, #4a90c2 72%, var(--mat-sys-surface)); }
    .water-line { fill: none; stroke: color-mix(in srgb, #4a90c2 72%, var(--mat-sys-surface)); stroke-width: 6; stroke-linecap: round; }
    .wave { fill: none; stroke: var(--mat-sys-surface); stroke-width: 2; opacity: .7; }
    .crack { fill: none; stroke: var(--mat-sys-error, #b3261e); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  `,
})
export class VoiceArt {
  readonly id = input.required<string>();
  readonly lang = input<LangCode>('pt');
  protected readonly t = computed(() => TEXT[this.lang()] ?? TEXT.pt);
  /** O corpo da sanguessuga (um traço grosso e curvo; os anéis vêm de um segundo traço tracejado por cima). */
  protected readonly bodyPath = 'M50 130 C84 72 140 152 190 102 S262 58 297 90';
  protected readonly miniPath = 'M10 30 C40 -6 80 56 120 22 S170 -4 196 18';
}
