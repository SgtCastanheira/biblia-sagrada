import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, shareReplay } from 'rxjs';
import { AD_STATES } from './ad-states';
import { ContentService } from './content.service';
import { CURIOSITIES } from './curiosities';
import { EPOCHS, epochOfYear, WORLD_TIMELINE } from './epochs';
import { ARTICLES, CLASSIC_SERMONS } from './library';
import { plainText, prepare, SearchDoc } from './study-search';

/**
 * O índice da busca do Estudo. É montado uma vez, na primeira busca, com os textos que o app já guarda
 * para ler sem internet (artigos, estados, sermões e os arquivos de estudo).
 */
@Injectable({ providedIn: 'root' })
export class StudySearchService {
  private readonly content = inject(ContentService);

  readonly index: Observable<ReturnType<typeof prepare>> = this.build().pipe(shareReplay(1));

  private text(path: string): Observable<string> {
    return this.content.text(path).pipe(map((t) => plainText(t ?? '')), catchError(() => of('')));
  }

  private build(): Observable<ReturnType<typeof prepare>> {
    const articles = forkJoin(ARTICLES.map((a) => this.text(`artigos/${a.id}.md`)));
    const states = forkJoin(AD_STATES.map((s) => this.text(`ad-estados/${s.id}.md`)));
    const sermons = forkJoin(CLASSIC_SERMONS.map((s) => this.text(`sermoes/${s.id}.md`)));
    return forkJoin({
      articles, states, sermons,
      people: this.content.memorial, words: this.content.dictionary, prophecies: this.content.prophecies, harpa: this.content.harpa,
    }).pipe(
      map((d) => {
        const docs: SearchDoc[] = [];
        ARTICLES.forEach((a, i) => docs.push({ kind: 'historia', id: a.id, title: a.title, subtitle: a.period, link: `/artigo/${a.id}`, body: `${a.subtitle}. ${d.articles[i]}` }));
        AD_STATES.forEach((s, i) => docs.push({ kind: 'estado', id: s.id, title: `Assembleia de Deus em ${s.state}`, subtitle: `${s.year} · ${s.city}`, link: `/assembleia-de-deus/${s.id}`, body: `${s.summary} ${s.origin} ${d.states[i]}` }));
        CLASSIC_SERMONS.forEach((s, i) => docs.push({ kind: 'sermao', id: s.id, title: s.title, subtitle: `${s.preacher} · ${s.year}`, link: `/avivamento/${s.id}`, body: `${s.bio} ${s.context} ${d.sermons[i]}` }));
        for (const p of d.people) docs.push({ kind: 'personagem', id: p.id, title: p.name, subtitle: p.title, link: `/memorial/${p.id}`, body: `${p.summary} ${p.legacy ?? ''} ${(p.facts ?? []).map((f) => f.join(' ')).join(' ')}` });
        for (const w of d.words) docs.push({ kind: 'dicionario', id: w.id, title: w.term, subtitle: w.original?.map((o) => o.translit).join(', '), link: `/dicionario/${w.id}`, body: `${w.definition} ${(w.forms ?? []).join(' ')}` });
        for (const p of d.prophecies) docs.push({ kind: 'profecia', id: p.id, title: p.title, subtitle: p.ref, link: `/profecias/${p.id}`, body: `${p.given} ${p.context} ${p.explanation} ${p.fulfillment.map((f) => f.text).join(' ')}` });
        for (const c of CURIOSITIES) docs.push({ kind: 'curiosidade', id: c.id, title: c.question, subtitle: c.topic, link: `/curiosidades/${c.id}`, body: `${c.answer} ${c.body.join(' ')} ${(c.points ?? []).map((x) => x.text).join(' ')}` });
        for (const h of d.harpa.hymns) docs.push({ kind: 'hino', id: String(h.n), title: `${h.n}. ${h.title}`, subtitle: h.author, link: `/harpa/${h.n}`, body: plainText(h.origin ? `${h.origin.title} ${h.origin.author} ${h.origin.story}` : '') });
        for (const e of EPOCHS) docs.push({ kind: 'epoca', id: e.id, title: e.name, subtitle: e.period, link: `/epocas/${e.id}`, body: e.summary });
        for (const v of WORLD_TIMELINE) docs.push({ kind: 'fato', id: v.id, title: v.title, subtitle: v.when, link: `/epocas/${epochOfYear(v.from).id}`, body: v.text });
        return prepare(docs);
      }),
    );
  }
}
