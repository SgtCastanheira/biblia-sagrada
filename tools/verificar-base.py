#!/usr/bin/env python3
"""
Confere a base do app ANTES de escrever algo novo.

Regra do projeto: antes de escrever uma história, um personagem ou um assunto, ver o que o app já conta. Se já existe,
completa-se ou ramifica-se; não se conta de novo, em outro formato e resumido, para não deixar o leitor confuso.

Uso (a partir da raiz do projeto, só biblioteca padrão do Python 3):
    python3 tools/verificar-base.py "Coreia do Norte"            # onde o assunto já aparece, e se já há estudo dele
    python3 tools/verificar-base.py "Neemias" "Esdras" "Macabeus" # vários assuntos de uma vez
    python3 tools/verificar-base.py --ler avivamento-da-coreia   # o roteiro de um estudo: tópicos, cartões e fontes
    python3 tools/verificar-base.py --repetidos                  # revisão geral: trechos repetidos entre estudos
    python3 tools/verificar-base.py --repetidos --minimo 6       # só pares com pelo menos 6 trechos iguais
    python3 tools/verificar-base.py --par estudo-a estudo-b      # os trechos que dois estudos têm em comum

O veredito diz uma de três coisas: “já existe estudo dedicado” (complete ou ramifique), “aparece de passagem” (veja
onde e escreva só o que falta) ou “não aparece” (pode escrever, ligando aos estudos vizinhos).
"""
import glob
import json
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(RAIZ, 'public', 'conteudo')


def dobra(s):
    """Minúsculas e sem acentos, para “Nicéia” e “niceia” serem a mesma coisa."""
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


def ler(p):
    with open(p, encoding='utf8') as f:
        return f.read()


def limpar_md(t):
    t = re.sub(r'^:::[a-z-]+.*$', ' ', t, flags=re.M)
    t = re.sub(r'^:::$', ' ', t, flags=re.M)
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', ' ', t)
    t = re.sub(r'\[\[([^\]|]+)\|([^\]]+)\]\]', r'\2', t)
    t = re.sub(r'\[\[([^\]]+)\]\]', r'\1', t)
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)
    t = re.sub(r'[*_`>#|]', ' ', t)
    return re.sub(r'\s+', ' ', t)


def entradas_biblioteca():
    """id -> {titulo, subtitulo, topicos, periodo} lidos de core/library.ts."""
    lib = ler(os.path.join(RAIZ, 'src', 'app', 'core', 'library.ts'))
    out = {}
    for m in re.finditer(r"\n  \{\n    id: '([^']+)',(.*?)\n  \},", lib, re.S):
        b = m.group(2)
        tit = re.search(r"title: '((?:[^'\\]|\\.)*)'", b)
        sub = re.search(r"subtitle: '((?:[^'\\]|\\.)*)'", b)
        top = re.search(r"topics: \[(.*?)\]", b, re.S)
        per = re.search(r"period: '([^']*)'", b)
        out[m.group(1)] = {
            'titulo': tit.group(1).replace("\\'", "'") if tit else m.group(1),
            'subtitulo': sub.group(1).replace("\\'", "'") if sub else '',
            'topicos': re.findall(r"'((?:[^'\\]|\\.)*)'", top.group(1)) if top else [],
            'periodo': per.group(1) if per else '',
        }
    return out


