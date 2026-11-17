import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import {
  CHRONO_CHAPTERS,
  CHRONO_GROUPS,
  CHRONO_SECTIONS,
  type ChronoSection,
  sectionRefs,
  sectionSize,
} from '../../core/bible-chronological';
import { findBook } from '../../core/books';
import { SettingsService } from '../../core/settings.service';
import { BackButton } from '../../shared/back-button';
import { SourcesBox } from '../../shared/sources-box';

/** A Bíblia em ordem cronológica: a lista das seções da leitura, em grupos, com o progresso de quem lê. */
@Component({
  selector: 'app-chronological',
  imports: [BackButton, RouterLink, MatIconModule, MatRippleModule, SourcesBox],
  template: `
    <header class="hero">
      <app-back class="back" fallback="/livros" />
      <span class="kicker">Almeida · 1.189 capítulos</span>
      <h1>A Bíblia em Ordem Cronológica</h1>
      <p class="lead">
        Os mesmos capítulos da Bíblia, lidos na ordem em que as coisas aconteceram. Jó fica junto dos patriarcas, os salmos de Davi entram na vida de Davi,
        os profetas aparecem no reinado em que viveram e as cartas de Paulo, ao lado das viagens em que foram escritas.
      </p>
      <div class="progress" role="img" [attr.aria-label]="readTotal() + ' de ' + total + ' capítulos lidos'">
        <span [style.width.%]="(readTotal() / total) * 100"></span>
      </div>
      <p class="count">{{ readTotal() }} de {{ total }} capítulos lidos</p>
      <a class="start" matRipple [routerLink]="['/ler', resume().bookId, resume().chapter]" [queryParams]="order">
        <mat-icon>play_arrow</mat-icon>
        {{ readTotal() ? 'Continuar' : 'Começar' }} em {{ resumeLabel() }}
      </a>
    </header>

    <details class="how">
      <summary><mat-icon>info</mat-icon> Como esta ordem foi feita</summary>
      <ul>
        <li><strong>É a ordem dos fatos, e não a da escrita.</strong> Samuel, Reis e Crônicas contam a mesma história, e aqui os capítulos paralelos ficam juntos.</li>
        <li><strong>Cada capítulo aparece uma vez só.</strong> Quando um capítulo junta tempos diferentes (os Evangelhos, Jeremias, Isaías), ele fica onde está a parte principal dele.</li>
        <li><strong>Onde os estudiosos discordam, a seção avisa.</strong> A posição de Jó, de Joel, de Tiago, de Gálatas e de Hebreus, por exemplo, é uma escolha, e não um fato.</li>
        <li><strong>Os salmos entram onde o título os liga a um fato</strong> (Salmo 51: “quando o profeta Natã veio a ele”). Os outros ficam juntos, na seção “Os Salmos”.</li>
        <li>Quem lê por aqui vê a barra “Ordem cronológica” no alto do capítulo, e o <em>anterior</em>, o <em>próximo</em> e o deslizar da página seguem esta ordem.</li>
      </ul>
    </details>

    @for (group of groups; track group.id) {
      @if (group.before; as gap) {
        <a class="gap" matRipple [routerLink]="gap.link">
          <mat-icon>hourglass_empty</mat-icon>
          <span><strong>{{ gap.title }}</strong>{{ gap.text }}</span>
          <mat-icon class="go">arrow_forward</mat-icon>
        </a>
      }
      <details class="group" [attr.open]="group.id === currentGroup() ? '' : null">
        <summary>
          <mat-icon class="g-icon">{{ group.icon }}</mat-icon>
          <span class="g-name">{{ group.name }}<small>{{ group.period }}</small></span>
          <span class="g-count">{{ groupRead(group.id) }}/{{ groupSize(group.id) }}</span>
          <mat-icon class="chev">expand_more</mat-icon>
        </summary>
        <ol>
          @for (s of sectionsOf(group.id); track s.n) {
            <li>
              <a matRipple [routerLink]="['/ler', start(s).bookId, start(s).chapter]" [queryParams]="order" [class.done]="isDone(s)">
                <span class="n">{{ s.n }}</span>
                <span class="body">
                  <span class="title">{{ s.title }}</span>
                  <span class="refs">{{ refs(s) }} · {{ size(s) }} cap.</span>
                  <span class="summary">{{ s.summary }}</span>
                </span>
                @if (isDone(s)) { <mat-icon class="ok" aria-label="Lida">check_circle</mat-icon> }
                @else if (readOf(s)) { <span class="part">{{ readOf(s) }}/{{ size(s) }}</span> }
              </a>
              @if (s.note) { <p class="note"><mat-icon>info</mat-icon> {{ s.note }}</p> }
            </li>
          }
        </ol>
      </details>
    }

    <p class="fine">
      Esta ordem é uma proposta de leitura feita para o app, a partir das datas que os próprios livros dão e do que os estudiosos costumam aceitar. Não é a ordem de nenhuma
      edição impressa.
    </p>
    <app-sources topic="cronologica" />
  `,
  styles: `
    :host { display: block; }
    .hero {
      position: relative; padding: 52px 22px 22px; border-radius: 24px; margin-top: 4px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); box-shadow: var(--shadow-soft);
    }
    .back { position: absolute; top: 6px; left: 6px; color: var(--mat-sys-on-surface-variant); }
    .kicker { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); }
    h1 { font: 600 34px/1.12 var(--heading-font); letter-spacing: -.4px; margin: 6px 0 10px; }
    .lead { margin: 0 0 16px; font: 400 16px/1.65 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .progress { height: 4px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); overflow: hidden; }
    .progress span { display: block; height: 100%; background: var(--mat-sys-primary); }
    .count { margin: 8px 0 16px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .start {
      display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 8px 20px 8px 14px; position: relative; overflow: hidden;
      border-radius: 22px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 600 14px Inter, sans-serif; text-decoration: none;
    }
    .how { margin: 16px 0 8px; border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .how summary { display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; cursor: pointer; font: 600 14px Inter, sans-serif; list-style: none; }
    .how summary::-webkit-details-marker, .group summary::-webkit-details-marker { display: none; }
    .how summary mat-icon { color: var(--accent-gold); }
    .how ul { margin: 0; padding: 0 20px 14px 36px; font: 400 15px/1.6 var(--reading-font); }
    .how li { margin-top: 6px; }
    .gap {
      display: flex; align-items: center; gap: 12px; margin: 18px 0 4px; padding: 14px 16px; border-radius: 16px; text-decoration: none; position: relative; overflow: hidden;
      border: 1px dashed var(--mat-sys-outline); color: var(--mat-sys-on-surface); font: 400 14px/1.5 Inter, sans-serif;
    }
    .gap strong { display: block; font: 600 15px var(--heading-font); }
    .gap > span { flex: 1; min-width: 0; color: var(--mat-sys-on-surface-variant); }
    .gap strong { color: var(--mat-sys-on-surface); }
    .gap mat-icon { color: var(--accent-gold); flex: none; }
    .group { margin-top: 12px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); overflow: hidden; }
    .group summary { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 14px; cursor: pointer; list-style: none; }
    .g-icon { color: var(--accent-gold); flex: none; }
    .g-name { flex: 1; min-width: 0; font: 600 17px/1.25 var(--heading-font); }
    .g-name small { display: block; margin-top: 2px; font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .g-count { flex: none; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chev { flex: none; transition: transform .2s; color: var(--mat-sys-on-surface-variant); }
    .group[open] .chev { transform: rotate(180deg); }
    ol { list-style: none; margin: 0; padding: 0 8px 10px; }
    li + li { border-top: 1px solid var(--mat-sys-outline-variant); }
    li a {
      position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 12px; min-height: 56px; padding: 12px 8px; border-radius: 12px;
      text-decoration: none; color: var(--mat-sys-on-surface);
    }
    .n {
      flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; margin-top: 2px;
      border: 1px solid var(--mat-sys-outline-variant); font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant);
    }
    .done .n { background: var(--mat-sys-primary-container); border-color: transparent; color: var(--mat-sys-on-primary-container); }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .title { font: 600 16px/1.3 var(--heading-font); }
    .refs { font: 500 13px Inter, sans-serif; color: var(--accent-gold); }
    .summary { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .ok { color: var(--mat-sys-primary); flex: none; }
    .part { flex: none; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .note { display: flex; gap: 6px; margin: 0 8px 10px 52px; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .note mat-icon { flex: none; width: 16px; height: 16px; font-size: 16px; color: var(--accent-gold); margin-top: 1px; }
    .fine { margin: 20px 4px 4px; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class ChronologicalPage {
  private readonly settings = inject(SettingsService);

  protected readonly total = CHRONO_CHAPTERS.length;
  protected readonly groups = CHRONO_GROUPS;
  /** Parâmetro que liga a leitura em ordem cronológica no leitor. */
  protected readonly order = { ordem: 'cronologica' };

  /** Os capítulos já lidos, por seção (uma única passada pelos 1.189). */
  private readonly readBySection = computed(() => {
    const read = this.settings.readChapters();
    const sets = new Map<string, Set<number>>();
    const counts = new Map<number, number>();
    for (const c of CHRONO_CHAPTERS) {
      let set = sets.get(c.bookId);
      if (!set) sets.set(c.bookId, (set = new Set(read[c.bookId] ?? [])));
      if (set.has(c.chapter)) counts.set(c.section, (counts.get(c.section) ?? 0) + 1);
    }
    return counts;
  });

  protected readonly readTotal = computed(() => [...this.readBySection().values()].reduce((a, b) => a + b, 0));

  /** O primeiro capítulo que ainda não foi lido, na ordem cronológica. */
  protected readonly resume = computed(() => {
    const read = this.settings.readChapters();
    return CHRONO_CHAPTERS.find((c) => !read[c.bookId]?.includes(c.chapter)) ?? CHRONO_CHAPTERS[0];
  });
  protected readonly resumeLabel = computed(() => {
    const c = this.resume();
    return `${this.bookName(c.bookId)} ${c.chapter}`;
  });
  /** O grupo que a pessoa está lendo fica aberto. */
  protected readonly currentGroup = computed(() => CHRONO_SECTIONS[this.resume().section - 1].group);

  protected sectionsOf(group: string): ChronoSection[] {
    return CHRONO_SECTIONS.filter((s) => s.group === group);
  }
  protected groupSize(group: string): number {
    return this.sectionsOf(group).reduce((sum, s) => sum + sectionSize(s), 0);
  }
  protected groupRead(group: string): number {
    return this.sectionsOf(group).reduce((sum, s) => sum + this.readOf(s), 0);
  }
  protected readOf(s: ChronoSection): number {
    return this.readBySection().get(s.n) ?? 0;
  }
  protected isDone(s: ChronoSection): boolean {
    return this.readOf(s) >= sectionSize(s);
  }
  protected readonly refs = sectionRefs;
  protected readonly size = sectionSize;
  protected start(s: ChronoSection) {
    return { bookId: s.parts[0].bookId, chapter: s.parts[0].from };
  }

  private bookName(id: string): string {
    return findBook(id)?.name ?? id;
  }
}
