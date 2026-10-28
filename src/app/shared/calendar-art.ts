import { Component, input } from '@angular/core';

/** Mês do ano judaico, com o mês aproximado do nosso calendário e se tem festa. */
const JEWISH_MONTHS: { name: string; ours: string; feast?: boolean }[] = [
  { name: 'Nisã', ours: 'mar–abr', feast: true },
  { name: 'Iyar', ours: 'abr–mai' },
  { name: 'Sivã', ours: 'mai–jun', feast: true },
  { name: 'Tamuz', ours: 'jun–jul' },
  { name: 'Av', ours: 'jul–ago' },
  { name: 'Elul', ours: 'ago–set' },
  { name: 'Tishri', ours: 'set–out', feast: true },
  { name: 'Heshvan', ours: 'out–nov' },
  { name: 'Quisleu', ours: 'nov–dez', feast: true },
  { name: 'Tebete', ours: 'dez–jan' },
  { name: 'Sebate', ours: 'jan–fev' },
  { name: 'Adar', ours: 'fev–mar', feast: true },
];

/** Ponto de um círculo (ângulo em graus, 0 = no alto, no sentido do relógio). */
function at(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Fatia de um anel, de um ângulo a outro. */
function sector(cx: number, cy: number, r1: number, r2: number, from: number, to: number): string {
  const [a, b] = at(cx, cy, r2, from), [c, d] = at(cx, cy, r2, to), [e, f] = at(cx, cy, r1, to), [g, h] = at(cx, cy, r1, from);
  const n = (x: number) => x.toFixed(1);
  return `M${n(a)} ${n(b)} A${r2} ${r2} 0 0 1 ${n(c)} ${n(d)} L${n(e)} ${n(f)} A${r1} ${r1} 0 0 0 ${n(g)} ${n(h)} Z`;
}

const WHEEL = JEWISH_MONTHS.map((m, i) => {
  const deg = i * 30 + 15;
  const [x, y] = at(195, 195, 101, deg);
  // Os meses do nosso calendário ficam do lado de fora: à direita começam no anel, à esquerda terminam nele
  const side = Math.sin((deg * Math.PI) / 180);
  const anchor = side > 0.3 ? 'start' : side < -0.3 ? 'end' : 'middle';
  const [ox, oy] = at(195, 195, anchor === 'middle' ? 150 : 140, deg);
  return { ...m, path: sector(195, 195, 70, 132, i * 30, (i + 1) * 30), x, y, ox, oy, anchor };
});

/** Outubro de 1582: depois da quinta, dia 4, veio a sexta, dia 15 (o mês começou numa segunda). */
const OCTOBER_1582 = [[null, 1, 2, 3, 4, 15, 16], [17, 18, 19, 20, 21, 22, 23], [24, 25, 26, 27, 28, 29, 30], [31]];

/** O ano de 2026 (no fim dele) em outros calendários. */
const YEARS = [
  { year: '2026', name: 'Gregoriano' }, { year: '5787', name: 'Judaico' }, { year: '1448', name: 'Islâmico' },
  { year: '1405', name: 'Persa' }, { year: '2019', name: 'Etíope' }, { year: '1743', name: 'Copta' },
  { year: '2083', name: 'Nepalês' }, { year: '2569', name: 'Tailandês' }, { year: 'Reiwa 8', name: 'Japonês' },
];

/**
 * Ilustrações dos calendários (":::figura" no estudo do Natal): o mês de outubro de 1582, os números escondidos
 * nos nomes dos meses, a roda do ano judaico, o Natal em 7 de janeiro e o ano de 2026 em nove calendários.
 * SVG com as cores do tema.
 */
@Component({
  selector: 'app-calendar-art',
  template: `
    @switch (kind()) {
      @case ('outubro-1582') {
        <svg viewBox="0 0 340 300" role="img" aria-label="Outubro de 1582: depois de quinta-feira, dia 4, veio sexta-feira, dia 15; os dias 5 a 14 não existiram">
          <text x="170" y="22" class="label">OUTUBRO DE 1582</text>
          @for (d of weekdays; track $index; let c = $index) { <text [attr.x]="26 + c * 48" y="48" class="sub">{{ d }}</text> }
          @for (row of october; track $index; let r = $index) {
            @for (day of row; track $index; let c = $index) {
              @if (day) {
                <g class="day" [class.jump]="day === 4 || day === 15">
                  <rect [attr.x]="6 + c * 48" [attr.y]="58 + r * 42" width="40" height="34" rx="8" />
                  <text [attr.x]="26 + c * 48" [attr.y]="81 + r * 42">{{ day }}</text>
                </g>
              }
            }
          }
          <g class="gone"><rect x="20" y="236" width="300" height="34" rx="8" />
            <text x="170" y="258">5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14</text>
            <path d="M34 253 H306" /></g>
          <text x="170" y="292" class="sub">dez dias que não existiram</text>
        </svg>
      }
      @case ('meses-romanos') {
        <svg viewBox="0 0 340 300" role="img" aria-label="Os números escondidos nos nomes dos meses: julho era o quinto, agosto o sexto, setembro o sétimo, outubro o oitavo, novembro o nono e dezembro o décimo mês">
          <text x="170" y="22" class="label">OS NÚMEROS NOS NOMES</text>
          <text x="96" y="48" class="sub">nome antigo</text>
          <text x="216" y="48" class="sub">no começo</text>
          <text x="296" y="48" class="sub">hoje</text>
          @for (m of roman; track m.name; let i = $index) {
            <g class="row"><rect x="8" [attr.y]="58 + i * 38" width="324" height="32" rx="8" />
              <text x="20" [attr.y]="79 + i * 38" class="start strong">{{ m.name }}</text>
              <text x="122" [attr.y]="79 + i * 38" class="start sub">{{ m.latin }}</text>
              <text x="216" [attr.y]="79 + i * 38" class="year">{{ m.then }}º</text>
              <text x="254" [attr.y]="79 + i * 38" class="sub">→</text>
              <text x="296" [attr.y]="79 + i * 38" class="strong">{{ m.now }}º</text></g>
          }
          <text x="170" y="292" class="sub">o ano romano começava em março</text>
        </svg>
      }
      @case ('ano-judaico') {
        <svg viewBox="0 0 390 390" role="img" aria-label="A roda do ano judaico: doze meses lunares, de nisã a adar, com o mês aproximado do nosso calendário; os meses com festas bíblicas aparecem em dourado">
          @for (m of wheel; track m.name) {
            <path class="slice" [class.feast]="m.feast" [attr.d]="m.path" />
            <text [attr.x]="m.x" [attr.y]="m.y + 5" class="strong">{{ m.name }}</text>
            <text [attr.x]="m.ox" [attr.y]="m.oy + 5" class="sub" [class.start]="m.anchor === 'start'" [class.end]="m.anchor === 'end'">{{ m.ours }}</text>
          }
          <text x="195" y="185" class="label">ANO</text>
          <text x="195" y="205" class="label">JUDAICO</text>
          <text x="195" y="227" class="sub">em dourado,</text>
          <text x="195" y="243" class="sub">as festas</text>
        </svg>
      }
      @case ('natal-13-dias') {
        <svg viewBox="0 0 340 200" role="img" aria-label="O 25 de dezembro do calendário juliano cai em 7 de janeiro do calendário gregoriano: hoje a diferença é de 13 dias">
          <g class="page"><rect x="14" y="20" width="132" height="140" rx="12" /><rect x="14" y="20" width="132" height="34" rx="12" class="top" />
            <text x="80" y="43" class="on-top">juliano</text>
            <text x="80" y="112" class="big">25</text><text x="80" y="140" class="sub">dezembro</text></g>
          <text x="170" y="100" class="eq">=</text>
          <g class="page"><rect x="194" y="20" width="132" height="140" rx="12" /><rect x="194" y="20" width="132" height="34" rx="12" class="top green" />
            <text x="260" y="43" class="on-top">gregoriano</text>
            <text x="260" y="112" class="big">7</text><text x="260" y="140" class="sub">janeiro</text></g>
          <text x="170" y="190" class="sub">o mesmo dia, com 13 dias de diferença</text>
        </svg>
      }
      @case ('ano-2026') {
        <svg viewBox="0 0 340 290" role="img" aria-label="O fim de 2026 em nove calendários: gregoriano 2026, judaico 5787, islâmico 1448, persa 1405, etíope 2019, copta 1743, nepalês 2083, tailandês 2569 e japonês Reiwa 8">
          <text x="170" y="22" class="label">2026 EM NOVE CALENDÁRIOS</text>
          @for (y of years; track y.name; let i = $index) {
            <g class="card" [class.ours]="i === 0">
              <rect [attr.x]="8 + (i % 3) * 110" [attr.y]="38 + floor(i / 3) * 82" width="104" height="74" rx="12" />
              <text [attr.x]="60 + (i % 3) * 110" [attr.y]="72 + floor(i / 3) * 82" class="num">{{ y.year }}</text>
              <text [attr.x]="60 + (i % 3) * 110" [attr.y]="96 + floor(i / 3) * 82" class="sub">{{ y.name }}</text>
            </g>
          }
        </svg>
      }
    }
  `,
  styles: `
    :host { display: block; }
    svg { display: block; width: 100%; max-width: 420px; height: auto; margin: 0 auto; }
    text { font-family: Inter, sans-serif; font-size: 13px; text-anchor: middle; fill: var(--mat-sys-on-surface); }
    .label { font-weight: 700; letter-spacing: 1.5px; fill: var(--accent-gold); }
    .sub { fill: var(--mat-sys-on-surface-variant); }
    .strong { font-weight: 600; }
    .start { text-anchor: start; }
    .end { text-anchor: end; }
    .year { font-weight: 700; fill: var(--accent-gold); }
    .day rect, .row rect, .card rect, .page rect { fill: var(--mat-sys-surface-container-low); stroke: var(--mat-sys-outline-variant); stroke-width: 1.5; }
    .day.jump rect { fill: color-mix(in srgb, var(--accent-gold) 22%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .day.jump text { font-weight: 700; }
    .gone rect { fill: none; stroke: var(--mat-sys-outline-variant); stroke-dasharray: 5 4; }
    .gone text { fill: var(--mat-sys-on-surface-variant); }
    .gone path { stroke: var(--mat-sys-error, #b3261e); stroke-width: 2; }
    .slice { fill: color-mix(in srgb, var(--mat-sys-primary) 12%, var(--mat-sys-surface)); stroke: var(--mat-sys-surface); stroke-width: 2; }
    .slice.feast { fill: color-mix(in srgb, var(--accent-gold) 30%, var(--mat-sys-surface)); }
    .page .top { fill: var(--accent-gold); stroke: none; }
    .page .top.green { fill: var(--mat-sys-primary); }
    .on-top { font-weight: 700; fill: #fff8ec; }
    .big { font: 700 46px var(--heading-font, serif); fill: var(--mat-sys-on-surface); }
    .eq { font: 700 34px Inter, sans-serif; fill: var(--accent-gold); }
    .card.ours rect { fill: color-mix(in srgb, var(--accent-gold) 16%, var(--mat-sys-surface)); stroke: var(--accent-gold); }
    .num { font: 700 22px var(--heading-font, serif); fill: var(--mat-sys-on-surface); }
  `,
})
export class CalendarArt {
  readonly kind = input.required<string>();
  protected readonly weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  protected readonly october = OCTOBER_1582;
  protected readonly wheel = WHEEL;
  protected readonly years = YEARS;
  protected readonly roman = [
    { name: 'Julho', latin: 'Quintilis', then: 5, now: 7 },
    { name: 'Agosto', latin: 'Sextilis', then: 6, now: 8 },
    { name: 'Setembro', latin: 'September', then: 7, now: 9 },
    { name: 'Outubro', latin: 'October', then: 8, now: 10 },
    { name: 'Novembro', latin: 'November', then: 9, now: 11 },
    { name: 'Dezembro', latin: 'December', then: 10, now: 12 },
  ];
  protected floor(n: number): number {
    return Math.floor(n);
  }
}