def carregar():
    """Todos os textos da base, cada um com tipo, id, título e corpo."""
    docs = []
    lib = entradas_biblioteca()
    for f in sorted(glob.glob(os.path.join(C, 'artigos', '*.md'))):
        i = os.path.basename(f)[:-3]
        m = lib.get(i, {'titulo': i, 'subtitulo': '', 'topicos': [], 'periodo': ''})
        corpo = ler(f)
        docs.append({'tipo': 'História', 'id': i, 'titulo': m['titulo'], 'extra': ' '.join([m['subtitulo']] + m['topicos']), 'corpo': corpo, 'rota': f'/artigo/{i}'})
    for f in sorted(glob.glob(os.path.join(C, 'ad-estados', '*.md'))):
        i = os.path.basename(f)[:-3]
        docs.append({'tipo': 'Estado da AD', 'id': i, 'titulo': f'Assembleia de Deus: {i.upper()}', 'extra': '', 'corpo': ler(f), 'rota': f'/assembleia-de-deus/{i}'})
    for f in sorted(glob.glob(os.path.join(C, 'sermoes', '*.md'))):
        i = os.path.basename(f)[:-3]
        docs.append({'tipo': 'Sermão', 'id': i, 'titulo': i, 'extra': '', 'corpo': ler(f), 'rota': f'/sermoes/{i}'})
    for p in json.load(open(os.path.join(C, 'memorial.json'), encoding='utf8')):
        docs.append({'tipo': 'Personagem', 'id': p['id'], 'titulo': f"{p['name']}, {p.get('title', '')}", 'extra': p.get('summary', ''), 'corpo': json.dumps(p, ensure_ascii=False), 'rota': f"/memorial/{p['id']}"})
    for p in json.load(open(os.path.join(C, 'dicionario.json'), encoding='utf8')):
        docs.append({'tipo': 'Dicionário', 'id': p['id'], 'titulo': p['term'], 'extra': '', 'corpo': json.dumps(p, ensure_ascii=False), 'rota': f"/dicionario/{p['id']}"})
    for p in json.load(open(os.path.join(C, 'profecias.json'), encoding='utf8')):
        docs.append({'tipo': 'Profecia', 'id': p['id'], 'titulo': p['title'], 'extra': '', 'corpo': json.dumps(p, ensure_ascii=False), 'rota': f"/profecias/{p['id']}"})
    for nome, tipo, rota in [('curiosities.ts', 'Você sabia?', '/curiosidades'), ('world-events.ts', 'Fato do mundo', '/epocas'), ('ad-context.ts', 'Fato do mundo (AD)', '/epocas'), ('anniversaries.ts', 'Data da história', '/datas'), ('genealogy.ts', 'Genealogia', '/genealogia'), ('relations.ts', 'Relações', '/memorial')]:
        p = os.path.join(RAIZ, 'src', 'app', 'core', nome)
        if os.path.exists(p):
            docs.append({'tipo': tipo, 'id': nome, 'titulo': nome, 'extra': '', 'corpo': ler(p), 'rota': rota})
    return docs


def ocorrencias(corpo, termo):
    return len(re.findall(re.escape(dobra(termo)), dobra(corpo)))


def verificar(termos):
    docs = carregar()
    for termo in termos:
        print(f"\n=== {termo} ===")
        achados = []
        for d in docs:
            n = ocorrencias(d['corpo'], termo)
            no_titulo = dobra(termo) in dobra(d['titulo'])
            nos_topicos = dobra(termo) in dobra(d['extra'])
            if n or no_titulo or nos_topicos:
                achados.append((d, n, no_titulo, nos_topicos))
        dedicados = [a for a in achados if a[2] or a[3]]
        for d, n, t, e in sorted(achados, key=lambda a: (not (a[2] or a[3]), -a[1])):
            marca = '★' if t else ('☆' if e else ' ')
            print(f"  {marca} {d['tipo']:<18} {n:>3}x  {d['titulo'][:70]}  [{d['rota']}]")
            if d['tipo'] == 'História':
                heads = [h for h in re.findall(r'^#{2,3} (.+)$', d['corpo'], re.M) if dobra(termo) in dobra(h)]
                for h in heads[:3]:
                    print(f"        # {h[:90]}")
        if not achados:
            print('  VEREDITO: não aparece. Pode escrever, ligando aos estudos vizinhos (veja as trilhas em src/app/core/trails.ts).')
        elif dedicados:
            ids = ', '.join(f"{a[0]['tipo'].lower()} {a[0]['id']}" for a in dedicados[:4])
            print(f"  VEREDITO: já existe estudo dedicado ({ids}). Leia (--ler) e complete ou ramifique; não conte de novo.")
        else:
            print(f"  VEREDITO: aparece de passagem em {len(achados)} lugares. Veja onde e escreva só o que falta, com cartão para os que já tocam no assunto.")
    print('\n★ no título  ☆ no subtítulo ou nos tópicos  (o número é a contagem no texto)')


