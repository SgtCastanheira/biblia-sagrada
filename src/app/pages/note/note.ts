import { BackButton } from '../../shared/back-button';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { formatLong } from '../../core/dates';
import { NotesService, ServiceNote } from '../../core/notes.service';
import { noteTypeColor } from '../../shared/note-types';
import { PassageView } from '../../shared/passage-view';
import { RefInput } from '../../shared/ref-input';

@Component({
  selector: 'app-note',
  imports: [BackButton, RouterLink, CdkTextareaAutosize, MatButtonModule, MatIconModule, MatMenuModule, PassageView, RefInput],
  templateUrl: './note.html',
  styleUrl: './note.scss',
})
export class NotePage {
  readonly id = input.required<string>();

  protected readonly service = inject(NotesService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly color = noteTypeColor;

  protected readonly note = computed(() => this.service.get(this.id()));
  protected readonly addingType = signal(false);

  constructor() {
    const title = inject(Title);
    effect(() => title.setTitle(`${this.note()?.title || 'Anotação'} · Bíblia Sagrada`));
    // Anotação criada e deixada em branco não fica na lista
    inject(DestroyRef).onDestroy(() => this.service.discardIfEmpty(this.id()));
  }

  protected update(patch: Partial<ServiceNote>): void {
    this.service.update(this.id(), patch);
  }

  protected hasChapter(refs: string): boolean {
    return /\d/.test(refs.replace(/^\s*[1-3]\s*(?=\p{L})/u, ''));
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected addType(event: Event): void {
    const input = event.target as HTMLInputElement;
    const type = this.service.addType(input.value);
    if (type) this.update({ type });
    this.addingType.set(false);
  }

  protected removeType(type: string): void {
    if (confirm(`Remover a indicação “${type}”? As anotações dela passam para “Outro”.`)) {
      this.service.removeType(type);
    }
  }

  protected remove(): void {
    if (confirm('Excluir esta anotação?')) {
      this.service.remove(this.id());
      this.router.navigate(['/anotacoes'], { replaceUrl: true });
    }
  }

  protected async share(): Promise<void> {
    const n = this.note();
    if (!n) return;
    const text = [
      `📝 ${n.type} · ${formatLong(n.date)}`,
      n.title && `Tema: ${n.title}`,
      n.preacher && `Pregador(a): ${n.preacher}`,
      n.refs && `Textos: ${n.refs}`,
      n.body,
      n.application && `O que vou praticar: ${n.application}`,
    ]
      .filter(Boolean)
      .join('\n\n');
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // cancelado
      }
    } else {
      await navigator.clipboard.writeText(text);
      this.snackBar.open('Anotação copiada', undefined, { duration: 2000 });
    }
  }
}
