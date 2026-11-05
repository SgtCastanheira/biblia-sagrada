import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  approvalMessage, CHANGE_KINDS, contentVersion, Decision, EditorChange, guestSermonByToken,
} from '../../core/guest-sermons';
import { saveLocal } from '../../core/storage.service';
import { VoiceArticle } from '../../shared/voice-article';

const KEY = 'biblia.revisoes';
const KIND_ORDER: EditorChange['kind'][] = ['conferir', 'retirado', 'ajustado', 'acrescentado'];

interface Saved {
  decision: Decision;
  version: string;
  name: string;
  note: string;
  at: string;
}

/**
 * Prévia para o autor aprovar um sermão antes de ele ser publicado (/revisao/:token). O endereço é exclusivo (o token não é
 * listado em lugar nenhum do app e a página pede aos buscadores para não indexar): ele lê o sermão como o público vai ler,
 * confere o que o editor mudou e decide. A decisão vira uma mensagem para mandar ao editor; o app não tem servidor, então
 * nada é enviado sozinho.
 */
@Component({
  selector: 'app-voice-review',
  imports: [MatIconModule, RouterLink, VoiceArticle],
  template: `
    @if (sermon(); as s) {
      <div class="page">
        <section class="banner" role="note">
          <mat-icon>visibility</mat-icon>
          <div>
            <strong>Prévia para aprovação</strong>
            @if (s.status === 'publicado') {
              <span>Este sermão já foi publicado. <a [routerLink]="['/vozes', s.id]">Abrir a versão pública</a></span>
            } @else {
              <span>Este sermão ainda não foi publicado. Só quem recebeu este link consegue vê-lo.</span>
            }
            @if (version()) { <span class="ver">Versão do texto: <code>{{ version() }}</code></span> }
          </div>
        </section>

        <ol class="steps" aria-label="Como funciona">
          <li><b>Leia</b> o sermão abaixo. Dá para trocar o idioma e para ouvir.</li>
          <li><b>Confira</b> o que o editor mudou no seu texto. <a href="#ajustes" (click)="jump($event, 'ajustes')">Ir para a lista</a></li>
          <li><b>Decida:</b> aprove ou diga o que quer mudar. <a href="#decisao" (click)="jump($event, 'decisao')">Ir para a decisão</a></li>
        </ol>

        @if (status(); as st) {
          <p class="status" [class.stale]="st.stale" role="status">
            <mat-icon>{{ st.stale ? 'update' : st.saved.decision === 'aprovado' ? 'check_circle' : 'edit_note' }}</mat-icon>
            <span>{{ st.text }}</span>
          </p>
        }

        <app-voice-article [sermon]="s" (originalLoaded)="original.set($event)" />

        <section id="ajustes" class="changes" aria-labelledby="ajustes-titulo">
          <h2 id="ajustes-titulo">O que o editor mudou no seu texto</h2>
          <p class="lead">Nada foi publicado. Cada mudança está aqui para você conferir; as que pedem resposta vêm primeiro.</p>
          @for (group of groups(); track group.kind) {
            <h3 class="kind"><mat-icon>{{ group.info.icon }}</mat-icon> {{ group.info.label }} <span class="n">{{ group.items.length }}</span></h3>
            <p class="hint">{{ group.info.hint }}</p>
            @for (c of group.items; track c.title) {
              <article class="change">
                <h4>{{ c.title }}</h4>
                <dl>
                  @if (c.original) { <div><dt>No seu texto</dt><dd class="orig">{{ c.original }}</dd></div> }
                  @if (c.now) { <div><dt>{{ c.kind === 'acrescentado' ? 'Entrou' : 'Ficou' }}</dt><dd>{{ c.now }}</dd></div> }
                  <div><dt>Por quê</dt><dd>{{ c.why }}</dd></div>
                </dl>
              </article>
            }
          }
        </section>

        <section id="decisao" class="decide" aria-labelledby="decisao-titulo">
          <h2 id="decisao-titulo">Sua decisão</h2>
          <p class="lead">Ela vale para a versão <code>{{ version() || '…' }}</code> do texto. Se o texto mudar, o editor pede uma nova leitura.</p>

          <label class="field">
            <span>Seu nome, como vai aparecer no jornal</span>
            <input type="text" [value]="name()" (input)="name.set(val($event))" autocomplete="name" />
          </label>

          <label class="check">
            <input type="checkbox" [checked]="agree()" (change)="agree.set(checked($event))" />
            <span>Li o sermão e autorizo a publicação no app Bíblia Sagrada, com o meu nome.</span>
          </label>

          <label class="field">
            <span>Ajustes que você quer (obrigatório para pedir ajustes)</span>
            <textarea rows="4" [value]="note()" (input)="note.set(val($event))" placeholder="Ex.: na parte II, trocar … por …"></textarea>
          </label>

          <div class="buttons">
            <button type="button" class="primary" [disabled]="!canApprove()" (click)="decide('aprovado')"><mat-icon>verified</mat-icon> Aprovar para publicação</button>
            <button type="button" class="ghost" [disabled]="!canAsk()" (click)="decide('ajustes')"><mat-icon>rate_review</mat-icon> Pedir ajustes</button>
          </div>

          @if (message(); as m) {
            <div class="sent" role="status">
              <h3><mat-icon>send</mat-icon> Falta só enviar a mensagem ao editor</h3>
              <p>O app não tem servidor: a sua decisão fica guardada neste aparelho, e a mensagem abaixo leva o recado ao editor.</p>
              <pre>{{ m }}</pre>
              <div class="buttons">
                <a class="primary" [href]="whatsapp()" target="_blank" rel="noopener noreferrer"><mat-icon>chat</mat-icon> Enviar pelo WhatsApp</a>
                @if (canShare) { <button type="button" class="ghost" (click)="share(m)"><mat-icon>share</mat-icon> Compartilhar</button> }
                <button type="button" class="ghost" (click)="copy(m)"><mat-icon>content_copy</mat-icon> {{ copied() ? 'Copiada' : 'Copiar a mensagem' }}</button>
              </div>
            </div>
          }
        </section>
      </div>
    } @else {
      <section class="invalid">
        <mat-icon>link_off</mat-icon>
        <h1>Este link não é válido</h1>
        <p>Peça um novo ao editor do app.</p>
      </section>
    }
  `,
  styleUrl: './voice-review.scss',
})
export class VoiceReviewPage {
  readonly token = input.required<string>();
  protected readonly sermon = computed(() => guestSermonByToken(this.token()));
  protected readonly original = signal('');
  protected readonly name = signal('');
  protected readonly note = signal('');
  protected readonly agree = signal(false);
  protected readonly copied = signal(false);
  protected readonly message = signal('');
  protected readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;
  private readonly saved = signal<Record<string, Saved>>(this.load());

