"""
Gera as referências cruzadas automáticas do leitor (public/bible/referencias/LIVRO.json)
a partir da base aberta da OpenBible.info (licença CC BY, https://www.openbible.info/labs/cross-references/).
Guarda, para cada versículo, os textos relacionados mais votados.
Uso: python3 -I tools/gerar-referencias.py <cross-references.zip> <pasta_saida>
"""
import collections, json, os, sys, zipfile

OSIS = ["Gen","Exod","Lev","Num","Deut","Josh","Judg","Ruth","1Sam","2Sam","1Kgs","2Kgs","1Chr","2Chr","Ezra","Neh","Esth","Job","Ps","Prov","Eccl","Song","Isa","Jer","Lam","Ezek","Dan","Hos","Joel","Amos","Obad","Jonah","Mic","Nah","Hab","Zeph","Hag","Zech","Mal",
        "Matt","Mark","Luke","John","Acts","Rom","1Cor","2Cor","Gal","Eph","Phil","Col","1Thess","2Thess","1Tim","2Tim","Titus","Phlm","Heb","Jas","1Pet","2Pet","1John","2John","3John","Jude","Rev"]
IDS = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL",
       "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"]
BOOK = dict(zip(OSIS, IDS))
PER_VERSE = 8      # no máximo, por versículo
MIN_VOTES = 3      # descarta relações com poucos votos

zip_path, out = sys.argv[1:3]
text = zipfile.ZipFile(zip_path).read("cross_references.txt").decode("utf-8")

def parse(ref):
    """'Rom.1.19-Rom.1.20' → ('ROM', 1, 19, 20); trechos entre capítulos ficam só com o início."""
    start, _, end = ref.partition("-")
    b, c, v = start.split(".")
    to = None
    if end:
        eb, ec, ev = end.split(".")
        if eb == b and ec == c:
            to = int(ev)
    return BOOK[b], int(c), int(v), to

refs = collections.defaultdict(list)
for line in text.splitlines()[1:]:
    parts = line.split("\t")
    if len(parts) < 3 or not parts[2].lstrip("-").isdigit():
        continue
    votes = int(parts[2])
    if votes < MIN_VOTES:
        continue
    try:
        fb, fc, fv, _ = parse(parts[0])
        tb, tc, tv, tt = parse(parts[1])
    except (KeyError, ValueError):
        continue
    target = f"{tb}.{tc}.{tv}" + (f"-{tt}" if tt and tt != tv else "")
    refs[(fb, fc, fv)].append((votes, target))

os.makedirs(out, exist_ok=True)
by_book = collections.defaultdict(dict)
for (b, c, v), items in refs.items():
    items.sort(key=lambda x: -x[0])
    by_book[b][f"{c}:{v}"] = [t for _, t in items[:PER_VERSE]]

total = 0
for b in IDS:
    path = os.path.join(out, f"{b}.json")
    json.dump(by_book.get(b, {}), open(path, "w", encoding="utf-8"), separators=(",", ":"))
    total += os.path.getsize(path)
print(f"versículos com referências: {sum(len(x) for x in by_book.values())} · {total/1024/1024:.2f} MB")
