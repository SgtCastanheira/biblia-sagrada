"""
Aplica a lista VERSE_FIXES de gerar-almeida.py aos arquivos da Almeida já gerados, sem baixar a fonte de novo
(o gerar-almeida.py aplica a mesma lista quando a Almeida é gerada do zero). Só troca quando o texto errado
ainda está no versículo, então pode rodar mais de uma vez.
Uso: python3 -I tools/corrigir-almeida.py public/bible/almeida
"""
import ast, json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
source = open(os.path.join(here, "gerar-almeida.py"), encoding="utf-8").read()
fixes = next(
    ast.literal_eval(node.value)
    for node in ast.parse(source).body
    if isinstance(node, ast.Assign) and getattr(node.targets[0], "id", "") == "VERSE_FIXES"
)

out_dir = sys.argv[1]
changed = 0
for (book, chapter, verse), (wrong, right) in fixes.items():
    path = os.path.join(out_dir, f"{book}.json")
    chapters = json.load(open(path, encoding="utf-8"))
    for row in chapters[chapter - 1]:
        if row[0] == verse and wrong in row[1]:
            row[1] = row[1].replace(wrong, right)
            changed += 1
            with open(path, "w", encoding="utf-8") as f:
                json.dump(chapters, f, ensure_ascii=False, separators=(",", ":"))
            print(f"{book} {chapter}.{verse}: corrigido")
print(f"{changed} versículo(s) corrigido(s)")
