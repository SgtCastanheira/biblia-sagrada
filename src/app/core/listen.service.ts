import { Injectable, signal } from '@angular/core';
import { AudioEntry, AudioIndex, normalizeForMatch, textKey } from './audio-text';
import { splitForSpeech } from './speech-split';
import { narrationVoice, portugueseVoices, warmUpVoices } from './voice';

/** Um trecho para ouvir: o texto e, se houver, o elemento da tela que ele destaca enquanto é lido. */
export interface ListenItem {
  text: string;
  el?: HTMLElement | null;
}

/** Como está sendo lido: com a voz do aparelho ou com a gravação (voz neural) da história. */
export type ListenMode = 'speech' | 'audio';

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
  /** Nome da voz gravada, quando a história toca em áudio. */
  readonly recordedVoice = signal('');
  readonly mode = signal<ListenMode>('speech');
  readonly rate = signal(this.savedRate());
  /** Vozes em português deste aparelho; a lista chega depois no Chrome e no Edge. */
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  /** Voz escolhida pela pessoa (voiceURI); vazio = a melhor do aparelho. */
  readonly voiceUri = signal(this.saved('listenVoice') ?? '');

  /** Por que a voz não tocou (sem voz no aparelho, bloqueio do navegador…); vazio quando está tudo bem. */
  readonly problem = signal('');

  private audio: HTMLAudioElement | null = null;
  private audioIndex: Promise<AudioIndex | null> | null = null;
  /** Tempo de início de cada trecho da tela, quando casa com a gravação (-1: sem trecho correspondente). */
  private starts: number[] = [];

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
    this.stopAudio();
    this.mode.set('speech');
    this.halt();
    this.title.set(title);
    this.items.set(items);
    this.onEnd = options.onEnd;
    this.speakItem(Math.min(options.from ?? 0, items.length - 1));
  }

  /**
   * Ouvir uma história. Se ela tem gravação (public/audio, gerada por tools/gerar-audio.mjs), toca a voz neural;
   * senão, lê com a voz do aparelho. Devolve false se nenhum dos dois é possível.
   */
  async startStory(title: string, key: string, items: ListenItem[]): Promise<boolean> {
    if (!items.length) return false;
    const entry = await this.recording(key);
    if (entry && this.playRecording(title, key, entry, items)) return true;
    if (!this.supported) return false;
    this.mode.set('speech');
    this.start(title, items);
    return true;
  }

  private recording(key: string): Promise<AudioEntry | null> {
    this.audioIndex ??= fetch(new URL('audio/index.json', document.baseURI))
      .then((r) => (r.ok ? (r.json() as Promise<AudioIndex>) : null))
      .catch(() => null);
    return this.audioIndex.then((index) => {
      if (index) this.recordedVoice.set(index.voice);
      return index?.files[key] ?? null;
    });
  }

  private playRecording(title: string, key: string, entry: AudioEntry, items: ListenItem[]): boolean {
    this.halt();
    this.clearMarks();
    // Casa cada trecho da tela com o trecho gravado, em ordem; o que não casa fica sem destaque
    let cursor = 0;
    this.starts = items.map((item) => {
      const k = textKey(item.text);
      const found = entry.items.findIndex((e, i) => i >= cursor && e.k === k);
      if (found < 0) return -1;
      cursor = found + 1;
      return entry.items[found].t;
    });
    if (this.starts.filter((t) => t >= 0).length < Math.min(2, items.length)) return false;
    const audio = new Audio(new URL(`audio/${key}.mp3`, document.baseURI).href);
    audio.preload = 'auto';
    audio.playbackRate = this.rate();
    audio.ontimeupdate = () => this.followAudio();
    audio.onended = () => this.stop();
    audio.onerror = () => {
      // Arquivo ausente ou ilegível: cai para a voz do aparelho
      if (this.audio !== audio) return;
      this.stopAudio();
      if (this.supported) {
        this.mode.set('speech');
        this.start(title, items);
      } else {
        this.state.set('paused');
        this.problem.set('Não foi possível carregar a gravação. Verifique a conexão.');
      }
    };
    this.audio = audio;
    this.mode.set('audio');
    this.title.set(title);
    this.items.set(items);
    this.index.set(0);
    this.problem.set('');
    this.state.set('playing');
    audio.play().catch(() => {
      if (this.audio === audio) this.state.set('paused');
    });
    return true;
  }

  /** Destaca o trecho que a gravação está falando agora. */
  private followAudio(): void {
    if (!this.audio) return;
    const now = this.audio.currentTime;
    let current = -1;
    this.starts.forEach((t, i) => { if (t >= 0 && t <= now + 0.05) current = i; });
    if (current >= 0 && current !== this.index()) {
      this.index.set(current);
      this.mark(this.items()[current]?.el);
    } else if (current === 0 && !document.querySelector('.speaking')) {
      this.mark(this.items()[0]?.el);
    }
  }

  private stopAudio(): void {
    if (!this.audio) return;
    this.audio.onended = this.audio.onerror = this.audio.ontimeupdate = null;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio = null;
  }

  private seekAudio(delta: 1 | -1): void {
    if (!this.audio) return;
    const now = this.audio.currentTime;
    const times = this.starts.map((t, i) => ({ t, i })).filter((x) => x.t >= 0);
    const target = delta === 1 ? times.find((x) => x.t > now + 0.3) : [...times].reverse().find((x) => x.t < now - 1.5) ?? times[0];
    if (target) {
      this.audio.currentTime = target.t;
      this.index.set(target.i);
      this.mark(this.items()[target.i]?.el);
    }
  }

  toggle(): void {
    if (this.audio) {
      if (this.audio.paused) {
        this.problem.set('');
        void this.audio.play();
        this.state.set('playing');
      } else {
        this.audio.pause();
        this.state.set('paused');
      }
      return;
    }
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
    if (this.audio) return this.seekAudio(1);
    if (this.index() + 1 < this.items().length) this.speakItem(this.index() + 1);
  }

  previous(): void {
    if (this.state() === 'idle') return;
    if (this.audio) return this.seekAudio(-1);
    this.speakItem(Math.max(0, this.index() - 1));
  }

  stop(): void {
    this.stopAudio();
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
    if (this.audio) this.audio.playbackRate = rate;
    else if (this.state() === 'playing') this.speakItem(this.index());
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
