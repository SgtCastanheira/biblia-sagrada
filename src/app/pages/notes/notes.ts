import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { formatLong } from '../../core/dates';
import { NotesService } from '../../core/notes.service';
import { noteTypeColor } from '../../shared/note-types';
import { NotebookTabs } from '../../shared/notebook-tabs';

const plain = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-notes',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule, NotebookTabs],
  templateUrl: './notes.html',
  styleUrl: './notes.scss',
})
export class NotesPage {
  protected readonly service = inject(NotesService);
  private readonly router = inject(Router);
  protected readonly formatLong = formatLong;
  protected readonly color = noteTypeColor;

  protected readonly type = signal<string | null>(null);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const type = this.type();
    const q = plain(this.query().trim());
    return this.service.sorted().filter(
      (n) =>
        (!type || n.type === type) &&
        (!q || plain(`${n.title} ${n.preacher} ${n.refs} ${n.body} ${n.application}`).includes(q)),
    );
  });

  protected create(type?: string): void {
    const note = this.service.create(type ?? this.type() ?? undefined);
    this.router.navigate(['/anotacoes', note.id]);
  }
}
