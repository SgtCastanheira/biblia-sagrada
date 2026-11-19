import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { CHRONO_GROUPS, PHASE_COLORS } from '../../core/bible-chronological';
import {
  buildLives,
  contemporariesOf,
  type Life,
  peopleOfPhase,
  PHASE_PERSON,
  phaseOfLife,
  phasesWithPeople,
  RELATION_LABEL,
  type Relation,
  togetherOf,
} from '../../core/contemporaries';
import { ContentService } from '../../core/content.service';
import { Sheets } from '../../shared/sheets';

/** Um número de ano em texto: 740 a.C., 28 d.C. (não existe o ano zero). */
const yearLabel = (y: number): string => (y < 0 ? `${-y} a.C.` : `${y} d.C.`);

const STEPS = [5, 10, 20, 25, 50, 100, 200, 250, 500];

/** “Quem viveu na mesma época?”: escolhe-se uma pessoa e vê-se quem viveu ao mesmo tempo, em faixas, e o que a Bíblia conta dos encontros. */
@Component({
  selector: 'app-contemporaries',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <section class="cont" aria-labelledby="ct-title">
      <h2 id="ct-title">Quem Viveu na Mesma Época?</h2>
      <p class="hint">
        Escolha um período e, abaixo dele, uma das pessoas que aparecem nele: o bloco mostra quem viveu ao mesmo tempo que ela, pelos anos que o Memorial da Fé dá a cada um.
        Viver na mesma época não quer dizer que se conheceram: quando a Bíblia conta que se encontraram, o versículo aparece à parte.
      </p>

      <label class="select">
        <span>Período <small class="when">{{ periodYears() }}</small></span>
        <select (change)="pickPeriod($event)" [attr.aria-controls]="'ct-people'">
          @for (g of periods(); track g.id) { <option [value]="g.id" [selected]="g.id === period()">{{ g.name }}</option> }
        </select>
      </label>

      <h3 class="sub">Quem aparece neste período <span class="count">{{ inPeriod().length }}</span></h3>
      <div id="ct-people" class="folk" role="group" aria-label="Pessoas do período">
        @for (l of shownPeople(); track l.id) {
          <button type="button" class="pp" matRipple [class.on]="l.id === chosenId()" [attr.aria-pressed]="l.id === chosenId()" [style.--c]="color(l)" (click)="pick(l.id)">
            <strong>{{ l.name }}</strong>
            <small>@if (l.role) { {{ l.role }} · }{{ l.text }}</small>
          </button>
        }
      </div>
      @if (!forcedOpen() && inPeriod().length > preview) {
        <button type="button" class="more" matRipple (click)="allPeople.set(!allPeople())" [attr.aria-expanded]="allPeople()">
          {{ allPeople() ? 'Mostrar menos' : 'Mostrar todas (' + inPeriod().length + ')' }}
        </button>
      }

      @if (chosen(); as me) {
        <div #who class="who" [style.--c]="color(me)">
          <div class="who-text">
            <h3>{{ me.name }}</h3>
            <p class="who-line">
              @if (me.role) { <span>{{ me.role }}</span> · }
              <span>{{ me.text }}</span>
              @if (me.precision === 'ponto') { <span> · só um ano aproximado</span> }
              @else if (me.precision === 'seculo') { <span> · século I, sem anos exatos</span> }
            </p>
            @if (me.title) { <p class="who-title">{{ me.title }}</p> }
            @if (me.basis) { <p class="who-basis">{{ me.basis }}</p> }
          </div>
          @if (me.id !== 'jesus') { <a class="who-link" matRipple [routerLink]="['/memorial', me.id]">Ver no Memorial</a> }
        </div>

        @if (together().length) {
          <h3 class="sub">O que a Bíblia diz</h3>
          <ul class="bible">
            @for (t of shownTogether(); track t.ref + t.people.join()) {
              <li>
                <span class="tag" [class]="t.how">{{ label(t.how) }}</span>
                <button type="button" class="ref" matRipple (click)="open(t.ref)">{{ t.ref }}</button>
                <span class="with">
                  @for (o of t.others; track o) {
                    @if (lifeOf(o); as ol) { <button type="button" class="person" matRipple (click)="pick(o)">{{ ol.name }}</button> }
                  }
                </span>
                <span class="note">{{ t.text }}</span>
              </li>
            }
          </ul>
          @if (together().length > previewTogether) {
            <button type="button" class="more" matRipple (click)="allTogether.set(!allTogether())" [attr.aria-expanded]="allTogether()">
              {{ allTogether() ? 'Mostrar menos' : 'Mostrar todos (' + together().length + ')' }}
            </button>
          }
        }

        <h3 class="sub">
          Viveram na mesma época
          <span class="count">{{ result().exact.length }}</span>
        </h3>
        @if (result().exact.length) {
          <div class="chart" [style.--rows]="rows().length" role="group" [attr.aria-label]="'Faixas de vida de ' + me.name + ' e de quem viveu na mesma época'">
            <div class="axis" aria-hidden="true">
              @for (t of ticks(); track t.year) { <span class="tick" [style.left.%]="t.left"><span>{{ t.label }}</span></span> }
            </div>
            <div class="win-cell" aria-hidden="true"><span class="win" [style.left.%]="windowBand().left" [style.width.%]="windowBand().width"></span></div>
            @for (r of rows(); track r.life.id; let i = $index) {
              <button type="button" class="name" [class.me]="r.life.id === me.id" [style.grid-row]="i + 2" [attr.aria-current]="r.life.id === me.id ? 'true' : null" (click)="pick(r.life.id)">
                <strong>{{ r.life.name }}</strong>
                <small>@if (r.life.role) { {{ r.life.role }} · }{{ r.life.text }}</small>
              </button>
              <span class="track" [style.grid-row]="i + 2" aria-hidden="true">
                <span class="bar" [class.me]="r.life.id === me.id" [class.dot]="r.life.precision === 'ponto'" [class.century]="r.life.precision === 'seculo'"
                      [style.left.%]="r.left" [style.width.%]="r.width" [style.--c]="color(r.life)"></span>
              </span>
            }
          </div>
          <p class="legend">
            <span><i class="sw solid"></i> anos conhecidos</span>
            <span><i class="sw point"></i> só um ano aproximado</span>
            <span><i class="sw hatch"></i> só se sabe o século</span>
            <span>A faixa clara é o tempo de {{ me.name }}. Toque num nome para ver quem viveu com essa pessoa.</span>
          </p>
        } @else {
          <p class="empty">O Memorial não tem pessoas com anos que se cruzem com os de {{ me.name }}.</p>
        }

        @if (result().century.length) {
          <h3 class="sub">Também no século I <span class="count">{{ result().century.length }}</span></h3>
          <p class="hint small">O Memorial só diz que viveram no século I; sem os anos, não dá para saber se coincidiram com {{ me.name }}.</p>
          <div class="people">
            @for (l of result().century; track l.id) { <button type="button" class="person" matRipple (click)="pick(l.id)">{{ l.name }}</button> }
          </div>
        }
      } @else {
        <p class="empty">Carregando as pessoas do Memorial…</p>
      }

      <p class="fine">
        Os anos são os do Memorial da Fé; a data dos reis segue Thiele. Para um rei, vale a vida e o reinado juntos. Os anos dos patriarcas foram calculados com as idades que o próprio
        Gênesis dá. Quem o Memorial não data (Adão, Eva, Abel, Enoque, Noé, Jó e Joel) não aparece aqui.
      </p>
    </section>
  `,
  styles: `
    :host { display: block; scroll-margin-top: 72px; }
    .cont { margin-top: 22px; padding: 16px 16px 14px; border-radius: 20px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); }
    h2 { margin: 0 0 2px; font: 600 20px/1.25 var(--heading-font); }
    .hint { margin: 0 0 12px; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hint.small { margin: 0 0 8px; font-size: 13px; }
    .select { display: flex; flex-direction: column; gap: 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); max-width: 560px; }
    .when { font: 400 13px Inter, sans-serif; margin-left: 4px; }
    select { width: 100%; min-height: 48px; padding: 0 10px; border-radius: 12px; border: 1px solid var(--mat-sys-outline); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 400 15px Inter, sans-serif; }
    .person, .more {
      position: relative; overflow: hidden; display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }

    /* As pessoas do período: blocos que se ajustam à tela (duas colunas no celular, mais no tablet e no computador). */
    .folk { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 128px), 1fr)); gap: 8px; margin-bottom: 4px; }
    @media (min-width: 600px) { .folk { grid-template-columns: repeat(auto-fill, minmax(156px, 1fr)); } }
    .pp {
      position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 2px; min-height: 56px; padding: 8px 12px 9px; text-align: left; cursor: pointer;
      border-radius: 14px; border: 1px solid var(--mat-sys-outline-variant); border-top: 4px solid var(--c); background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: inherit;
    }
    .pp strong { font: 600 14px/1.25 var(--heading-font); overflow-wrap: anywhere; }
    .pp small { font: 400 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .pp.on { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); border-color: var(--mat-sys-primary); border-top-color: var(--c); }
    .pp.on small { color: var(--mat-sys-on-primary-container); }

    .who { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border-radius: 16px; background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); border-left: 5px solid var(--c); scroll-margin-top: 70px; }
    .who-text { flex: 1; min-width: 0; }
    .who h3 { margin: 0; font: 600 20px/1.25 var(--heading-font); }
    .who-line { margin: 2px 0 0; font: 500 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .who-title { margin: 2px 0 0; font: italic 400 14px/1.45 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .who-basis { margin: 6px 0 0; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .who-link { position: relative; overflow: hidden; flex: none; display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 20px; text-decoration: none; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); border: 1px solid var(--mat-sys-outline-variant); }

    .sub { display: flex; align-items: center; gap: 8px; margin: 18px 0 8px; font: 600 16px var(--heading-font); }
    .count { display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 6px; border-radius: 12px; background: var(--mat-sys-surface-container-high); font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface); }

    .bible { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 8px; }
    .bible li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 2px 8px; padding: 8px 12px 12px; border-radius: 14px; background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); }
    .tag { grid-column: 1; font: 600 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .tag.encontro { color: var(--mat-sys-primary); }
    .with { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; }
    .bible .person { min-height: 40px; padding: 0 12px; font-weight: 600; }
    .note { grid-column: 1 / -1; margin-top: 4px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .ref {
      position: relative; overflow: hidden; grid-column: 2; grid-row: 1; min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container); color: var(--accent-gold); font: 600 13px Inter, sans-serif;
    }
    .more { margin-top: 8px; }

    /* As faixas: um nome por linha à esquerda e a faixa de anos à direita, todas na mesma régua. */
    .chart { position: relative; display: grid; grid-template-columns: minmax(112px, 30%) minmax(0, 1fr); grid-template-rows: 28px repeat(var(--rows), minmax(44px, auto)); column-gap: 8px; }
    .axis { grid-column: 2; grid-row: 1; position: relative; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .tick { position: absolute; bottom: 0; width: 0; height: 6px; border-left: 1px solid var(--mat-sys-outline); }
    .tick span { position: absolute; bottom: 8px; left: 0; transform: translateX(-50%); white-space: nowrap; font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .win-cell { grid-column: 2; grid-row: 2 / -1; position: relative; pointer-events: none; }
    .win { position: absolute; top: 0; bottom: 0; background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent); border-inline: 1px dashed color-mix(in srgb, var(--mat-sys-primary) 55%, transparent); }
    .name {
      grid-column: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; min-height: 44px; padding: 4px 4px 4px 0; text-align: left;
      border: 0; border-top: 1px solid var(--mat-sys-outline-variant); background: none; color: inherit; cursor: pointer;
    }
    .name strong { font: 600 14px/1.25 var(--heading-font); color: var(--mat-sys-on-surface); }
    .name small { font: 400 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .name.me strong { color: var(--mat-sys-primary); }
    .track { grid-column: 2; position: relative; border-top: 1px solid var(--mat-sys-outline-variant); }
    .bar {
      position: absolute; top: 50%; height: 14px; margin-top: -7px; min-width: 6px; border-radius: 7px;
      background: linear-gradient(to bottom, rgb(255 255 255 / .28), rgb(0 0 0 / .1)), var(--c);
    }
    .bar.me { height: 18px; margin-top: -9px; box-shadow: 0 0 0 2px var(--mat-sys-surface-container-low), 0 0 0 4px var(--c); }
    .bar.dot { min-width: 14px; width: 14px !important; height: 14px; border-radius: 50%; margin-left: -7px; }
    .bar.century { background: repeating-linear-gradient(135deg, var(--c) 0 5px, color-mix(in srgb, var(--c) 30%, transparent) 5px 10px); }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 10px 0 0; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .sw { display: inline-block; width: 22px; height: 10px; border-radius: 5px; background: var(--mat-sys-on-surface-variant); }
    .sw.point { width: 10px; border-radius: 50%; }
    .sw.hatch { background: repeating-linear-gradient(135deg, var(--mat-sys-on-surface-variant) 0 4px, transparent 4px 8px); }
    .people { display: flex; flex-wrap: wrap; gap: 6px; }
    .empty { margin: 8px 0; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .fine { margin: 16px 0 0; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class Contemporaries {
  private readonly content = inject(ContentService);
  private readonly sheets = inject(Sheets);

  /** A fase da linha do tempo que se está lendo: dela vem a pessoa que abre o bloco. */
  readonly phase = input('comeco');

  protected readonly preview = 18;
  protected readonly previewTogether = 6;
  protected readonly allTogether = signal(false);
  protected readonly allPeople = signal(false);

  private readonly people = toSignal(this.content.memorial, { initialValue: [] });
  private readonly lives = computed(() => buildLives(this.people()));
  private readonly picked = signal<string | null>(null);
  private readonly periodPicked = signal<string | null>(null);
  protected readonly chosenId = computed(() => this.picked() ?? PHASE_PERSON[this.phase()] ?? 'abraao');
  protected readonly chosen = computed(() => this.lives().find((l) => l.id === this.chosenId()));
  /** O período escolhido: o que a pessoa abriu, ou o da fase em que ela lê (e, se a pessoa escolhida não é dele, o primeiro período dela). */
  protected readonly period = computed(() => {
    const own = this.periodPicked();
    if (own) return own;
    const phases = this.chosen()?.phases ?? [];
    return phases.includes(this.phase()) ? this.phase() : (phases[0] ?? 'patriarcas');
  });
  protected readonly periods = computed(() => {
    const ids = phasesWithPeople(this.lives());
    return CHRONO_GROUPS.filter((g) => ids.includes(g.id));
  });
  /** Os anos do período escolhido, ao lado do rótulo da caixa. */
  protected readonly periodYears = computed(() => this.periods().find((g) => g.id === this.period())?.period ?? '');
  protected readonly inPeriod = computed(() => peopleOfPhase(this.lives(), this.period()));
  /** Se a pessoa escolhida está depois das primeiras da lista, a lista abre inteira para ela aparecer. */
  protected readonly forcedOpen = computed(() => this.inPeriod().findIndex((l) => l.id === this.chosenId()) >= this.preview);
  protected readonly shownPeople = computed(() => (this.allPeople() || this.forcedOpen() ? this.inPeriod() : this.inPeriod().slice(0, this.preview)));
  protected readonly result = computed(() => contemporariesOf(this.lives(), this.chosenId()));
  protected readonly together = computed(() => togetherOf(this.chosenId()).sort((a, b) => order(a.how) - order(b.how)));
  protected readonly shownTogether = computed(() => (this.allTogether() ? this.together() : this.together().slice(0, this.previewTogether)));
  private readonly who = viewChild<ElementRef<HTMLElement>>('who');

  /** A pessoa primeiro, depois quem viveu na mesma época, todas na mesma régua (uma folga nas pontas). */
  private readonly drawn = computed(() => {
    const me = this.chosen();
    return me ? [me, ...this.result().exact] : [];
  });
  private readonly frame = computed(() => {
    const lives = this.drawn();
    if (!lives.length) return { from: 0, span: 1 };
    const lo = Math.min(...lives.map((l) => l.from));
    const hi = Math.max(...lives.map((l) => l.to));
    const pad = Math.max(5, (hi - lo) * 0.04);
    return { from: lo - pad, span: hi - lo + 2 * pad };
  });
  protected readonly rows = computed(() => {
    const { from, span } = this.frame();
    return this.drawn().map((life) => ({
      life,
      left: ((life.from - from) / span) * 100,
      width: Math.max(((life.to - life.from) / span) * 100, 0.8),
    }));
  });
  /** A faixa clara atrás de todas: o tempo da pessoa escolhida. */
  protected readonly windowBand = computed(() => this.rows()[0] ?? { left: 0, width: 0 });
  /** Os anos da régua: no máximo cinco, de um passo redondo. */
  protected readonly ticks = computed(() => {
    const { from, span } = this.frame();
    const to = from + span;
    const step = STEPS.find((s) => Math.floor(to / s) - Math.ceil(from / s) + 1 <= 5) ?? 500;
    const out: { year: number; left: number; label: string }[] = [];
    for (let y = Math.ceil(from / step) * step; y <= to; y += step) if (y !== 0) out.push({ year: y, left: ((y - from) / span) * 100, label: yearLabel(y) });
    return out;
  });

  protected lifeOf = (id: string): Life | undefined => this.lives().find((l) => l.id === id);
  protected color = (life: Life): string => PHASE_COLORS[phaseOfLife(life)];
  protected label = (how: Relation): string => RELATION_LABEL[how];

  protected pick(id: string): void {
    const life = this.lifeOf(id);
    if (!life) return;
    // quem vem do desenho de outro período leva o seletor junto
    if (!life.phases.includes(this.period())) this.periodPicked.set(life.phases[0]);
    this.picked.set(id);
    this.allTogether.set(false);
    // a pessoa nova aparece no alto do bloco: se ele ficou fora da tela, leva a vista até lá
    setTimeout(() => {
      const el = this.who()?.nativeElement;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < 56 || top > window.innerHeight * 0.8) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }
  /** Trocar de período já abre uma pessoa dele (a de sempre, ou a primeira), para o bloco nunca ficar vazio. */
  protected pickPeriod(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    const list = peopleOfPhase(this.lives(), id);
    const rep = list.find((l) => l.id === PHASE_PERSON[id]) ?? list[0];
    this.periodPicked.set(id);
    this.allPeople.set(false);
    this.allTogether.set(false);
    if (rep) this.picked.set(rep.id);
  }
  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}

/** Primeiro quem se encontrou, depois quem o livro situa na mesma época, por fim quem é citado. */
function order(how: Relation): number {
  return how === 'encontro' ? 0 : how === 'reinado' ? 1 : 2;
}
