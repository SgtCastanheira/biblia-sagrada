import { Component, ElementRef, computed, input, viewChild } from '@angular/core';
import { passionPlayback } from './passion-playback';

type StoryKind = 'malco' | 'anas' | 'rosto' | 'chicote' | 'coroa';
const STORIES = {
  coroa: { title: 'Uma coroa usada para zombar', image: 'paixao-anatomia-coroa-cinema.webp', ref: 'Mt 27.29–30 · Jo 19.2–3', phases: ['Coroa de espinhos'], lines: ['Ramos entrelaçados, suor e marcas superficiais compõem esta reconstituição cinematográfica da coroa de espinhos.'] },
  malco: { title: 'A espada é interrompida; a orelha é curada', image: 'paixao-anatomia-malco-cenas.webp', ref: 'Jo 18.10–11 · Lc 22.50–51', phases: ['Pedro avança', 'Malco é ferido', 'Jesus interrompe', 'Jesus toca e cura'], lines: ['João identifica Pedro, a espada e o servo Malco.', 'O relato diz que a orelha direita foi cortada. A imagem evita um detalhe gráfico do ferimento.', 'Jesus interrompe a reação armada.', 'Lucas descreve Jesus tocando a orelha e curando-a; não relata uma cirurgia de recolocação.'] },
  anas: { title: 'Diante de Anás: a pergunta e a bofetada', image: 'paixao-anatomia-anas-cenas-v2.webp', ref: 'Jo 18.19–24', phases: ['A resposta', 'O guarda avança', 'A bofetada', 'Por que me feres?'], lines: ['Jesus responde que ensinou publicamente e pede que interroguem os que o ouviram.', 'Um guarda reage à resposta de Jesus.', 'João registra uma bofetada durante o interrogatório.', 'Jesus pede que demonstrem o mal, se falou mal; se falou bem, pergunta por que é ferido.'] },
  rosto: { title: 'O rosto coberto e a zombaria', image: 'paixao-anatomia-rosto-cenas.webp', ref: 'Mc 14.65 · Lc 22.63–65', phases: ['O rosto é coberto', 'Sem poder ver', 'A zombaria', 'A dignidade ferida'], lines: ['Marcos descreve que cobrem o rosto de Jesus.', 'A vulnerabilidade faz parte da agressão narrada.', 'A exigência de profetizar acompanha os golpes e o escárnio.', 'Esta cena visualiza o relato dos guardas, sem atribuir culpa coletiva a um povo nem impor a sequência de João a Marcos e Lucas.'] },
  chicote: { title: 'O instrumento do açoite', image: 'paixao-anatomia-chicote-v2.webp', ref: 'Jo 19.1 · Mc 15.15 · Mt 27.26', phases: ['Modelo ilustrativo'], lines: ['Os Evangelhos afirmam a flagelação, sem identificar o instrumento. A reconstrução tradicional do açoite romano, o flagrum, imagina tiras de couro rematadas por ossículos, chumbo e ganchos de metal. É uma representação aproximada, e o objeto usado em Jesus não foi identificado.'] },
};

@Component({
  selector: 'app-passion-story',
  template: `
    <section class="story" [attr.aria-label]="story().title">
      <header><span class="eyebrow">RECONSTITUIÇÃO VISUAL · RELATO E IMAGEM</span><h3>{{ story().title }}</h3></header>
      @if ((kind() === 'chicote' || kind() === 'coroa')) {
        <img class="object-image" [src]="'conteudo/imagens/' + story().image" [alt]="kind() === 'chicote' ? 'Reconstrução ilustrativa de um açoite romano, com cabo de madeira, tiras de couro e pontas com pesos metálicos e ossículos.' : 'Reconstituição artística de Jesus com uma coroa de ramos espinhosos sobre os cabelos.'" loading="lazy" decoding="async" />
      } @else {
        <div #viewport class="film" [class.single-frame]="correctedMalco()" [style.background-image]="'url(conteudo/imagens/' + frameImage() + ')'" [style.background-position]="position()" role="img" [attr.aria-label]="story().title + ': ' + story().phases[phase()]"><span>{{ phase() + 1 }} / 4 · {{ story().phases[phase()] }}</span></div>
        <div class="controls"><button type="button" (click)="playback.toggle()">{{ playback.playing() ? 'Pausar cena' : 'Reproduzir cena' }}</button><button type="button" (click)="playback.restart()">Recomeçar cena</button><small>Quatro imagens-chave · repetição didática</small></div>
        <div class="phases" role="group" aria-label="Escolher momento da cena">@for (label of story().phases; track label; let i = $index) { <button type="button" [attr.aria-pressed]="phase() === i" (click)="playback.seek((i + .15) / 4)">{{ label }}</button> }</div>
      }
      <p class="explanation" [attr.aria-live]="playback.playing() ? 'off' : 'polite'">{{ story().lines[phase()] }}</p>
      <small class="ref">{{ story().ref }}</small>
      @if (kind() === 'chicote') { <a class="source" href="https://iris.unito.it/handle/2318/1647176" target="_blank" rel="noopener noreferrer">Andrea Nicolotti · estudo histórico do açoite ↗</a> }
      <p class="note">Ilustração gerada por IA. Aparência das pessoas, objetos e composição são escolhas de reconstituição, não fotografias dos acontecimentos.</p>
    </section>
  `,
  styleUrl: './passion-story.scss',
})
export class PassionStory {
  readonly kind = input.required<StoryKind>();
  private readonly viewport = viewChild<ElementRef<HTMLElement>>('viewport');
  protected readonly playback = passionPlayback(() => this.viewport()?.nativeElement, () => 16000);
  protected readonly story = computed(() => STORIES[this.kind()]);
  protected readonly phase = computed(() => (this.kind() === 'chicote' || this.kind() === 'coroa') ? 0 : Math.min(3, Math.floor(this.playback.progress() * 4)));
  protected readonly correctedMalco = computed(() => this.kind() === 'malco' && this.phase() === 3);
  protected readonly frameImage = computed(() => this.correctedMalco() ? 'paixao-anatomia-malco-cura-v2.webp' : this.story().image);
  protected readonly position = computed(() => this.correctedMalco() ? 'center' : ['0% 0%', '100% 0%', '0% 100%', '100% 100%'][this.phase()]);
}
