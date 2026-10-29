import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { bibleOfEpoch, EPOCH_PARTS, EPOCHS, eventsOfEpoch, storiesOfEpoch, WORLD_TIMELINE } from '../../core/epochs';
import { SourcesBox } from '../../shared/sources-box';

/** O índice da linha do tempo da história: as épocas da Criação aos nossos dias, em grupos, ligadas por uma régua. */
@Component({
  selector: 'app-epochs',
  imports: [RouterLink, MatIconModule, MatRippleModule, SourcesBox],
  template: `
    <header class="page-head">
      <span class="overline">Biblioteca</span>
      <h1>Linha do tempo</h1>
      <p>Da Criação aos nossos dias, época por época. Em cada uma, o que a Bíblia conta, as histórias do app, os personagens, as curiosidades e as crises do mundo, tudo no seu lugar.</p>
    </header>

    <aside class="church-intro">
      <mat-icon aria-hidden="true">church</mat-icon>
      <p><strong>A igreja não ficou de fora.</strong> A fome, a peste, a guerra, o cangaço e a crise de 1929 também chegaram aos crentes. Em {{ churchCount }} fatos da linha do tempo, a caixa “A igreja nesse tempo” mostra o que a igreja viveu, com a fonte.</p>
    </aside>

    @for (part of parts; track part.name) {
      <h2 class="section-title">{{ part.name }}</h2>
      <ol class="rail">
        @for (e of part.epochs; track e.id) {
          <li>
            <span class="dot" aria-hidden="true"><mat-icon>{{ e.icon }}</mat-icon></span>
            <a class="era" matRipple [routerLink]="['/epocas', e.id]">
              <span class="body">
                <span class="when">{{ e.period }}</span>
                <span class="name">{{ e.name }}</span>
                <span class="sum">{{ e.summary }}</span>
                <span class="counts">{{ counts(e.id) }}</span>
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          </li>
        }
      </ol>
    }

    <app-sources topic="epocas" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .church-intro { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; align-items: start; margin: 0 0 8px; padding: 14px 16px; border-radius: 16px; background: var(--mat-sys-surface-container); border-left: 4px solid var(--accent-gold); max-width: 760px; }
    .church-intro mat-icon { color: var(--accent-gold); }
    .church-intro p { margin: 0; font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface); }
    .rail { list-style: none; margin: 0 0 8px 22px; padding: 0 0 0 26px; border-left: 2px solid var(--mat-sys-outline-variant); display: grid; gap: 12px; }
    .rail li { position: relative; }
    .era {
      display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 14px 16px; border-radius: 18px; text-decoration: none; color: inherit;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
    }
    .dot {
      position: absolute; left: -49px; top: 14px; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
      background: var(--mat-sys-surface); border: 2px solid var(--accent-gold); color: var(--mat-sys-primary);
    }
    .body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .when { font: 700 13px Inter, sans-serif; letter-spacing: .6px; color: var(--accent-gold); }
    .name { font: 600 19px/1.25 var(--heading-font); }
    .sum { font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .counts { margin-top: 4px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .go { color: var(--mat-sys-on-surface-variant); }
    @media (min-width: 840px) { .rail { max-width: 760px; } }
  `,
})
export class EpochsPage {
  protected readonly churchCount = WORLD_TIMELINE.filter((e) => e.church).length;
  protected readonly parts = EPOCH_PARTS.map((name) => ({ name, epochs: EPOCHS.filter((e) => e.part === name) }));

  /** "5 histórias · 12 fatos do mundo · Gênesis 12–50 e mais 1 livro" numa linha só. */
  protected counts(id: string): string {
    const stories = storiesOfEpoch(id).length;
    const events = eventsOfEpoch(id).length;
    const books = new Set(bibleOfEpoch(id).map((b) => b.bookId)).size;
    return [
      stories ? `${stories} ${stories === 1 ? 'história' : 'histórias'}` : '',
      events ? `${events} ${events === 1 ? 'fato do mundo' : 'fatos do mundo'}` : '',
      books ? `${books} ${books === 1 ? 'livro da Bíblia' : 'livros da Bíblia'}` : '',
    ].filter(Boolean).join(' · ');
  }
}
