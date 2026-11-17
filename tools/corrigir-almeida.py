"""
Aplica as correções de gerar-almeida.py (VERSE_FIXES, VERSE_FILLS e WORD_FIXES) aos arquivos da Almeida já gerados, sem baixar
a fonte de novo (o gerar-almeida.py aplica as mesmas listas quando a Almeida é gerada do zero). Só troca quando o texto errado
ainda está no versículo, então pode rodar mais de uma vez.
Uso: python3 -I tools/corrigir-almeida.py public/bible/almeida
"""
import ast, json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
source = open(os.path.join(here, "gerar-almeida.py"), encoding="utf-8").read()


def literal(name):
    return next(
        ast.literal_eval(node.value)
        for node in ast.parse(source).body
        if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") == name
    )


fixes, fills, words = literal("VERSE_FIXES"), literal("VERSE_FILLS"), literal("WORD_FIXES")
pattern = re.compile(r"(?<!\w)(" + "|".join(re.escape(k) for k in sorted(words, key=len, reverse=True)) + r")(?!\w)")

out_dir = sys.argv[1]
verses = word_swaps = 0
changed_books = 0
for name in sorted(os.listdir(out_dir)):
    if not name.endswith(".json"):
        continue
    book = name[:-5]
    path = os.path.join(out_dir, name)
    chapters = json.load(open(path, encoding="utf-8"))
    touched = False
    for c, rows in enumerate(chapters, start=1):
        for row in rows:
            text = row[1]
            fix = fixes.get((book, c, row[0]))
            for wrong, right in [fix] if isinstance(fix, tuple) else (fix or []):
                if wrong in text:
                    text = text.replace(wrong, right)
            if not text.strip():
                text = fills.get((book, c, row[0]), text)
            found = pattern.findall(text)
            if found:
                word_swaps += len(found)
                text = pattern.sub(lambda m: words[m.group(1)], text)
            if text != row[1]:
                print(f"{book} {c}.{row[0]}: corrigido")
                row[1] = text
                verses += 1
                touched = True
    if touched:
        changed_books += 1
        with open(path, "w", encoding="utf-8") as f:
            json.dump(chapters, f, ensure_ascii=False, separators=(",", ":"))
print(f"{verses} versículo(s) corrigido(s) em {changed_books} livro(s); {word_swaps} palavra(s) trocada(s) pela lista WORD_FIXES")
