import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { PassionBlood } from './passion-blood';

const MOMENTS = [
  { label: 'Preparação', start: 0, title: 'Antes do contato', text: 'A reconstituição mostra o carrasco preparando o movimento diante de um torso de treinamento. No corte ao lado, observe a continuidade da pele.', anatomy: 'Tecido íntegro' },
  { label: 'Aproximação', start: .3, title: 'O movimento se aproxima do corpo', text: 'A ação avança até a região indicada. Acompanhe a mesma etapa no corte ampliado; o contato ainda não aconteceu.', anatomy: 'Antes do contato' },
  { label: 'Contato', start: .53, title: 'O tecido recebe o impacto', text: 'O contato transmite uma carga aos tecidos. A deformação foi ampliada visualmente para que você consiga acompanhar o que muda na superfície.', anatomy: 'Deformação ilustrativa' },
  { label: 'Resposta', start: .82, title: 'Lesão, vasos e sinal nervoso', text: 'Uma lesão que alcança vasos pode sangrar. Estímulos lesivos podem iniciar sinais nervosos que seguem para o sistema nervoso central e participam da percepção da dor.', anatomy: 'Lesão e sinal nervoso' },
];

@Component({
  selector: 'app-passion-impact',
  imports: [PassionBlood],
  host: { '(document:visibilitychange)': 'onVisibilityChange()' },
  template: `
    <section class="impact-lesson" aria-label="Simulação do movimento e da resposta dos tecidos">
      <header><span class="overline">AÇÃO E ANATOMIA · SEQUÊNCIA SINCRONIZADA</span><h4>Do movimento à resposta do tecido</h4><p>A sequência se repete automaticamente enquanto estiver à vista. Pause ou escolha um momento para examinar os detalhes.</p></header>
      <div #motionViewport class="paired-view">
        <div class="action-panel">
          <div class="view-label"><span>01 · RECONSTITUIÇÃO</span><span>{{ moment().label }}</span></div>
          <div class="action-frame" [style.background-image]="spriteUrl" [style.background-position]="framePosition()" role="img" [attr.aria-label]="'Reconstituição didática do carrasco com torso de treinamento: ' + moment().label">
            <span class="model-label">Torso de treinamento</span>
          </div>
        </div>
        <div class="tissue-panel">
          <div class="view-label"><span>02 · CORTE ANATÔMICO</span><span>{{ moment().anatomy }}</span></div>
          <div class="tissue-window" role="img" [attr.aria-label]="'Corte da pele: ' + moment().anatomy">
            <div class="tissue-motion" [style.transform]="tissueTransform()">
              <img src="conteudo/imagens/paixao-anatomia-pele-integra.webp" alt="" width="1448" height="1086" loading="lazy" decoding="async" />
              <img class="injured-tissue" src="conteudo/imagens/paixao-anatomia-pele-v2.webp" alt="" width="1448" height="1086" [style.opacity]="injuryOpacity()" loading="lazy" decoding="async" />
              @if (progress() >= .64) { <app-passion-blood [playing]="playing()" /> }
              <svg class="tissue-signals" viewBox="0 0 1448 1086" aria-hidden="true" focusable="false">
                <ellipse class="contact" cx="1070" cy="230" rx="80" ry="55" [attr.opacity]="contactOpacity()" />
                <path class="nerve-route" d="M1005 342 Q967 387 948 430 T885 508 Q853 557 802 602" pathLength="100" [attr.stroke-dashoffset]="nerveOffset()" [attr.opacity]="progress() >= .68 ? 1 : 0" />
              </svg>
            </div>
            @if (progress() >= .68) { <span class="nerve-label">Sinal nervoso · trajeto esquemático</span> }
          </div>
        </div>
      </div>
      <div class="transport">
        <div class="playback-buttons"><button type="button" class="play" [attr.aria-pressed]="playing()" (click)="toggle()">{{ playing() ? 'Pausar simulação' : progress() >= 1 ? 'Rever simulação' : 'Reproduzir simulação' }}</button><button type="button" (click)="reset()">Voltar ao início</button></div>
        <div class="speed" role="group" aria-label="Velocidade da reprodução"><button type="button" [attr.aria-pressed]="!slow()" (click)="slow.set(false)">Normal</button><button type="button" [attr.aria-pressed]="slow()" (click)="slow.set(true)">Câmera lenta</button></div>
      </div>
      <label class="timeline"><span>Momento da simulação <output>{{ percentage() }}%</output></span><input type="range" min="0" max="100" step="1" [value]="percentage()" [attr.aria-valuetext]="moment().label + ', ' + percentage() + ' por cento da sequência didática'" (input)="seek($event)" /></label>
      <div class="moments" role="group" aria-label="Escolher um momento da simulação">
        @for (m of moments; track m.label; let i = $index) { <button type="button" [attr.aria-pressed]="phase() === i" (click)="selectMoment(i)"><span aria-hidden="true">{{ i + 1 }}</span>{{ m.label }}</button> }
      </div>
      <div class="moment-explanation" [attr.aria-live]="playing() ? 'off' : 'polite'"><span class="moment-number">{{ phase() + 1 }}</span><div><h5>{{ moment().title }}</h5><p>{{ moment().text }}</p></div></div>
      <section class="aftermath" aria-label="Visão posterior após os açoites">
        <div class="aftermath-heading"><span class="overline">APÓS AS AGRESSÕES · VISÃO POSTERIOR</span><h5>As costas após os açoites</h5><p>Uma visão de conjunto das lesões que uma reconstituição artística pode representar após agressões repetidas.</p></div>
        <figure><img src="conteudo/imagens/paixao-anatomia-costas-v2.webp" alt="Reconstituição posterior de costas adultas com hematomas extensos, inchaço e vergões irregulares sobre pele fechada, do pescoço à cintura." loading="lazy" decoding="async" /><figcaption>Reconstituição ilustrativa gerada por IA. Os Evangelhos não registram o mapa, a quantidade ou a profundidade das feridas nas costas de Jesus; esta imagem não estabelece sua aparência exata.</figcaption></figure>
        <button type="button" class="back-enlarge" (click)="backDialog.showModal()">Ampliar visão das costas</button>
      </section>
      <dialog #backDialog class="back-dialog" aria-label="Visão ampliada das costas após os açoites"><div class="back-dialog-heading"><strong>As costas após os açoites</strong><button type="button" (click)="backDialog.close()">Fechar</button></div><img src="conteudo/imagens/paixao-anatomia-costas-v2.webp" alt="Visão posterior ilustrativa das costas após agressões, sem pretensão de reproduzir exatamente os ferimentos de Jesus." loading="lazy" decoding="async" /></dialog>
      <p class="simulation-note">Reconstituição artística com modelo de treinamento e anatomia ilustrativa. Os momentos, a deformação e o trajeto nervoso foram organizados para ensino; não medem força, tempo, profundidade ou dor de Jesus. A sequência mostra uma possibilidade de lesão, sem reproduzir cada açoite.</p>
      <a class="reference" href="https://openstax.org/books/anatomy-and-physiology-2e/pages/14-1-sensory-perception" target="_blank" rel="noopener noreferrer">Percepção da dor · OpenStax, 14.1 ↗</a>
    </section>
  `,
  styleUrl: './passion-impact.scss',
})
export class PassionImpact {
  protected readonly moments = MOMENTS;
  protected readonly spriteUrl = 'url("conteudo/imagens/paixao-anatomia-acao-v2.webp")';
  protected readonly progress = signal(0);
  protected readonly playing = signal(false);
  protected readonly slow = signal(true);
  protected readonly percentage = computed(() => Math.round(this.progress() * 100));
  protected readonly phase = computed(() => this.progress() < .25 ? 0 : this.progress() < .48 ? 1 : this.progress() < .68 ? 2 : 3);
  protected readonly moment = computed(() => MOMENTS[this.phase()]);
  protected readonly framePosition = computed(() => ['0% 0%', '100% 0%', '0% 100%', '100% 100%'][this.phase()]);
  protected readonly injuryOpacity = computed(() => Math.max(0, Math.min(1, (this.progress() - .55) / .13)));
  protected readonly contactOpacity = computed(() => this.progress() >= .48 && this.progress() < .68 ? Math.sin((this.progress() - .48) / .2 * Math.PI) * .7 : 0);
  protected readonly nerveOffset = computed(() => 100 - Math.max(0, Math.min(1, (this.progress() - .68) / .25)) * 100);
  protected readonly tissueTransform = computed(() => {
    const deformation = this.contactOpacity();
    return 'translateY(' + deformation * 6 + 'px) scale(' + (1 + deformation * .025) + ',' + (1 - deformation * .05) + ')';
  });
  private frame: number | null = null;
  private previousTime: number | null = null;
  private readonly motionViewport = viewChild<ElementRef<HTMLElement>>('motionViewport');
  private inView = false;
  private userPaused = false;
  private autoAllowed = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    let observer: IntersectionObserver | undefined;
    afterNextRender(() => {
      this.autoAllowed = !matchMedia('(prefers-reduced-motion: reduce)').matches;
      const target = this.motionViewport()?.nativeElement;
      if (!target) return;
      observer = new IntersectionObserver(entries => {
        this.inView = entries[0].isIntersecting;
        if (!this.inView) this.pause();
        else this.resumeAutomatically();
      }, { threshold: .15 });
      observer.observe(target);
    });
    destroyRef.onDestroy(() => { observer?.disconnect(); this.pause(); });
  }

  protected toggle(): void {
    if (this.playing()) { this.userPaused = true; this.pause(); return; }
    this.userPaused = false;
    this.start();
  }
  private start(): void {
    if (this.playing()) return;
    if (this.progress() >= 1) this.progress.set(0);
    this.playing.set(true);
    this.previousTime = null;
    this.frame = requestAnimationFrame(this.tick);
  }
  protected reset(): void { this.userPaused = true; this.pause(); this.progress.set(0); }
  protected seek(event: Event): void { this.userPaused = true; this.pause(); this.progress.set(Number((event.target as HTMLInputElement).value) / 100); }
  protected selectMoment(index: number): void { this.userPaused = true; this.pause(); this.progress.set(MOMENTS[index].start); }
  protected onVisibilityChange(): void { if (document.hidden) this.pause(); else this.resumeAutomatically(); }
  private resumeAutomatically(): void { if (this.autoAllowed && this.inView && !this.userPaused && !document.hidden) this.start(); }
  private pause(): void {
    this.playing.set(false);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.previousTime = null;
  }
  private readonly tick = (timestamp: number): void => {
    this.frame = null;
    if (!this.playing()) return;
    const elapsed = this.previousTime === null ? 0 : Math.min(100, timestamp - this.previousTime);
    this.previousTime = timestamp;
    this.progress.update(value => Math.min(1, value + elapsed / (this.slow() ? 12000 : 6000)));
    if (this.progress() >= 1) this.progress.set(0);
    this.frame = requestAnimationFrame(this.tick);
  };
}