  /** A marca da versão que o autor está lendo: muda quando qualquer letra do título, do subtítulo ou do texto muda. */
  protected readonly version = computed(() => {
    const s = this.sermon();
    return s && this.original() ? contentVersion(`${s.meta.pt.title}\n${s.meta.pt.deck}\n${this.original()}`) : '';
  });

  protected readonly groups = computed(() => {
    const changes = this.sermon()?.changes ?? [];
    return KIND_ORDER.map((kind) => ({ kind, info: CHANGE_KINDS[kind], items: changes.filter((c) => c.kind === kind) })).filter((g) => g.items.length);
  });

  protected readonly canApprove = computed(() => !!this.version() && this.agree() && !!this.name().trim());
  protected readonly canAsk = computed(() => !!this.version() && !!this.name().trim() && !!this.note().trim());

  /** O que a pessoa já decidiu neste aparelho e se vale para a versão que está na tela. */
  protected readonly status = computed(() => {
    const s = this.sermon();
    const saved = s ? this.saved()[s.id] : undefined;
    if (!saved || !this.version()) return null;
    const when = new Date(saved.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    if (saved.version !== this.version()) {
      return { saved, stale: true, text: `O texto mudou desde a sua última decisão (versão ${saved.version}, em ${when}). Leia de novo e decida.` };
    }
    return {
      saved,
      stale: false,
      text: saved.decision === 'aprovado' ? `Você aprovou esta versão em ${when}.` : `Você pediu ajustes nesta versão em ${when}.`,
    };
  });

  protected readonly whatsapp = computed(() => `https://wa.me/?text=${encodeURIComponent(this.message())}`);

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    // Prévia exclusiva: pede aos buscadores para não listar a página
    const robots = meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
    inject(DestroyRef).onDestroy(() => {
      if (robots) meta.removeTagElement(robots);
    });
    effect(() => {
      const s = this.sermon();
      if (s) title.setTitle(`Prévia para aprovação · ${s.meta.pt.title}`);
      if (s && !this.name()) this.name.set(s.author);
    });
  }

  protected decide(decision: Decision): void {
    const s = this.sermon();
    if (!s || !this.version()) return;
    const entry: Saved = { decision, version: this.version(), name: this.name().trim(), note: this.note().trim(), at: new Date().toISOString() };
    const next = { ...this.saved(), [s.id]: entry };
    this.saved.set(next);
    saveLocal(KEY, JSON.stringify(next));
    this.copied.set(false);
    this.message.set(approvalMessage(s, { decision, version: entry.version, name: entry.name, note: entry.note }));
  }

  protected async share(text: string): Promise<void> {
    try {
      await navigator.share({ text });
    } catch {
      // A pessoa fechou a folha de compartilhar: nada a fazer
    }
  }

  protected async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
    } catch {
      // Sem permissão para copiar: a mensagem continua na tela
    }
  }

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }

  protected val(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  private load(): Record<string, Saved> {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Saved>;
    } catch {
      return {};
    }
  }
}
