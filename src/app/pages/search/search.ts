import { afterNextRender, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { findBook } from '../../core/books';
import { Testament } from '../../core/models';
import { parseReferences } from '../../core/reference-parser';
import { SearchService } from '../../core/search.service';

const PAGE = 50;

@Component({
  selector: 'app-search',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage {
  protected readonly service = inject(SearchService);
  private readonly router = inject(Router);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('q') ?? '');
  protected readonly testament = signal<Testament | null>(null);
  protected readonly limit = signal(PAGE);
  protected readonly failed = signal(false);
  protected readonly bookName = (id: string) => findBook(id)?.name ?? id;

  /** Se o texto for uma referência ("Jo 3.16"), oferece ir direto. */
  protected readonly reference = computed(() => {
    const { refs, errors } = parseReferences(this.query());
    return refs.length && !errors.length ? refs[0] : null;
  });

  protected readonly results = computed(() => {
    if (!this.service.ready() || this.query().trim().length < 2) return null;
    return this.service.search(this.query(), this.testament());
  });

  protected readonly visible = computed(() => this.results()?.hits.slice(0, this.limit()) ?? []);

  constructor() {
    this.service.load().catch(() => this.failed.set(true));
    afterNextRender(() => this.input()?.nativeElement.focus());
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.limit.set(PAGE);
    this.router.navigate([], { queryParams: { q: value || null }, replaceUrl: true });
  }

  protected setTestament(value: Testament | null): void {
    this.testament.set(value);
    this.limit.set(PAGE);
  }
}
