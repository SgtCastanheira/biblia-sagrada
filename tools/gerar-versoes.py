"""
Monta as versões em português de licença livre embutidas no app (public/bible/<versão>/LIVRO.json),
a partir dos arquivos VPL do eBible.org (https://eBible.org/Scriptures/<id>_vpl.zip, já descompactados).
Atualiza public/bible/index.json com os livros de cada versão.

Também lê módulos da CrossWire já convertidos por sword-para-vpl.py (mesmo formato).

Uso: python3 -I gerar-versoes.py <pasta_com_as_pastas_do_ebible> public/bible
"""
import json, os, re, sys

src_dir, out_dir = sys.argv[1:3]

# id no eBible → id no app (veja src/app/core/versions.ts)
VERSIONS = {
    "porbr2018": "blivre",   # Bíblia Livre (CC BY 4.0)
    "poronbv": "nbv",        # Biblica® Open Nova Bíblia Viva (CC BY-SA 4.0)
    "porbrbsl": "bpm",       # Bíblia Portuguesa Mundial (domínio público)
    "porblt": "blt",         # Bíblia Livre Para Todos (CC BY-SA 4.0, só NT)
    # Da CrossWire (módulos SWORD convertidos com sword-para-vpl.py para <pasta>/<Nome>/<Nome>_vpl.txt)
    "PorNVA": "nva",         # Bíblia Nova Versão de Acesso Livre (CC BY-SA 4.0)
    "PorAlmeida1911": "alm1911",  # Almeida, reimpressão de 1911 (texto em domínio público; módulo sob GPL)
    # Em francês
    "fraLSG": "lsg",         # Louis Segond 1910 (domínio público)
}
# Fora de propósito: portft (Tradução para Tradutores) é uma ferramenta de tradução, cheia de colchetes e barras.

BOOKS = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL",
         "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"]
CHAPTERS = dict(zip(BOOKS, [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22]))

# Siglas do VPL que são diferentes das do app (as demais são iguais)
VPL_BOOKS = {"EZE": "EZK", "JOE": "JOL", "NAH": "NAM", "SOL": "SNG", "MAR": "MRK", "JOH": "JHN", "PHI": "PHP",
             "JAM": "JAS", "1JO": "1JN", "2JO": "2JN", "3JO": "3JN"}

LINE = re.compile(r"^(\S+) (\d+):(\d+) (.*)$")

index_path = os.path.join(out_dir, "index.json")
index = json.load(open(index_path, encoding="utf-8"))

for ebible_id, app_id in VERSIONS.items():
    source = os.path.join(src_dir, ebible_id, f"{ebible_id}_vpl.txt")
    if not os.path.exists(source):
        print(f"{app_id:8} pulada (sem {source}); os arquivos já gerados continuam")
        continue
    books = {}
    skipped = set()
    with open(source, encoding="utf-8-sig") as f:
        for raw in f:
            m = LINE.match(raw.rstrip("\n"))
            if not m:
                continue
            code, chapter, verse, text = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4)
            book = VPL_BOOKS.get(code, code)
            if book not in CHAPTERS:
                skipped.add(code)  # deuterocanônicos (a Bíblia Portuguesa Mundial os inclui)
                continue
            text = re.sub(r"```(usfm)?", "", text)           # restos de formatação no rascunho da BPM
            text = re.sub(r"\s+", " ", text).strip()
            text = re.sub(r"\s+([,;:.!?])", r"\1", text)     # "unigênito , para" → "unigênito, para"
            if not text:
                continue
            books.setdefault(book, {}).setdefault(chapter, []).append([verse, text])

    os.makedirs(os.path.join(out_dir, app_id), exist_ok=True)
    present = []
    for book in BOOKS:
        if book not in books:
            continue
        chapters = books[book]
        missing = [c for c in range(1, CHAPTERS[book] + 1) if c not in chapters]
        if missing:
            sys.exit(f"{app_id} {book}: faltam os capítulos {missing}")
        data = [sorted(chapters[c]) for c in range(1, CHAPTERS[book] + 1)]
        with open(os.path.join(out_dir, app_id, f"{book}.json"), "w", encoding="utf-8") as out:
            json.dump(data, out, ensure_ascii=False, separators=(",", ":"))
        present.append(book)
    index[app_id] = present
    verses = sum(len(v) for b in books.values() for v in b.values())
    print(f"{app_id:8} {len(present):2} livros  {verses:6} versículos" + (f"  (fora: {' '.join(sorted(skipped))})" if skipped else ""))

with open(index_path, "w", encoding="utf-8") as out:
    json.dump(index, out, ensure_ascii=False, separators=(",", ":"))
