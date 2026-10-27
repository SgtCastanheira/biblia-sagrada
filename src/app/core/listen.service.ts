import { Injectable, signal } from '@angular/core';
import { splitForSpeech } from './speech-split';
import { narrationVoice, portugueseVoices, warmUpVoices } from './voice';

/** Um trecho para ouvir: o texto e, se houver, o elemento da tela que ele destaca enquanto é lido. */
export interface ListenItem {
  text: string;
  el?: HTMLElement | null;
}

export type ListenState = 'idle' | 'playing' | 'paused';

/** Velocidades oferecidas: a padrão é um pouco mais lenta que a fala normal, para soar calma. */
export const LISTEN_RATES = [0.8, 0.92, 1, 1.15];

const PAUSE_BETWEEN_ITEMS = 450;

/**
 * "Ouvir": lê em voz alta, trecho por trecho, um capítulo da Bíblia ou uma história. Usa a melhor voz brasileira
 * do aparelho (voice.ts), um pouco mais devagar, com uma pausa entre os trechos. Destaca na tela o que está sendo lido.
 */
@Injectable({ providedIn: 'root' })
export class ListenService {
  readonly supported = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  readonly state = signal<ListenState>('idle');
  readonly title = signal('');
  readonly items = signal<ListenItem[]>([]);
  readonly index = signal(0);
  readonly rate = signal(this.savedRate());
  /** Vozes em português deste aparelho; a lista chega depois no Chrome e no Edge. */
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  /** Voz escolhida pela pessoa (voiceURI); vazio = a melhor do aparelho. */
  readonly voiceUri = signal(this.saved('listenVoice') ?? '');

  /** Por que a voz não tocou (sem voz no aparelho, bloqueio do navegador…); vazio quando está tudo bem. */
  readonly problem = signal('');

  private run = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private watchdog: ReturnType<typeof setTimeout> | undefined;
  private onEnd: (() => void) | undefined;

  constructor() {
    if (this.supported) {
      warmUpVoices();
      const refresh = () => this.voices.set(portugueseVoices());
      refresh();
      speechSynthesis.addEventListener?.('voiceschanged', refresh);
    }
  }

  /** Começa a ler. `onEnd` é chamado quando o último trecho termina (a Bíblia usa para seguir ao próximo capítulo). */
  start(title: string, items: ListenItem[], options: { from?: number; onEnd?: () => void } = {}): void {
    if (!this.supported || !items.length) return;
    this.halt();
    this.title.set(title);
    this.items.set(items);
    this.onEnd = options.onEnd;
    this.speakItem(Math.min(options.from ?? 0, items.length - 1));
  }

  toggle(): void {
    if (this.state() === 'playing') {
      this.halt();
      this.state.set('paused');
    } else if (this.state() === 'paused') {
      this.problem.set('');
      this.speakItem(this.index());
    }
  }

  next(): void {
    if (this.state() === 'idle') return;
    if (this.index() + 1 < this.items().length) this.speakItem(this.index() + 1);
  }

  previous(): void {
    if (this.state() === 'idle') return;
    this.speakItem(Math.max(0, this.index() - 1));
  }

  stop(): void {
    this.halt();
    this.clearMarks();
    this.state.set('idle');
    this.problem.set('');
    this.items.set([]);
    this.onEnd = undefined;
  }

  setRate(rate: number): void {
    this.rate.set(rate);
    try {
      localStorage.setItem('listenRate', String(rate));
    } catch { /* sem armazenamento: vale só nesta sessão */ }
    if (this.state() === 'playing') this.speakItem(this.index());
  }

  setVoice(uri: string): void {
    this.voiceUri.set(uri);
    try {
      localStorage.setItem('listenVoice', uri);
    } catch { /* vale só nesta sessão */ }
    if (this.state() === 'playing') this.speakItem(this.index());
  }

  /** Cancela a fala em andamento sem mexer no estado do player. */
  private halt(): void {
    this.run++;
    clearTimeout(this.timer);
    clearTimeout(this.watchdog);
    if (this.supported) speechSynthesis.cancel();
  }

  private speakItem(i: number): void {
    const item = this.items()[i];
    if (!item) return;
    this.halt();
    const run = this.run;
    this.index.set(i);
    this.state.set('playing');
    this.problem.set('');
    this.mark(item.el);
    const chunks = splitForSpeech(item.text);
    let started = false;
    const speakChunk = (n: number) => {
      if (run !== this.run) return;
      if (n >= chunks.length) {
        this.timer = setTimeout(() => this.finishItem(run), PAUSE_BETWEEN_ITEMS);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[n]);
      utterance.lang = 'pt-BR';
      utterance.voice = this.voices().find((v) => v.voiceURI === this.voiceUri()) ?? narrationVoice();
      utterance.rate = this.rate();
      utterance.pitch = 0.95;
      utterance.onstart = () => (started = true);
      utterance.onend = () => speakChunk(n + 1);
      utterance.onerror = (e) => {
        // "canceled" e "interrupted" acontecem ao pausar ou trocar de trecho; o resto para o player
        if (e.error === 'canceled' || e.error === 'interrupted' || run !== this.run) return;
        this.fail(run, e.error === 'not-allowed' ? 'O navegador bloqueou o som. Toque em continuar.' : undefined);
      };
      speechSynthesis.speak(utterance);
      // Alguns navegadores (como o Brave no Linux) aceitam a fala e nunca começam: sem voz instalada
      if (n === 0) {
        this.watchdog = setTimeout(() => { if (!started && run === this.run) this.fail(run); }, 4000);
      }
    };
    // O Chrome perde a fala pedida logo depois de um cancelamento; uma folga curta resolve
    this.timer = setTimeout(() => speakChunk(0), 80);
  }

  private fail(run: number, message?: string): void {
    if (run !== this.run) return;
    this.halt();
    this.state.set('paused');
    this.problem.set(message ?? (this.voices().length
      ? 'A voz não respondeu. Escolha outra voz abaixo ou tente de novo.'
      : 'Este navegador não tem voz em português. Abra no Edge, no computador, ou no Chrome do celular.'));
  }

  private finishItem(run: number): void {
    if (run !== this.run) return;
    if (this.index() + 1 < this.items().length) {
      this.speakItem(this.index() + 1);
      return;
    }
    const done = this.onEnd;
    this.clearMarks();
    this.state.set('idle');
    this.items.set([]);
    this.onEnd = undefined;
    done?.();
  }

  private mark(el: HTMLElement | null | undefined): void {
    this.clearMarks();
    if (!el) return;
    el.classList.add('speaking');
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
  }

  private clearMarks(): void {
    document.querySelectorAll('.speaking').forEach((e) => e.classList.remove('speaking'));
  }

  private saved(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private savedRate(): number {
    try {
      const saved = Number(localStorage.getItem('listenRate'));
      return LISTEN_RATES.includes(saved) ? saved : 0.92;
    } catch {
      return 0.92;
    }
  }
}
