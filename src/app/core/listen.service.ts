import { Injectable, signal } from '@angular/core';
import { AudioEntry, AudioIndex, textKey } from './audio-text';
import { BibleAudioCoverage, BIBLE_AUDIO_COVERAGE_FILE, bibleAudioUrl, ChapterAudio, chapterAudioFile, hasChapterAudio, matchChapter } from './bible-audio';
import { splitForSpeech } from './speech-split';
import { narrationVoice, SPEECH_TAGS, voicesFor, warmUpVoices } from './voice';

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

/** Quando faltam estes segundos para acabar o capítulo gravado, o seguinte começa a ser baixado, para a leitura não parar entre um e outro. */
const WARM_BEFORE_END = 25;

/** Por quanto tempo, depois de parar, o capítulo seguinte já baixado continua guardado (milissegundos). */
const WARM_KEEP_MS = 15_000;

/** Dois quadros de silêncio: tocados no toque da pessoa, liberam o <audio> para tocar depois sozinho (exigência do Safari do iPhone). */
const SILENCE = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAAA';

/** Nome da língua, para o aviso de que o aparelho não tem voz nela. */
const LANGUAGE_NAMES: Record<string, string> = { pt: 'português', es: 'espanhol', en: 'inglês', fr: 'francês', de: 'alemão', ru: 'russo' };

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
  /** Língua da leitura ("pt" por padrão; "es", "en", "fr", "de", "ru" nos jornais de Novas Vozes). */
  readonly lang = signal('pt');
  /** Vozes deste aparelho na língua da leitura; a lista chega depois no Chrome e no Edge. */
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  /** Voz escolhida pela pessoa (voiceURI) para esta língua; vazio = a melhor do aparelho. */
  readonly voiceUri = signal(this.saved('listenVoice') ?? '');

  /** Por que a voz não tocou (sem voz no aparelho, bloqueio do navegador…); vazio quando está tudo bem. */
  readonly problem = signal('');

  private audio: HTMLAudioElement | null = null;
  /**
   * O único <audio> do app, criado uma vez. No iPhone só um elemento já liberado por um toque toca depois sem toque
   * (como na passagem automática de um capítulo para o outro), então ele é reaproveitado em vez de criar um novo a cada gravação.
   */
  private audioEl: HTMLAudioElement | null = null;
  private unlocked = false;
  private audioIndex: Promise<AudioIndex | null> | null = null;
  /** Lista dos capítulos da Bíblia gravados (cobertura) e os tempos de cada capítulo já lido; ficam na sessão. */
  private bibleCoverage: Promise<BibleAudioCoverage | null> | null = null;
  private readonly chapterEntries = new Map<string, Promise<ChapterAudio | null>>();
  /** MP3 do capítulo seguinte já baixado (endereço do arquivo → endereço local do blob) e o que está tocando agora. */
  private readonly warmed = new Map<string, string>();
  private readonly warming = new Set<string>();
  private blobInUse = '';
  /** Chamado uma vez, perto do fim do capítulo gravado, para começar a baixar o seguinte. */
  private warmNext: (() => void) | null = null;
  private warmTimer: ReturnType<typeof setTimeout> | undefined;
  /** Tempo de início de cada trecho da tela, quando casa com a gravação (-1: sem trecho correspondente). */
  private starts: number[] = [];

  private run = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private watchdog: ReturnType<typeof setTimeout> | undefined;
  private onEnd: (() => void) | undefined;

  constructor() {
    if (this.supported) {
      warmUpVoices();
      const refresh = () => this.voices.set(voicesFor(this.lang()));
      refresh();
      speechSynthesis.addEventListener?.('voiceschanged', refresh);
    }
  }

  /** Começa a ler. `onEnd` é chamado quando o último trecho termina (a Bíblia usa para seguir ao próximo capítulo). */
  start(title: string, items: ListenItem[], options: { from?: number; onEnd?: () => void; lang?: string } = {}): void {
    if (!this.supported || !items.length) return;
    this.stopAudio();
    this.clearWarm();
    this.mode.set('speech');
    this.halt();
    this.setLang(options.lang ?? 'pt');
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
    this.unlock(); // ainda dentro do toque da pessoa, antes de esperar a rede
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
      const entry = index?.files[key] ?? null;
      if (index) this.recordedVoice.set(entry?.voice ?? index.voice);
      return entry;
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
    this.onEnd = undefined; // um fim de capítulo da Bíblia que ficou pendente não pode disparar ao acabar a história
    this.warmNext = null;
    this.playUrl(title, new URL(`audio/${key}.mp3`, document.baseURI).href, items, () => this.start(title, items));
    return true;
  }

  /**
   * Ouvir um capítulo da Bíblia (Almeida). Toca a gravação (public/audio ou o armazém, veja bible-audio.ts) quando o
   * capítulo está na cobertura e cada trecho da tela casa com o gravado; senão devolve false e quem chamou lê com a voz do
   * aparelho. `onEnd` roda ao fim do capítulo (o leitor segue para o próximo) e `next` diz qual vem depois, para baixá-lo antes.
   */
  async startChapter(
    title: string,
    bookId: string,
    chapter: number,
    items: ListenItem[],
    options: { onEnd?: () => void; next?: { bookId: string; chapter: number } | null } = {},
  ): Promise<boolean> {
    if (!items.length) return false;
    this.unlock(); // ainda dentro do toque da pessoa, antes de esperar a rede
    this.halt();
    const run = this.run;
    const coverage = await this.chapterCoverage();
    // Se a pessoa parou ou pediu outra coisa enquanto a rede respondia, não há o que fazer: "true" diz a quem chamou que não leia com a voz do aparelho
    if (run !== this.run) return true;
    if (!hasChapterAudio(coverage, bookId, chapter)) return false;
    const entry = await this.chapterEntry(bookId, chapter);
    if (run !== this.run) return true;
    const starts = entry ? matchChapter(entry, items.map((item) => item.text)) : null;
    if (!entry || !starts) return false;
    this.stopAudio();
    this.clearMarks();
    this.starts = starts;
    this.onEnd = options.onEnd;
    this.recordedVoice.set(entry.voice || coverage?.voice || '');
    const next = options.next;
    this.warmNext = next ? () => this.warmChapter(next.bookId, next.chapter) : null;
    const url = bibleAudioUrl(chapterAudioFile(bookId, chapter, 'mp3'), document.baseURI);
    this.playUrl(title, url, items, () => this.start(title, items, { onEnd: options.onEnd }));
    return true;
  }

  /** A lista de capítulos gravados; sem ela (sem internet, ou nada gravado ainda) o app lê com a voz do aparelho. */
  private chapterCoverage(): Promise<BibleAudioCoverage | null> {
    this.bibleCoverage ??= this.fetchJson<BibleAudioCoverage>(bibleAudioUrl(BIBLE_AUDIO_COVERAGE_FILE, document.baseURI)).then((c) => {
      const valid = c && typeof c === 'object' && c.books && typeof c.books === 'object' ? c : null;
      if (!valid) this.bibleCoverage = null; // tenta de novo na próxima vez (a conexão pode voltar)
      return valid;
    });
    return this.bibleCoverage;
  }

  /** Os tempos de um capítulo gravado. */
  private chapterEntry(bookId: string, chapter: number): Promise<ChapterAudio | null> {
    const key = `${bookId}-${chapter}`;
    let entry = this.chapterEntries.get(key);
    if (!entry) {
      entry = this.fetchJson<ChapterAudio>(bibleAudioUrl(chapterAudioFile(bookId, chapter, 'json'), document.baseURI)).then((e) => {
        const valid = e && Array.isArray(e.items) ? e : null;
        if (!valid) this.chapterEntries.delete(key);
        return valid;
      });
      this.chapterEntries.set(key, entry);
    }
    return entry;
  }

  private fetchJson<T>(url: string): Promise<T | null> {
    return fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<T>) : null))
      .catch(() => null);
  }

  /** Começa a baixar o capítulo seguinte (os tempos e o MP3) se ele tiver gravação. */
  private warmChapter(bookId: string, chapter: number): void {
    void this.chapterCoverage().then((coverage) => {
      if (!hasChapterAudio(coverage, bookId, chapter)) return;
      void this.chapterEntry(bookId, chapter);
      const url = bibleAudioUrl(chapterAudioFile(bookId, chapter, 'mp3'), document.baseURI);
      if (this.warmed.has(url) || this.warming.has(url)) return;
      this.warming.add(url);
      fetch(url)
        .then((r) => (r.ok ? r.blob() : null))
        .then((blob) => { if (blob) this.warmed.set(url, URL.createObjectURL(blob)); })
        .catch(() => { /* sem CORS ou sem rede: o capítulo seguinte toca direto do endereço, com uma pequena espera */ })
        .finally(() => this.warming.delete(url));
    });
  }

  /** Solta os capítulos baixados antes e ainda não tocados. */
  private dropWarmed(): void {
    clearTimeout(this.warmTimer);
    this.warmNext = null;
    for (const local of this.warmed.values()) URL.revokeObjectURL(local);
    this.warmed.clear();
  }

  /** Solta também o arquivo local do capítulo que estava tocando. */
  private revokeInUse(): void {
    if (this.blobInUse) URL.revokeObjectURL(this.blobInUse);
    this.blobInUse = '';
  }

  /** Solta tudo o que foi baixado antes (a leitura mudou de rumo). */
  private clearWarm(): void {
    this.dropWarmed();
    this.revokeInUse();
  }

  /** O <audio> único do app (veja `audioEl`). */
  private audioElement(): HTMLAudioElement {
    return (this.audioEl ??= new Audio());
  }

  /**
   * No iPhone, o navegador só deixa um <audio> tocar se o primeiro som saiu de dentro de um toque. Por isso, logo no toque em
   * "Ouvir", antes de buscar qualquer arquivo, o <audio> toca um instante de silêncio: depois disso ele toca sozinho, com
   * outro arquivo, inclusive na passagem de um capítulo para o outro com a tela apagada.
   */
  private unlock(): void {
    if (this.unlocked || typeof Audio === 'undefined') return;
    this.unlocked = true;
    const el = this.audioElement();
    el.src = SILENCE;
    el.play().catch(() => { this.unlocked = false; });
  }

  /** Toca um MP3 com os tempos já em `starts`; se o arquivo não carregar, cai para `fallback` (a voz do aparelho). */
  private playUrl(title: string, url: string, items: ListenItem[], fallback: () => void): void {
    const audio = this.audioElement();
    audio.onended = audio.onerror = audio.ontimeupdate = null;
    this.audio = audio;
    // Se o capítulo já foi baixado antes, toca o arquivo local; o anterior, que acabou de tocar, pode ser solto
    const local = this.warmed.get(url);
    this.warmed.delete(url);
    if (this.blobInUse) URL.revokeObjectURL(this.blobInUse);
    this.blobInUse = local ?? '';
    audio.preload = 'auto';
    audio.defaultPlaybackRate = this.rate(); // trocar o arquivo volta a velocidade ao padrão do elemento
    audio.src = local ?? url;
    audio.playbackRate = this.rate();
    audio.ontimeupdate = () => this.followAudio();
    audio.onended = () => {
      // Termina como `stop()`, mas sem soltar o capítulo seguinte que já foi baixado; `onEnd` leva ao próximo capítulo
      const done = this.onEnd;
      this.release();
      done?.();
    };
    audio.onerror = () => {
      // Arquivo ausente ou ilegível: cai para a voz do aparelho
      if (this.audio !== audio) return;
      this.stopAudio();
      if (this.supported) {
        this.mode.set('speech');
        fallback();
      } else {
        this.state.set('paused');
        this.problem.set('Não foi possível carregar a gravação. Verifique a conexão.');
      }
    };
    this.mode.set('audio');
    this.title.set(title);
    this.items.set(items);
    this.index.set(0);
    this.problem.set('');
    this.state.set('playing');
    audio.play().catch(() => {
      if (this.audio === audio) this.state.set('paused');
    });
  }

  /** Destaca o trecho que a gravação está falando agora. */
  private followAudio(): void {
    if (!this.audio) return;
    const now = this.audio.currentTime;
    // Perto do fim do capítulo, começa a baixar o seguinte (uma vez só)
    if (this.warmNext && Number.isFinite(this.audio.duration) && this.audio.duration - now < WARM_BEFORE_END) {
      const warm = this.warmNext;
      this.warmNext = null;
      warm();
    }
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

  /**
   * A pessoa parou (ou o leitor virou de capítulo): fecha o player. O capítulo seguinte já baixado fica guardado por
   * alguns segundos, porque o leitor, ao virar de capítulo com a leitura em andamento, para e recomeça logo em seguida.
   */
  stop(): void {
    this.release();
    this.revokeInUse();
    clearTimeout(this.warmTimer);
    this.warmTimer = setTimeout(() => this.dropWarmed(), WARM_KEEP_MS);
  }

  /** Fecha o player. Quando a gravação acaba sozinha e segue para o próximo capítulo, o que foi baixado antes é mantido. */
  private release(): void {
    this.stopAudio();
    this.halt();
    this.clearMarks();
    this.state.set('idle');
    this.problem.set('');
    this.items.set([]);
    this.onEnd = undefined;
    this.warmNext = null;
  }

  setRate(rate: number): void {
    this.rate.set(rate);
    try {
      localStorage.setItem('listenRate', String(rate));
    } catch { /* sem armazenamento: vale só nesta sessão */ }
    if (this.audio) this.audio.playbackRate = rate;
    else if (this.state() === 'playing') this.speakItem(this.index());
  }

  /** A voz escolhida fica guardada por língua: a do português tem a chave de sempre, as outras levam o código. */
  private voiceKey(lang = this.lang()): string {
    return lang === 'pt' ? 'listenVoice' : `listenVoice.${lang}`;
  }

  private setLang(lang: string): void {
    this.lang.set(lang);
    this.voiceUri.set(this.saved(this.voiceKey(lang)) ?? '');
    this.voices.set(voicesFor(lang));
  }

  setVoice(uri: string): void {
    this.voiceUri.set(uri);
    try {
      localStorage.setItem(this.voiceKey(), uri);
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
      utterance.lang = SPEECH_TAGS[this.lang()] ?? 'pt-BR';
      utterance.voice = this.voices().find((v) => v.voiceURI === this.voiceUri()) ?? narrationVoice(this.lang());
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
      : `Este navegador não tem voz em ${LANGUAGE_NAMES[this.lang()] ?? 'português'}. Abra no Edge, no computador, ou no Chrome do celular.`));
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