def roteiro(i):
    f = os.path.join(C, 'artigos', i + '.md')
    if not os.path.exists(f):
        print('Sem estudo com esse id.')
        return
    lib = entradas_biblioteca().get(i, {})
    t = ler(f)
    print(f"{lib.get('titulo', i)}  ({len(t.split())} palavras, {lib.get('periodo', '')})")
    print(lib.get('subtitulo', ''))
    for l in t.split('\n'):
        if re.match(r'^#{2,3} ', l):
            print('  ' + l)
        elif l.startswith(':::leia'):
            print('     → cartão para ' + l[8:].strip())
        elif l.startswith(':::ficha') or l.startswith(':::tempo') or l.startswith(':::pessoas') or l.startswith(':::cena'):
            print('     [' + l[3:].strip()[:60] + ']')


def repetidos(minimo):
    """Pares de estudos com trechos iguais ou quase: sequências de 9 palavras que aparecem nos dois."""
    docs = [d for d in carregar() if d['tipo'] in ('História', 'Estado da AD')]
    K = 9
    indice = {}
    for d in docs:
        pal = dobra(limpar_md(d['corpo'])).split()
        d['gr'] = {' '.join(pal[i:i + K]) for i in range(0, max(0, len(pal) - K + 1))}
        for g in d['gr']:
            indice.setdefault(g, set()).add(d['id'])
    pares = {}
    for g, ids in indice.items():
        if 1 < len(ids) <= 3:
            ids = sorted(ids)
            for a in range(len(ids)):
                for b in range(a + 1, len(ids)):
                    pares[(ids[a], ids[b])] = pares.get((ids[a], ids[b]), 0) + 1
    por_id = {d['id']: d for d in docs}
    saida = sorted(((n, a, b) for (a, b), n in pares.items() if n >= minimo), reverse=True)
    print(f'{len(saida)} pares de estudos com {minimo} ou mais trechos de {K} palavras iguais:\n')
    for n, a, b in saida[:60]:
        print(f"{n:>4}  {a}  ×  {b}")
    return saida


def par(a, b):
    """Mostra os trechos que dois estudos têm em comum (a sequência inteira de palavras iguais, não só 9)."""
    K = 9
    docs = {d['id']: d for d in carregar() if d['tipo'] in ('História', 'Estado da AD')}
    if a not in docs or b not in docs:
        print('Estudo não encontrado:', a if a not in docs else b)
        return
    pa = dobra(limpar_md(docs[a]['corpo'])).split()
    pb = dobra(limpar_md(docs[b]['corpo'])).split()
    gb = {' '.join(pb[i:i + K]) for i in range(0, max(0, len(pb) - K + 1))}
    marca = [False] * len(pa)
    for i in range(0, max(0, len(pa) - K + 1)):
        if ' '.join(pa[i:i + K]) in gb:
            for j in range(i, i + K):
                marca[j] = True
    trechos, atual = [], []
    for w, m in zip(pa, marca):
        if m:
            atual.append(w)
        elif atual:
            trechos.append(' '.join(atual))
            atual = []
    if atual:
        trechos.append(' '.join(atual))
    print(f'{a} × {b}: {len(trechos)} trechos em comum\n')
    for t in trechos[:25]:
        print('  · ' + (t if len(t) < 220 else t[:217] + '…'))


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help'):
        print(__doc__)
    elif args[0] == '--par' and len(args) > 2:
        par(args[1], args[2])
    elif args[0] == '--ler' and len(args) > 1:
        roteiro(args[1])
    elif args[0] == '--repetidos':
        m = 3
        if '--minimo' in args:
            m = int(args[args.index('--minimo') + 1])
        repetidos(m)
    else:
        verificar(args)
