"""Baixa todos os capítulos da Almeida (domínio público) de bible-api.com, respeitando o limite de requisições."""
import json, os, sys, time, urllib.request, urllib.error

BOOKS = [("GEN",50),("EXO",40),("LEV",27),("NUM",36),("DEU",34),("JOS",24),("JDG",21),("RUT",4),("1SA",31),("2SA",24),("1KI",22),("2KI",25),("1CH",29),("2CH",36),("EZR",10),("NEH",13),("EST",10),("JOB",42),("PSA",150),("PRO",31),("ECC",12),("SNG",8),("ISA",66),("JER",52),("LAM",5),("EZK",48),("DAN",12),("HOS",14),("JOL",3),("AMO",9),("OBA",1),("JON",4),("MIC",7),("NAM",3),("HAB",3),("ZEP",3),("HAG",2),("ZEC",14),("MAL",4),
("MAT",28),("MRK",16),("LUK",24),("JHN",21),("ACT",28),("ROM",16),("1CO",16),("2CO",13),("GAL",6),("EPH",6),("PHP",4),("COL",4),("1TH",5),("2TH",3),("1TI",6),("2TI",4),("TIT",3),("PHM",1),("HEB",13),("JAS",5),("1PE",5),("2PE",3),("1JN",5),("2JN",1),("3JN",1),("JUD",1),("REV",22)]
out = sys.argv[1]
total = sum(n for _, n in BOOKS); done = 0
for book, chapters in BOOKS:
    for c in range(1, chapters + 1):
        path = os.path.join(out, f"{book}-{c}.json")
        done += 1
        if os.path.exists(path):
            continue
        for attempt in range(8):
            try:
                with urllib.request.urlopen(f"https://bible-api.com/data/almeida/{book}/{c}", timeout=30) as r:
                    data = json.load(r)
                with open(path, "w", encoding="utf-8") as f:
                    json.dump([[v["verse"], v["text"]] for v in data["verses"]], f, ensure_ascii=False)
                break
            except Exception as e:
                wait = 35 if "429" in str(e) else 10
                print(f"{book} {c}: {e} — aguardando {wait}s", flush=True)
                time.sleep(wait)
        else:
            print(f"FALHOU {book} {c}", flush=True)
        if done % 50 == 0:
            print(f"{done}/{total}", flush=True)
        time.sleep(2.3)
print("CONCLUIDO", done, flush=True)
