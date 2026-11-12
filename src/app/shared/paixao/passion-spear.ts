import { Component, ElementRef, computed, viewChild } from '@angular/core';
import { passionPlayback } from './passion-playback';

/** Folha 1536×1536 com seis quadros de 768×512 (2 colunas × 3 linhas), lidos da esquerda para a direita e de cima para baixo. */
const SHEET = 'url("conteudo/imagens/paixao-anatomia-lanca-agua-sangue-v6.webp")';
const GIF = 'conteudo/imagens/paixao-anatomia-lanca-agua-sangue-v6.gif';

/** Os quadros não duram o mesmo: três de 3 s e três de 4 s, 21 s no total. Os limites são acumulados, não sextos iguais. */
const STARTS = [0, 3000, 6000, 9000, 13000, 17000];
const TOTAL = 21000;

const FRAMES = [
  { short: 'Já morto', label: 'Jesus já morto, a lança ainda baixa', at: '0% 0%', text: 'Os soldados chegam a Jesus e veem que já está morto; por isso não lhe quebram as pernas (Jo 19.33). Ele permanece imóvel em toda a sequência, e a lança ainda está baixa.' },
  { short: 'A lança sobe', label: 'O soldado ergue a lança', at: '100% 0%', text: 'Um dos soldados ergue a lança. O gesto vem depois da morte, como João registra (Jo 19.34).' },
  { short: 'O contato', label: 'Contato no flanco, em parte encoberto pelo ângulo', at: '0% 50%', text: 'O soldado fere o lado de Jesus. O ângulo da imagem encobre parte do contato, e a reconstituição não mostra o trajeto da lança por dentro do corpo.' },
  { short: 'Os líquidos', label: 'Lança recolhida; os líquidos começam no mesmo ponto', at: '100% 50%', text: 'A lança é recolhida. No mesmo ponto do flanco começam a aparecer os líquidos de que João fala.' },
  { short: 'Sangue e água', label: 'Sangue e um fio claro descem pelo flanco', at: '0% 100%', text: 'Sangue e um fio claro, como de água, descem pelo flanco: “logo saiu sangue e água” (Jo 19.34). A imagem escolhe uma intensidade; o texto não a mede.' },
  { short: 'No pano', label: 'Os líquidos chegam ao pano, com gotas na borda', at: '100% 100%', text: 'Os líquidos chegam ao pano e formam gotas na borda. João dá o fato como testemunho de quem viu (Jo 19.35), e não como laudo médico.' },
];

/** Seis imagens-chave de João 19.33–34 com pausa exata; o GIF fica só para baixar. A figura e a ampliação leem o mesmo relógio. */
@Component({
  selector: 'app-passion-spear',
  template: `
    <section class="spear-scene" aria-label="A lança, depois da morte">
      <header>
        <span class="eyebrow">RECONSTITUIÇÃO · SEIS IMAGENS-CHAVE</span>
        <h3>A lança, depois da morte</h3>
      </header>
      <div #viewport class="film" [style.background-image]="sheet" [style.background-position]="frame().at" role="img" [attr.aria-label]="'A lança, depois da morte, quadro ' + (index() + 1) + ' de 6: ' + frame().label">
        <span class="caption">{{ index() + 1 }} / 6 · {{ frame().short }}</span>
      </div>
      <div class="controls">
        <button type="button" class="play" [attr.aria-pressed]="playback.playing()" (click)="playback.toggle()">{{ playback.playing() ? 'Pausar cena' : 'Reproduzir cena' }}</button>
        <button type="button" (click)="playback.restart()">Recomeçar cena</button>
        <button #enlargeButton type="button" (click)="openDialog(enlargeButton)">Ampliar cena</button>
        <a [href]="gif" download="paixao-anatomia-lanca-agua-sangue-v6.gif">Baixar GIF</a>
      </div>
      <div class="frames" role="group" aria-label="Escolher quadro da cena">
        @for (f of frames; track f.short; let i = $index) {
          <button type="button" [attr.aria-pressed]="index() === i" (click)="select(i)"><span aria-hidden="true">{{ i + 1 }}</span>{{ f.short }}</button>
        }
      </div>
      <p class="explanation" [attr.aria-live]="playback.playing() ? 'off' : 'polite'">{{ frame().text }}</p>
      <p class="reference">Jo 19.31–37 · Mc 15.44–45</p>
      <p class="note">Reconstituição artística de João 19.33–34 em seis momentos. Jesus já estava morto antes da lança. Alturas, aparência, ponto ilustrado e intensidade dos líquidos são escolhas de reconstrução, não medições do acontecimento.</p>
      <p class="note">Seis imagens-chave geradas por IA, e não um vídeo contínuo: cada quadro dura 3 ou 4 segundos, tempo didático. A sequência se repete enquanto estiver à vista e para quando a aba fica em segundo plano ou o movimento reduzido está ligado.</p>
      <dialog #dialog class="spear-dialog" aria-label="Cena ampliada: A lança, depois da morte" (close)="restoreFocus()">
        <div class="dialog-heading"><strong>A lança, depois da morte</strong><button type="button" (click)="dialog.close()">Fechar <span aria-hidden="true">×</span></button></div>
        <div class="film big" [style.background-image]="sheet" [style.background-position]="frame().at" role="img" [attr.aria-label]="'Cena ampliada, quadro ' + (index() + 1) + ' de 6: ' + frame().label">
          <span class="caption">{{ index() + 1 }} / 6 · {{ frame().short }}</span>
        </div>
        <div class="controls">
          <button type="button" class="play" [attr.aria-pressed]="playback.playing()" (click)="playback.toggle()">{{ playback.playing() ? 'Pausar cena' : 'Reproduzir cena' }}</button>
          <button type="button" (click)="playback.restart()">Recomeçar cena</button>
        </div>
        <div class="frames" role="group" aria-label="Escolher quadro da cena ampliada">
          @for (f of frames; track f.short; let i = $index) {
            <button type="button" [attr.aria-pressed]="index() === i" (click)="select(i)"><span aria-hidden="true">{{ i + 1 }}</span>{{ f.short }}</button>
          }
        </div>
        <p class="explanation" [attr.aria-live]="playback.playing() ? 'off' : 'polite'">{{ frame().text }}</p>
      </dialog>
    </section>
  `,
  styleUrl: './passion-spear.scss',
})
export class PassionSpear {
  protected readonly sheet = SHEET;
  protected readonly gif = GIF;
  protected readonly frames = FRAMES;
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  protected readonly playback = passionPlayback(() => this.viewport()?.nativeElement, () => TOTAL);
  /** Quadro atual, pelos limites acumulados em milissegundos. */
  protected readonly index = computed(() => {
    const t = this.playback.progress() * TOTAL;
    let current = 0;
    for (let i = 0; i < STARTS.length; i++) if (t >= STARTS[i]) current = i;
    return current;
  });
  protected readonly frame = computed(() => FRAMES[this.index()]);
  private returnFocus?: HTMLElement;

  /** Pausa e mostra o quadro escolhido; 200 ms depois do início dele para cair dentro do quadro. */
  protected select(i: number): void {
    this.playback.seek((STARTS[i] + 200) / TOTAL);
  }

  protected openDialog(button: HTMLElement): void {
    this.returnFocus = button;
    this.dialog()?.nativeElement.showModal();
  }

  protected restoreFocus(): void {
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
  }
}
