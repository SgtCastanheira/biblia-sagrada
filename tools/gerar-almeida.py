"""
Monta os arquivos da Almeida embutidos no app (public/bible/almeida/LIVRO.json),
corrigindo caracteres corrompidos da fonte e atualizando a ortografia (Acordo de 1990).
Uso: python3 -I build_almeida.py <pasta_baixada> <pasta_saida>
"""
import collections, json, os, re, sys

BOOKS = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL",
         "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"]
CHAPTERS = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22]

stats = collections.Counter()

def sub(pattern, repl, text, label, flags=0):
    new, n = re.subn(pattern, repl, text, flags=flags)
    stats[label] += n
    return new

def keep_case(word, fixed):
    return fixed[0].upper() + fixed[1:] if word[0].isupper() else fixed

def clean(text):
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    # Letras maiúsculas acentuadas corrompidas na fonte ("ç rei" → "Ó rei", "ë tua" → "À tua")
    text = sub(r"(^|[\s“\"(—–-])ç(?=\s)", r"\1Ó", text, "corrompido: ç → Ó")
    text = sub(r"(^|[\s“\"(—–-])ë(?=\s)", r"\1À", text, "corrompido: ë → À")
    text = sub(r"(^|[\s“\"(—–-])ës(?=\s)", r"\1Às", text, "corrompido: ës → Às")
    # Demais letras corrompidas encontradas na varredura completa (corrigidas pelo contexto)
    for old, new, label in [
        ("åutico", "Êutico", "corrompido: å → Ê"), ("åubulo", "Êubulo", "corrompido: å → Ê"),
        ("èmega", "Ômega", "corrompido: è → Ô"), ("èco", "Oco", "corrompido: è → Ô"),
        ("îri", "Uri", "corrompido: î → U"), ("æru", "Iru", "corrompido: æ → I"),
        ("propùe", "propõe", "corrompido: ù → õ"), ("d‰ seus irmaos", "de seus irmãos", "corrompido: ‰"),
    ]:
        text = sub(re.escape(old), new, text, label)
    # Espaço indevido depois do hífen: "regozijai- vos" → "regozijai-vos", "Baal- Peor" → "Baal-Peor"
    text = sub(r"(\w)- (\w)", r"\1-\2", text, "hífen: espaço removido")
    # Acordo Ortográfico: sem trema
    text = sub(r"ü", "u", text, "trema removido")
    text = sub(r"Ü", "U", text, "trema removido")
    # Ditongos abertos em paroxítonas: Judéia → Judeia, jóia → joia
    text = sub(r"(\w)é(ia|ias|io|ios)\b", r"\1e\2", text, "acento éi/ói removido")
    text = sub(r"(\w)ó(ia|ias|io|ios)\b", r"\1o\2", text, "acento éi/ói removido")
    # vêem, lêem, crêem, dêem → veem, leem, creem, deem; vôo → voo
    for old, new in [("vêem", "veem"), ("lêem", "leem"), ("crêem", "creem"), ("dêem", "deem"), ("vôo", "voo"), ("enjôo", "enjoo")]:
        text = sub(rf"\b{old}\b", new, text, f"{old} → {new}")
        text = sub(rf"\b{old.capitalize()}\b", new.capitalize(), text, f"{old} → {new}")
    # Acentos diferenciais abolidos
    for old, new in [("pára", "para"), ("pêlo", "pelo"), ("pêlos", "pelos"), ("pólo", "polo")]:
        text = sub(rf"\b{old}\b", new, text, f"{old} → {new}")
    return text

# Erros de digitação da fonte em versículos específicos: (livro, capítulo, versículo) → (errado, certo)
VERSE_FIXES = {
    ("EXO", 3, 14): ("Assim dirás aos olhos de Israel", "Assim dirás aos filhos de Israel"),
    ("1SA", 1, 3): ("sacrificar ae Senhor dos exércites", "sacrificar ao Senhor dos exércitos"),
    ("1SA", 15, 2): ("ae subir ele", "ao subir ele"),
    ("1SA", 31, 4): ("Saul ae seu escudeiro", "Saul ao seu escudeiro"),
    ("JOS", 3, 5): ("Josué também ae povo", "Josué também ao povo"),
    ("ZEC", 14, 10): ("ae sul de Jerusalém", "ao sul de Jerusalém"),
    ("DAN", 5, 25): ("UFARSlM", "UFARSIM"),
    ("MRK", 7, 11): ("poderías", "poderias"),
    ("LUK", 16, 13): ("servir dois senhores; porque ou há de odiar a um e amar ao outro, o há de odiar a um e amar ao outro, o há de dedicar-se",
                      "servir a dois senhores; porque ou há de odiar a um e amar ao outro, ou há de dedicar-se"),
}

def fix_verse(book, chapter, verse, text):
    fix = VERSE_FIXES.get((book, chapter, verse))
    if fix and fix[0] in text:
        stats["erro de digitação corrigido"] += 1
        return text.replace(*fix)
    return text

def main(raw, out):
    os.makedirs(out, exist_ok=True)
    missing, verses_total, size = [], 0, 0
    for book, count in zip(BOOKS, CHAPTERS):
        chapters = []
        for c in range(1, count + 1):
            path = os.path.join(raw, f"{book}-{c}.json")
            if not os.path.exists(path):
                missing.append(f"{book} {c}")
                chapters.append([])
                continue
            data = json.load(open(path, encoding="utf-8"))
            chapters.append([[v, fix_verse(book, c, v, clean(t))] for v, t in data])
            verses_total += len(data)
        target = os.path.join(out, f"{book}.json")
        with open(target, "w", encoding="utf-8") as f:
            json.dump(chapters, f, ensure_ascii=False, separators=(",", ":"))
        size += os.path.getsize(target)
    # Índice lido pelo app: só livros completos entram (os demais continuam vindo da API)
    complete = [b for b, n in zip(BOOKS, CHAPTERS) if not any(m.startswith(b + " ") for m in missing)]
    index_path = os.path.join(os.path.dirname(out.rstrip("/")), "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump({"almeida": complete}, f, separators=(",", ":"))
    print(f"livros completos no índice: {len(complete)}/66")
    print(f"versículos: {verses_total} | tamanho: {size/1024/1024:.2f} MB | capítulos faltando: {len(missing)}")
    if missing:
        print("faltando:", ", ".join(missing[:10]), "…" if len(missing) > 10 else "")
    for label, n in stats.most_common():
        print(f"  {n:5d}  {label}")

main(sys.argv[1], sys.argv[2])
