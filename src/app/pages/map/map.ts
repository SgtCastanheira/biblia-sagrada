import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findBook } from '../../core/books';
import { distanceKm, eraOfMap, formatKm } from '../../core/atlas';
import { ARTICLES } from '../../core/library';
import { findMap } from '../../core/maps';
import { SettingsService } from '../../core/settings.service';
import { parseReferences } from '../../core/reference-parser';
import { BibleMapView } from '../../shared/bible-map';
import { MapStory } from '../../shared/map-story';

@Component({
  selector: 'app-map',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, BibleMapView, MapStory],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapPage {
  readonly id = input.required<string>();
  protected readonly map = computed(() => findMap(this.id()));
  protected readonly activeStep = signal<number | null>(null);
  protected readonly story = signal<number | null>(null);
  /** Estudo completo ligado a este mapa. */
  protected readonly article = computed(() => ARTICLES.find((a) => a.map === this.id()));
  protected readonly settings = inject(SettingsService);
  protected readonly era = computed(() => eraOfMap(this.id()) ?? null);
  protected readonly layers = this.settings.mapLayers;
  /** Mapas com territórios: a etapa escolhida destaca o território (e mostra a distância até o templo). */
  protected readonly highlight = computed(() => {
    const m = this.map();
    const i = this.activeStep();
    if (!m?.territories || i === null) return null;
    const place = m.steps[i]?.place;
    return m.territories.some((t) => t.id === place) ? place : null;
  });

  /** Distância (em linha reta) desde a etapa anterior, e o total do percurso. */
  protected readonly distances = computed(() => {
    const m = this.map();
    if (!m || m.route === false || m.distances === false) return { steps: [] as (string | null)[], total: null as string | null };
    const place = (id: string) => m.places.find((p) => p.id === id)!;
    let total = 0;
    const steps = m.steps.map((s, i) => {
      if (!i || s.place === m.steps[i - 1].place) return null;
      const km = distanceKm(place(m.steps[i - 1].place), place(s.place));
      total += km;
      return km >= 1 ? formatKm(km) : null;
    });
    return { steps, total: total >= 1 ? formatKm(total) : null };
  });

  protected toggleLayer(key: 'nearby' | 'era' | 'modern'): void {
    this.layers.update((l) => ({ ...l, [key]: !l[key] }));
  }

  protected readonly chapters = computed(() =>
    (this.map()?.chapters ?? []).map((c) => {
      const [bookId, chapter] = c.split(' ');
      return { bookId, chapter: Number(chapter), label: `${findBook(bookId)?.abbrev} ${chapter}` };
    }),
  );

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.map()?.title ?? 'Mapa'} · Bíblia Sagrada`));
  }

  /** Link do leitor para a primeira referência da etapa. */
  protected link(ref: string): { path: (string | number)[]; fragment?: string } | null {
    const first = parseReferences(ref).refs[0];
    return first ? { path: ['/ler', first.bookId, first.chapter], fragment: first.from ? `v${first.from}` : undefined } : null;
  }

  protected toggleStep(index: number): void {
    this.activeStep.set(this.activeStep() === index ? null : index);
  }
}
