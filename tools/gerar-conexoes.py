"""
Gera public/bible/conexoes.json: as ligações entre os capítulos da Bíblia, para a tela “A Bíblia Conectada”.

Parte das referências cruzadas que o leitor já embute (public/bible/referencias/LIVRO.json, da OpenBible.info, CC BY,
https://www.openbible.info/labs/cross-references/). Cada par de capítulos diferentes vira uma ligação, com a quantidade de
referências entre eles, contando os dois sentidos. Um trecho que passa de um capítulo a outro fica no capítulo em que começa.

Os capítulos são numerados de 0 (Gênesis 1) a 1188 (Apocalipse 22), na ordem da Bíblia. As contagens de capítulos vêm da Bíblia
embutida (public/bible/almeida): o teste logica/conexoes.spec.ts confere que batem com a lista de livros do app.

Formato: {"versao": 1, "fonte": "...", "capitulos": 1189, "pares": [a, b, n, a, b, n, ...]} com a < b, em ordem de a e b.

Uso: python3 -I tools/gerar-conexoes.py
Rode de novo sempre que tools/gerar-referencias.py gerar as referências outra vez (o teste avisa se ficou velho).
"""
import collections, json, os, re

IDS = ["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB",
       "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP",
       "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI",
       "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"]
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "bible")
FONTE = "OpenBible.info (CC BY): referências com 3 votos ou mais, até 8 por versículo, juntadas por capítulo"

# Onde cada livro começa, na numeração de 0 a 1188
inicio, total = {}, 0
for livro in IDS:
    with open(os.path.join(RAIZ, "almeida", livro + ".json"), encoding="utf-8") as f:
        capitulos = len(json.load(f))
    inicio[livro] = (total, capitulos)
    total += capitulos

ALVO = re.compile(r"^([1-3]?[A-Z]{2,3})\.(\d+)\.\d+")
pares = collections.Counter()
for livro in IDS:
    with open(os.path.join(RAIZ, "referencias", livro + ".json"), encoding="utf-8") as f:
        por_versiculo = json.load(f)
    comeco = inicio[livro][0]
    for chave, destinos in por_versiculo.items():
        origem = comeco + int(chave.split(":")[0]) - 1
        for destino in destinos:
            m = ALVO.match(destino)
            if not m or m.group(1) not in inicio:
                continue
            base, quantos = inicio[m.group(1)]
            capitulo = int(m.group(2))
            if capitulo < 1 or capitulo > quantos:
                continue
            fim = base + capitulo - 1
            if fim != origem:
                pares[(min(origem, fim), max(origem, fim))] += 1

lista = []
for (a, b), n in sorted(pares.items()):
    lista += [a, b, min(n, 255)]
saida = os.path.join(RAIZ, "conexoes.json")
with open(saida, "w", encoding="utf-8") as f:
    json.dump({"versao": 1, "fonte": FONTE, "capitulos": total, "pares": lista}, f, ensure_ascii=False, separators=(",", ":"))
print(f"{len(pares)} ligações entre {total} capítulos → {os.path.relpath(saida)} ({os.path.getsize(saida) // 1024} kB)")
