"""
Converte um módulo SWORD (CrossWire) para o formato VPL do eBible.org ("GEN 1:1 texto"),
para depois montar a versão com gerar-versoes.py.
Precisa do pysword (https://pypi.org/project/pysword, licença MIT), apontado pela pasta onde ele está.

Uso: python3 -I sword-para-vpl.py <pasta_do_pysword> <modulo.zip> <NomeDoModulo> <saida_vpl.txt>
"""
import re, sys

pysword_dir, module_zip, name, out_path = sys.argv[1:5]
sys.path.insert(0, pysword_dir)
from pysword.modules import SwordModules  # noqa: E402

# Nomes OSIS → siglas do app (USFM)
OSIS = {
    "Gen": "GEN", "Exod": "EXO", "Lev": "LEV", "Num": "NUM", "Deut": "DEU", "Josh": "JOS", "Judg": "JDG", "Ruth": "RUT",
    "1Sam": "1SA", "2Sam": "2SA", "1Kgs": "1KI", "2Kgs": "2KI", "1Chr": "1CH", "2Chr": "2CH", "Ezra": "EZR", "Neh": "NEH",
    "Esth": "EST", "Job": "JOB", "Ps": "PSA", "Prov": "PRO", "Eccl": "ECC", "Song": "SNG", "Isa": "ISA", "Jer": "JER",
    "Lam": "LAM", "Ezek": "EZK", "Dan": "DAN", "Hos": "HOS", "Joel": "JOL", "Amos": "AMO", "Obad": "OBA", "Jonah": "JON",
    "Mic": "MIC", "Nah": "NAM", "Hab": "HAB", "Zeph": "ZEP", "Hag": "HAG", "Zech": "ZEC", "Mal": "MAL",
    "Matt": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Rom": "ROM", "1Cor": "1CO", "2Cor": "2CO",
    "Gal": "GAL", "Eph": "EPH", "Phil": "PHP", "Col": "COL", "1Thess": "1TH", "2Thess": "2TH", "1Tim": "1TI", "2Tim": "2TI",
    "Titus": "TIT", "Phlm": "PHM", "Heb": "HEB", "Jas": "JAS", "1Pet": "1PE", "2Pet": "2PE", "1John": "1JN", "2John": "2JN",
    "3John": "3JN", "Jude": "JUD", "Rev": "REV",
}

modules = SwordModules(module_zip)
modules.parse_modules()
bible = modules.get_bible_from_module(name)
lines = 0
with open(out_path, "w", encoding="utf-8") as out:
    for testament in bible.get_structure().get_books().values():
        for book in testament:
            code = OSIS.get(book.osis_name)
            if not code:
                continue
            for chapter, count in enumerate(book.chapter_lengths, start=1):
                for verse in range(1, count + 1):
                    text = bible.get(books=[book.osis_name], chapters=[chapter], verses=[verse], clean=True, join="")
                    text = re.sub(r"\s+", " ", text or "").strip()
                    if text:
                        out.write(f"{code} {chapter}:{verse} {text}\n")
                        lines += 1
print(f"{name}: {lines} versículos")
