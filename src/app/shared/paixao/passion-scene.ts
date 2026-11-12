import { Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { LESSONS, PLATES } from './passion-anatomy';
import { PassionBlood } from './passion-blood';
import { PassionImpact } from './passion-impact';
import { PassionThorax } from './passion-thorax';
import { PassionNeuro } from './passion-neuro';

type Kind = 'percurso' | 'corpo' | 'ferimentos' | 'morte';

@Component({
  selector: 'app-passion-scene',
  imports: [PassionBlood, PassionImpact, PassionThorax, PassionNeuro],
  template: `
    <section class="experience" [class.journey]="kind() === 'percurso'" [attr.aria-label]="heading()">
      <header class="panel-header">
        <div class="eyebrow">{{ kind() === 'percurso' ? 'DA CEIA À RESSURREIÇÃO' : 'ANATOMIA DA PAIXÃO' }}</div>
        @if (kind() !== 'percurso') { <h3>{{ heading() }}</h3> }
        <p class="intro">{{ kind() === 'percurso' ? 'Da ceia ao sepulcro aberto.' : 'Observe a estrutura. Acompanhe o mecanismo. Compreenda o que o corpo pode sofrer.' }}</p>
      </header>
      @if (kind() === 'percurso') {
        <div class="journey-art">
          <img src="conteudo/imagens/paixao-getsemani.webp" alt="Reconstituição artística de Jesus em oração no Getsêmani, com os discípulos entre as oliveiras." loading="lazy" decoding="async" width="1536" height="1024" />
        </div>
      } @else {
        @if (kind() === 'ferimentos') { <app-passion-impact /> }
        <div class="lens-picker" role="group" aria-label="Explorar as explicações desta cena">
          @for (l of lessons(); track l.label; let i = $index) {
            <button type="button" [attr.aria-pressed]="selected() === i" (click)="selectLesson(i)"><span aria-hidden="true">{{ (i + 1).toString().padStart(2, '0') }}</span>{{ l.label }}</button>
          }
        </div>
        <div class="anatomy-layout" [class.landscape]="lesson().plate === 'pele'">
          <div class="atlas">
            <div class="plate-heading"><span>PRANCHA {{ plateNumber() }}</span><span>{{ plate().subtitle }}</span></div>
            <div class="plate-image">
              <img [src]="'conteudo/imagens/' + plate().image" [alt]="plate().alt" loading="lazy" decoding="async" />
              @if (lesson().plate === 'neuro') { <app-passion-neuro [playing]="bloodPlaying()" /> }
              @if (lesson().plate === 'pele') { <app-passion-blood [playing]="bloodPlaying()" [bleeding]="kind() === 'ferimentos'" /> }
              @if (lesson().plate === 'torax' && selected() !== 2) { <app-passion-thorax [playing]="bloodPlaying()" /> }
              @for (point of plate().structures; track point.name; let i = $index) {
                <button type="button" class="hotspot" [style.left.%]="point.x" [style.top.%]="point.y" [attr.aria-label]="'Explorar ' + point.name" [attr.aria-pressed]="focusIndex() === i" [title]="point.name" (click)="focused.set(i)">{{ i + 1 }}</button>
              }
            </div>
            @if (animatedPlate()) {
              <div class="blood-controls"><button type="button" [attr.aria-pressed]="bloodPlaying()" (click)="bloodPlaying.set(!bloodPlaying())">{{ bloodPlaying() ? 'Pausar animação' : 'Ativar animação' }}</button><span>{{ animationCaption() }}</span></div>
            }
            <div class="plate-caption"><strong>{{ plate().title }}</strong><span>Selecione os pontos numerados para explorar.</span></div>
            <button type="button" class="enlarge" (click)="openAtlas()">Ampliar prancha <span aria-hidden="true">↗</span></button>
            <div class="structure-picker" role="group" aria-label="Estruturas da prancha">
              @for (point of plate().structures; track point.name; let i = $index) {
                <button type="button" [attr.aria-pressed]="focusIndex() === i" (click)="focused.set(i)"><span>{{ i + 1 }}</span>{{ point.name }}</button>
              }
            </div>
            <div class="structure-detail" aria-live="polite"><span class="structure-index">{{ focusIndex() + 1 }}</span><div><strong>{{ structure().name }}</strong><p>{{ structure().detail }}</p></div></div>
            <p class="plate-note">Ilustração anatômica gerada por IA para esta aula. Modelo genérico, com escala didática; não representa um exame de Jesus.</p>
            <a class="plate-source" [href]="plate().sourceUrl" target="_blank" rel="noopener noreferrer">{{ plate().source }} <span aria-hidden="true">↗</span></a>
          </div>
          <div class="lesson-copy" aria-live="polite">
            <span class="section-label">MECANISMO {{ (selected() + 1).toString().padStart(2, '0') }}</span>
            <h4>{{ lesson().title }}</h4>
            <p>{{ lesson().mechanism }}</p>
            @if (lesson().plate === 'torax' && selected() !== 2) { <p class="physiology-explainer">A animação mostra fisiologia normal: contração e relaxamento cardíacos, expansão pulmonar e movimento do diafragma. É um modelo de funcionamento, sem reproduzir os sinais vitais de Jesus.</p> }
            <ol class="mechanism-flow" aria-label="Sequência do mecanismo">
              @for (step of lesson().steps; track step; let i = $index) { <li><span>{{ (i + 1).toString().padStart(2, '0') }}</span>{{ step }}</li> }
            </ol>
            <div class="clinical"><span class="section-label">O QUE ISSO AJUDA A COMPREENDER</span><p>{{ lesson().consequence }}</p></div>
            <details [open]="kind() === 'morte' && selected() === 2"><summary>Relação com o relato e limites</summary><p>{{ lesson().limit }}</p><small>{{ lesson().ref }}</small></details>
            <a class="source" [href]="lesson().sourceUrl" [attr.target]="lesson().sourceUrl.startsWith('https:') ? '_blank' : null" rel="noopener noreferrer">{{ lesson().source }} <span aria-hidden="true">↗</span></a>
            @if (lesson().plate === 'neuro') { <a class="source" href="https://openstax.org/books/anatomy-and-physiology-2e/pages/13-3-circulation-and-the-central-nervous-system" target="_blank" rel="noopener noreferrer">Circulação cerebral · OpenStax, 13.3 ↗</a> }
            @if (lesson().plate === 'torax' && selected() !== 2) { <a class="source" href="https://openstax.org/books/anatomy-and-physiology-2e/pages/19-3-cardiac-cycle" target="_blank" rel="noopener noreferrer">Ciclo cardíaco · OpenStax, 19.3 ↗</a> }
          </div>
        </div>
        <dialog #atlasDialog class="atlas-dialog" [attr.aria-label]="'Prancha ampliada: ' + plate().title">
          <div class="dialog-heading"><strong>{{ plate().title }}</strong><button type="button" (click)="atlasDialog.close()">Fechar <span aria-hidden="true">×</span></button></div>
          @if (animatedPlate()) {
            <div class="blood-controls"><button type="button" [attr.aria-pressed]="bloodPlaying()" (click)="bloodPlaying.set(!bloodPlaying())">{{ bloodPlaying() ? 'Pausar animação' : 'Ativar animação' }}</button><span>{{ animationCaption() }}</span></div>
          }
          <div class="plate-image">
            <img [src]="'conteudo/imagens/' + plate().image" [alt]="plate().alt" loading="lazy" decoding="async" />
            @if (lesson().plate === 'neuro') { <app-passion-neuro [playing]="bloodPlaying()" /> }
              @if (lesson().plate === 'pele') { <app-passion-blood [playing]="bloodPlaying()" [bleeding]="kind() === 'ferimentos'" /> }
              @if (lesson().plate === 'torax' && selected() !== 2) { <app-passion-thorax [playing]="bloodPlaying()" /> }
            @for (point of plate().structures; track point.name; let i = $index) {
              <button type="button" class="hotspot" [style.left.%]="point.x" [style.top.%]="point.y" [attr.aria-label]="'Explorar ' + point.name" [attr.aria-pressed]="focusIndex() === i" (click)="focused.set(i)">{{ i + 1 }}</button>
            }
          </div>
          <div class="structure-detail" aria-live="polite"><span class="structure-index">{{ focusIndex() + 1 }}</span><div><strong>{{ structure().name }}</strong><p>{{ structure().detail }}</p></div></div>
        </dialog>
      }
    </section>
  `,
  styleUrl: './passion-scene.scss',
})
export class PassionScene {
  readonly kind = input.required<Kind>();
  protected readonly selected = signal(0);
  protected readonly focused = signal<number | null>(null);
  protected readonly bloodPlaying = signal(typeof matchMedia !== 'undefined' && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  private readonly atlasDialog = viewChild<ElementRef<HTMLDialogElement>>('atlasDialog');
  protected readonly heading = computed(() => ({ percurso: 'Da Ceia à Ressurreição', corpo: 'O corpo diante da angústia', ferimentos: 'O trauma, camada por camada', morte: 'Circulação, respiração e morte' })[this.kind()]);
  protected readonly lessons = computed(() => LESSONS[this.kind() === 'percurso' ? 'corpo' : this.kind() as Exclude<Kind, 'percurso'>]);
  protected readonly lesson = computed(() => this.lessons()[this.selected()] ?? this.lessons()[0]);
  protected readonly plate = computed(() => {
    const plate = PLATES[this.lesson().plate];
    return this.kind() === 'ferimentos' ? { ...plate, image: 'paixao-anatomia-pele-v2.webp' } : plate;
  });
  protected readonly animatedPlate = computed(() => this.lesson().plate === 'neuro' || this.lesson().plate === 'pele' || (this.lesson().plate === 'torax' && this.selected() !== 2));
  protected readonly animationCaption = computed(() => this.lesson().plate === 'neuro' ? 'Circulação cerebral e impulsos nervosos · ritmos ilustrativos' : this.lesson().plate === 'pele' ? this.kind() === 'ferimentos' ? 'Circulação e sangramento ilustrativos · sem escala clínica' : 'Circulação nos vasos · não representa sangue no suor' : 'Coração, pulmões e diafragma · fisiologia normal, movimentos ampliados');
  protected readonly plateNumber = computed(() => ({ neuro: '01', pele: '02', torax: '03' })[this.lesson().plate]);
  protected readonly focusIndex = computed(() => this.focused() ?? this.lesson().focus);
  protected readonly structure = computed(() => this.plate().structures[this.focusIndex()] ?? this.plate().structures[0]);
  protected selectLesson(index: number): void {
    this.selected.set(index);
    this.focused.set(this.lesson().focus);
  }
  protected openAtlas(): void {
    this.atlasDialog()?.nativeElement.showModal();
  }
}
