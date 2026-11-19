import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import {
  CHRONO_CHAPTERS,
  CHRONO_GROUPS,
  PHASE_COLORS,
  TIMELINE_ZOOM,
  timelineSegments,
  type ChronoGroup,
  type ChronoSection,
} from '../../core/bible-chronological';

type TimelineGroup = ChronoGroup & { sections: ChronoSection[]; size: number; read: number };

/** A sequência das fases e, em separado, a comparação proporcional do tempo. */
@Component({
  selector: 'app-chronological-timeline',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  templateUrl: './chronological-timeline.html',
  styleUrl: './chronological-timeline.scss',
})
export class ChronologicalTimeline {
  readonly groups = input.required<TimelineGroup[]>();
  readonly selected = input.required<string>();
  readonly reading = input.required<string>();
  readonly phasePicked = output<string>();
  readonly sectionsRequested = output<string>();

  protected readonly total = CHRONO_CHAPTERS.length;
  protected readonly zoom = Math.round(TIMELINE_ZOOM);
  protected readonly segments = timelineSegments();
  protected readonly interval = CHRONO_GROUPS.find((group) => group.before)?.before;
  protected readonly current = computed(() => this.groups().find((group) => group.id === this.selected()));
  protected readonly journey = computed(() => {
    const groups = this.groups();
    return [
      { id: 'origins', title: 'Origens e formação de Israel', testament: 'Antigo Testamento', groups: groups.slice(0, 4) },
      { id: 'kingdoms', title: 'Dos reis ao retorno do exílio', testament: 'Antigo Testamento', groups: groups.slice(4, 8) },
      { id: 'gospel', title: 'Jesus e a igreja', testament: 'Novo Testamento', groups: groups.slice(8) },
    ];
  });
  protected readonly silence = (() => {
    const from = this.segments.find((segment) => segment.id === 'retorno')!;
    const to = this.segments.find((segment) => segment.id === 'jesus')!;
    return { left: from.left + from.width, width: to.left - from.left - from.width };
  })();

  protected color(id: string): string { return PHASE_COLORS[id] ?? '#888'; }
  protected shareOfTime(id: string): string {
    const segment = this.segments.find((entry) => entry.id === id);
    return segment ? this.percent(segment.share) : '';
  }
  protected shareOfText(size: number): string { return this.percent(size / this.total * 100); }
  private percent(value: number): string {
    return value < 1 ? 'menos de 1%' : `cerca de ${Math.round(value)}%`;
  }
}
