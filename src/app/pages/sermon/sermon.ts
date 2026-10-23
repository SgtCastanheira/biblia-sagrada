import { BackButton } from '../../shared/back-button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, DestroyRef, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { NotesService } from '../../core/notes.service';
import { SERMON_KINDS, Sermon, SermonPoint, SermonsService } from '../../core/sermons.service';
import { noteTypeColor } from '../../shared/note-types';
import { PassageView } from '../../shared/passage-view';

@Component({
  selector: 'app-sermon',
  imports: [BackButton, RouterLink, CdkTextareaAutosize, MatButtonModule, MatIconModule, MatMenuModule, PassageView],
  templateUrl: './sermon.html',
  styleUrl: './sermon.scss',
})
export class SermonPage {
  readonly id = input.required<string>();

  protected readonly service = inject(SermonsService);
  protected readonly notes = inject(NotesService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly color = noteTypeColor;

  protected readonly sermon = computed(() => this.service.get(this.id()));
  protected readonly kind = computed(() => SERMON_KINDS.find((k) => k.id === this.sermon()?.kind));
  protected readonly minutes = computed(() => (this.sermon() ? this.service.minutes(this.sermon()!) : 0));

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.sermon()?.title || 'Sermão'} · Bíblia Sagrada`));
    inject(DestroyRef).onDestroy(() => this.service.discardIfEmpty(this.id()));
  }

  protected update(patch: Partial<Sermon>): void {
    this.service.update(this.id(), patch);
  }

  protected updatePoint(point: SermonPoint, patch: Partial<SermonPoint>): void {
    this.service.updatePoint(this.id(), point.id, patch);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected hint(index: number): string {
    return this.kind()?.hints[index] || 'Título do tópico';
  }

  protected removePoint(point: SermonPoint): void {
    const filled = point.title || point.content || point.refs;
    if (!filled || confirm('Remover este tópico?')) this.service.removePoint(this.id(), point.id);
  }

  protected duplicate(): void {
    const copy = this.service.duplicate(this.id());
    if (copy) this.router.navigate(['/sermoes', copy.id]);
  }

  protected remove(): void {
    if (confirm('Excluir este sermão?')) {
      this.service.remove(this.id());
      this.router.navigate(['/sermoes'], { replaceUrl: true });
    }
  }

  protected async share(): Promise<void> {
    const s = this.sermon();
    if (!s) return;
    const text = this.service.toText(s);
    if (navigator.share) {
      try {
        await navigator.share({ title: s.title || 'Sermão', text });
      } catch {
        // cancelado
      }
    } else {
      await navigator.clipboard.writeText(text);
      this.snackBar.open('Esboço copiado', undefined, { duration: 2000 });
    }
  }
}
