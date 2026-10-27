"""
Baixa as fontes do Google Fonts para dentro do app (public/fonts) — offline desde a 1ª visita.
Licenças: Inter, Source Serif 4 e Lora (SIL OFL 1.1); Material Symbols (Apache 2.0).

Os ícones são baixados só com os nomes usados no código (bem menor que o pacote completo).
Rode de novo sempre que usar um ícone novo:  python3 tools/baixar-fontes.py
"""
import hashlib, pathlib, re, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0 Safari/537.36"
KEEP = {"latin", "latin-ext", "vietnamese"}  # português; "vietnamese" traz ẽ, ỹ e o til combinante das línguas indígenas (só baixa quando a página usa)


def icon_names():
    names = set()
    for f in [*ROOT.joinpath("src/app").rglob("*.ts"), *ROOT.joinpath("src/app").rglob("*.html")]:
        s = f.read_text(encoding="utf-8")
        names.update(re.findall(r"<mat-icon[^>]*>\s*([a-z0-9_]+)\s*</mat-icon>", s))
        for expr in re.findall(r"<mat-icon[^>]*>\s*\{\{(.*?)\}\}\s*</mat-icon>", s, re.S):
            names.update(re.findall(r"'([a-z0-9_]+)'", expr))
        names.update(re.findall(r"icon:\s*'([a-z0-9_]+)'", s))
        # Tabelas de ícones: export const ALGO_ICONS = { chave: 'nome_do_icone', ... }
        for table in re.findall(r"_ICONS[^=]*=\s*\{([^}]*)\}", s):
            names.update(re.findall(r":\s*'([a-z0-9_]+)'", table))
    return sorted(names)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


FAMILIES = [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap",
    "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap",
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.woff2"):
        old.unlink()
    icons = icon_names()
    urls = FAMILIES + [
        "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,200..400,0..1,0"
        f"&icon_names={','.join(icons)}&display=block"
    ]
    css_out, total = ["/* Gerado por tools/baixar-fontes.py — não edite à mão. */"], 0
    for url in urls:
        css = get(url).decode("utf-8")
        # Blocos @font-face, cada um precedido por um comentário com o subconjunto (/* latin */)
        for subset, block in re.findall(r"(?:/\*\s*([\w-]+)\s*\*/\s*)?(@font-face\s*\{[^}]+\})", css):
            if subset and subset not in KEEP:
                continue
            src = re.search(r"url\((https://[^)]+)\)", block).group(1)
            family = re.search(r"font-family:\s*'([^']+)'", block).group(1).lower().replace(" ", "-")
            name = f"{family}-{hashlib.sha1(src.encode()).hexdigest()[:10]}.woff2"
            data = get(src)
            (OUT / name).write_bytes(data)
            total += len(data)
            css_out.append(block.replace(src, name))
        # Regras extras da folha de ícones (ex.: .material-symbols-outlined { font-family; ligaduras… })
        css_out += [rule for rule in re.findall(r"(?<![@\w-])(\.[\w-]+\s*\{[^}]+\})", css)]
    (OUT / "fonts.css").write_text("\n".join(css_out) + "\n", encoding="utf-8")
    print(f"{len(icons)} ícones · {len(list(OUT.glob('*.woff2')))} arquivos de fonte · {total / 1024:.0f} KB")


main()
