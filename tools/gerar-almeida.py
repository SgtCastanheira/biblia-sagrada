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
    ("1KI", 12, 28): ("fez doisvado e meio. ouro", "fez dois bezerros de ouro"),
    ("1KI", 18, 5): ("Pode ser ser que", "Pode ser que"),
    ("2KI", 10, 23): ("mas somente os adoradores de Baal. dom; porém não puderam.", "mas somente os adoradores de Baal."),
    ("NUM", 7, 66): ("príncipe filhos filhos de Dã", "príncipe dos filhos de Dã"),
    ("PSA", 42, 7): ("todas as tuas tuas ondas", "todas as tuas ondas"),
    ("JHN", 11, 15): ("para para que creiais", "para que creiais"),
    ("REV", 19, 12): ("ninguém sabia sabia senão", "ninguém sabia senão"),
    ("2CO", 8, 1): ("Mecedônia", "Macedônia"),
    ("1KI", 18, 39): ("O senhor é Deus! O Senhor é Deus!", "O Senhor é Deus! O Senhor é Deus!"),
    ("JDG", 10, 6): ("a fazer e que era mau", "a fazer o que era mau"),
    ("JDG", 11, 35): ("eu fiz, um voto", "eu fiz um voto"),
    ("JDG", 11, 40): (" Isso não é", ""),
    ("1SA", 3, 13): ("já lhe fiz: saber", "já lhe fiz saber"),
    ("ISA", 8, 20): ("A Lei e ao Testemunho! se eles", "À Lei e ao Testemunho! Se eles"),
    # 10/11/2026: erros de digitação achados ao conferir citações (Lucas, João, Mateus, Marcos e 2 Coríntios)
    ("LUK", 22, 46): ("Lenvantai-vos", "Levantai-vos"),
    ("JHN", 18, 3): ("com lanternas archotes e armas", "com lanternas, archotes e armas"),
    ("JHN", 18, 6): ("cairam por terra", "caíram por terra"),
    ("MAT", 26, 64): ("Repondeu-lhe Jesus", "Respondeu-lhe Jesus"),
    ("JHN", 19, 3): ("rei dos judeus! e e davam-lhe", "rei dos judeus! e davam-lhe"),
    ("JHN", 20, 25): ("ou outros discípulos", "os outros discípulos"),
    ("JHN", 19, 42): ("a vespera do sábado", "a véspera do sábado"),
    ("MRK", 15, 43): ("foi Pilatos e pediu", "foi a Pilatos e pediu"),
    ("LUK", 24, 20): ("autoridades e entregaram", "autoridades o entregaram"),
    ("2CO", 5, 21): ("Âquele que não conheceu", "Àquele que não conheceu"),
    ("JHN", 20, 23): ("Âqueles a quem perdoardes", "Àqueles a quem perdoardes"),
    ("MRK", 15, 32): ("e creiamos, Também", "e creiamos. Também"),
    # 12/11/2026: "do Deus" sem adjetivo é erro isolado da fonte; as outras seis versões em português do app dizem "Filho de Deus"
    # (o "do Deus" legítimo leva adjetivo: "do Deus vivo", "do Deus Altíssimo", "do Deus bendito", que ficam como estão)
    ("MAT", 26, 63): ("o Filho do Deus.", "o Filho de Deus."),
    # 12/11/2026: único "traido" sem acento da Almeida (Mc 14.21 e Lc 22.22 trazem "traído!"); aparece na fala de Jesus à ceia
    ("MAT", 26, 24): ("é traido!", "é traído!"),
    # 17/11/2026: varredura da Almeida inteira antes de gravar a Bíblia em áudio. A fonte digital tem trechos de OUTROS
    # versículos colados no fim ou no meio (resto da linha da página impressa) e versículos cortados. Onde bastou tirar o
    # pedaço estranho, só se tirou. Onde faltava texto, completou-se com a Almeida de 1911 (domínio público, a mesma do app em
    # `alm1911`), na ortografia de hoje: são os versículos marcados "COMPLETADO" abaixo, para o dono conferir na Bíblia impressa.
    # Um versículo pode ter uma lista de trocas.
    # --- pedaço estranho tirado (nada foi acrescentado)
    ("EXO", 39, 9): ("dobrado. f", "dobrado."),
    ("LEV", 9, 16): ("ordenança. rifício até o terceiro", "ordenança."),
    ("DEU", 8, 20): ("Deus. rovas, de sinais, de maravilhas, de peleja,", "Deus."),
    ("DEU", 22, 27): ("livrasse. em juizo, entre sangue", "livrasse."),
    ("1CH", 7, 19): ("Anião. que", "Anião."),
    ("1CH", 18, 10): ("de bronze. l", "de bronze."),
    ("NEH", 5, 9): ("10Também", "Também"),
    ("NUM", 3, 22): ("foram c contados", "foram contados"),
    ("ACT", 9, 19): ("disc!pulos", "discípulos"),
    ("1CH", 12, 7): ("Ged or", "Gedor"),
    # --- palavra repetida ou letra sobrando
    ("EXO", 9, 27): ("Moisés e e Arão", "Moisés e Arão"),
    ("EXO", 23, 31): ("até o o rio", "até o rio"),
    ("JDG", 3, 4): ("a fim de de por eles", "a fim de por eles"),
    ("1SA", 31, 2): ("Abinadabe e e a Malquisua", "Abinadabe e a Malquisua"),
    ("1KI", 11, 4): ("e e seu coração", "e seu coração"),
    ("1KI", 18, 5): ("todos os os animais", "todos os animais"),
    ("1CH", 10, 4): ("para que que não venham", "para que não venham"),
    ("1CH", 19, 19): [("paz cem Davi", "paz com Davi"), ("Davi, e e serviram", "Davi, e o serviram")],
    ("HAB", 1, 16): ("e e abundante", "e é abundante"),
    ("MAT", 13, 38): ("o o joio", "o joio"),
    ("JHN", 12, 25): ("odeia a a sua vida", "odeia a sua vida"),
    ("PHP", 3, 10): ("e a e a participação", "e a participação"),
    # --- palavra trocada por outra por falha de leitura (o contexto decide)
    ("GEN", 32, 18): ("atrás dé nos", "atrás de nós"),
    ("1KI", 10, 6): ("acerca des teus feitos", "acerca dos teus feitos"),
    ("ISA", 11, 14): ("ombros des filisteus", "ombros dos filisteus"),
    ("ISA", 16, 8): ("senhores des nações", "senhores das nações"),
    ("EXO", 14, 19): ("se pos atrás", "se pôs atrás"),
    ("1SA", 17, 25): ("Ao homem, pos, que", "Ao homem, pois, que"),
    ("JER", 40, 9): [("eles e pos seus homens", "eles e os seus homens"), ("bem vos erá", "bem vos será")],
    ("JER", 38, 2): ("a sa vida", "a sua vida"),
    ("ACT", 13, 25): ("que su sou", "que sou"),
    ("2CH", 12, 5): ("profeta, fei ter", "profeta, foi ter"),
    ("1KI", 20, 18): ("to-mai-os", "tomai-os"),
    ("JER", 1, 17): ("dem-lhes", "dize-lhes"),
    ("NUM", 16, 41): ("toda oa congregação", "toda a congregação"),
    ("1KI", 8, 9): ("fez u pacto", "fez um pacto"),
    ("2CH", 3, 13): ("para â camara", "para a câmara"),
    ("EXO", 13, 21): ("numa coluta e os dois para os guiar", "numa coluna de nuvem para os guiar"),
    ("MIC", 7, 10): ("cobrila-á", "cobri-la-á"),
    ("ZEC", 10, 10): ("trálos-ei", "trá-los-ei"),
    ("NUM", 31, 23): ("fálo-eis", "fá-lo-eis"),
    ("EXO", 17, 6): ("sairá agua", "sairá água"),
    ("ISA", 66, 19): ("a minba fama", "a minha fama"),
    ("LUK", 7, 28): ("no re medida com é maior", "no reino de Deus é maior"),
    ("JOB", 36, 5): ("a ninguém despre grande é", "a ninguém despreza; grande é"),
    ("ROM", 5, 15): ("abund muitos", "abundou sobre muitos"),
    ("NUM", 11, 27): ("etenho dado os levitas a Arão e a Eldade e Medade profetizaram",
                      "e o anunciou a Moisés, dizendo: Eldade e Medade profetizam"),
    ("MAT", 7, 23): ("claramemnte", "claramente"),
    # porem ("porém") nos versículos em que a fonte tirou o acento (em "para os porem" é o verbo pôr e fica)
    ("GEN", 17, 15): ("Sarai, porem Sara", "Sarai, porém Sara"),
    ("DEU", 28, 38): ("porem colherás", "porém colherás"),
    ("1SA", 17, 9): ("porem, se eu", "porém, se eu"),
    ("2SA", 18, 29): ("porem nao sei", "porém não sei"),
    ("PRO", 13, 9): ("porem a lâmpada", "porém a lâmpada"),
    ("JER", 38, 4): ("porem o seu mal", "porém o seu mal"),
    ("1CH", 16, 24): ("a sua gloria", "a sua glória"),
    # --- COMPLETADO: o texto da fonte estava cortado ou misturado com outro versículo; completado pela Almeida de 1911
    ("JOS", 13, 18): ("Jaza, Qa espada até serem consumidos, então todo o Israel", "Jaza, Quedemote, Mefaate,"),
    ("EXO", 26, 27): ("e cinco para as tábuas do outro lado do tabernáculo, bem como c6 azeite para a luz, especiarias para o óleo da unção e para o para o ocidente.",
                      "e cinco para as tábuas do outro lado do tabernáculo, e cinco para as tábuas do lado do tabernáculo, para o ocidente."),
    ("JDG", 1, 27): ("e suas virael aos levitas estas cidades e nem os de Ibleão", "e suas vilas, nem os de Dor e suas vilas, nem os de Ibleão"),
    ("JDG", 9, 4): ("ociosos e le9", "ociosos e levianos, que o seguiram."),
    ("1SA", 14, 7): ("eis-me aqcaustos e sacrifícios ao Senhor.", "eis-me aqui contigo, conforme o teu coração."),
    ("2SA", 18, 24): ("ao terraçorém, percebeu que seus servos cochichavam entre si, um homem que corria só.",
                      "ao terraço da porta, junto ao muro; e levantou os olhos, e olhou, e eis que um homem corria só."),
    ("1CH", 21, 17): [("E dissemorreram Saul e seus três filhos; morreu toda a sua o povo?", "E disse Davi a Deus: Não sou eu o que disse que se contasse o povo?"),
                      ("porem não contra", "porém não contra")],
    ("2CH", 6, 27): ("o b décima quarta a Jesebeabe, envia chuva", "o bom caminho em que andem, e envia chuva"),
    ("2CH", 33, 18): ("Deus de Israelram os seus altares e as suas imagens, e a Matã, sacerdote de", "Deus de Israel, eis que estão escritos nos atos dos reis de Israel."),
    ("GEN", 17, 10): ("todo varão dentre vugar para aquele que me", "todo varão dentre vós será circuncidado."),
    ("NUM", 2, 33): ("Os levicampo consagrado; a possessão dele será do sacerdote. foram contados entre os filhos de Israel.",
                     "Porém os levitas não foram contados entre os filhos de Israel, como o Senhor ordenara a Moisés."),
    ("EZK", 8, 17): ("Então me disse: Viste, filho do homem? Acaso é isto coisa le",
                     "Então me disse: Viste isto, filho do homem? Há porventura coisa mais leviana para a casa de Judá do que fazer tais abominações, que fazem aqui? Havendo enchido a terra de violência, tornam a irritar-me; porque eis que eles chegam o ramo ao nariz."),
    ("JER", 8, 11): ("filha de meu povo le23", "filha de meu povo levianamente, dizendo: Paz, paz; e não há paz."),
    ("1TI", 5, 11): ("quando se tornam le5", "quando se tornam lascivas contra Cristo, querem casar-se;"),
    ("2CO", 3, 13): ("filhos de Isra desvanecia;", "filhos de Israel não fitassem os olhos no fim do que desvanecia;"),
}

# Versículos que vieram VAZIOS da fonte (erro da fonte), completados pela Almeida de 1911 (domínio público) na ortografia de hoje.
VERSE_FILLS = {
    ("EZK", 8, 18): "Pelo que também eu usarei com eles de furor; o meu olho não poupará, nem me apiedarei; e, ainda que me gritem aos ouvidos com grande voz, contudo não os ouvirei.",
}

# Palavras que a fonte trouxe com erro de leitura (til, acento ou letra trocada) e que só têm uma correção possível. Valem para a
# palavra inteira, em qualquer versículo (só entrou aqui o que não existe como palavra no contexto: "sera" e "ate" aparecem só
# como "será" e "até"; "pos", "porem", "gloria" e outros que também são palavras certas ficaram em VERSE_FIXES, versículo a versículo).
# Palavras antigas que o dicionário de hoje não tem (alparcas, almugue, fressura, pragana, sovela, jarretar, entesar,
# escornear, ressicados, hóspeda, quebrantosso...) são da própria Almeida e NÃO entram aqui.
WORD_FIXES = {
    # til, cedilha e acento perdidos
    "abominaçao": "abominação", "abominãveis": "abomináveis", "abundancia": "abundância", "adorarãs": "adorarás",
    "adultéras": "adúlteras", "adversarios": "adversários", "afluiram": "afluíram", "agradavel": "agradável",
    "amaldiçõe": "amaldiçoe", "amaldições": "amaldiçoes", "aparencia": "aparência", "aquem": "a quem", "arietes": "aríetes",
    "aromàtico": "aromático", "aspero": "áspero", "assirios": "assírios", "atrio": "átrio", "bençao": "bênção",
    "cadaveres": "cadáveres", "cairam": "caíram", "caiste": "caíste", "calvicie": "calvície", "camara": "câmara",
    "cessarao": "cessarão", "ceus": "céus", "ciencia": "ciência", "circunferencia": "circunferência", "comerao": "comerão",
    "concluido": "concluído", "conduzí": "conduzi", "confusao": "confusão", "congregaçao": "congregação",
    "constituiram": "constituíram", "contribuido": "contribuído", "coraçao": "coração", "coraçào": "coração",
    "covados": "côvados", "crueis": "cruéis", "cãmaras": "câmaras", "declaraçoes": "declarações", "descobrí": "descobri",
    "designio": "desígnio", "destruiçao": "destruição", "diminuira": "diminuirá", "dira": "dirá", "diras": "dirás",
    "diràs": "dirás", "dissípa": "dissipa", "divisoes": "divisões", "donó": "dono", "dé": "de", "díze": "dize",
    "egipcio": "egípcio", "egipcios": "egípcios", "escarnio": "escárnio", "especie": "espécie", "esperavamos": "esperávamos",
    "espírituais": "espirituais", "espíritual": "espiritual", "estara": "estará", "estã": "está", "exercitos": "exércitos",
    "fara": "fará", "fôra": "fora", "habitarà": "habitará", "hebráica": "hebraica", "hà": "há", "hàbeis": "hábeis",
    "ignominia": "ignomínia", "impio": "ímpio", "impios": "ímpios", "impossivel": "impossível", "inquiriçao": "inquirição",
    "inumeraveis": "inumeráveis", "irmao": "irmão", "irmaos": "irmãos", "ja": "já", "juizes": "juízes", "jà": "já",
    "lascivia": "lascívia", "legivel": "legível", "longinquas": "longínquas", "mae": "mãe", "maos": "mãos",
    "maritimas": "marítimas", "materias": "matérias", "mes": "mês", "minhá": "minha", "minhã": "minha",
    "misericordia": "misericórdia", "misterio": "mistério", "miudas": "miúdas", "multiplos": "múltiplos",
    "murmuraçoes": "murmurações", "naçoes": "nações", "nao": "não", "naõ": "não", "nestê": "neste", "ninguem": "ninguém",
    "nossó": "nosso", "nào": "não", "nâo": "não", "olhavamos": "olhávamos", "ouvímo": "ouvimo", "paises": "países",
    "pe": "pé", "penhôres": "penhores", "penuria": "penúria", "peregrinaçoes": "peregrinações", "persuadí": "persuadi",
    "pes": "pés", "planicie": "planície", "po": "pó", "poras": "porás", "porãs": "porás", "possessao": "possessão",
    "possuira": "possuirá", "primicias": "primícias", "principe": "príncipe", "principes": "príncipes",
    "procuravamos": "procurávamos", "proposito": "propósito", "propria": "própria", "proprio": "próprio",
    "proprios": "próprios", "prostituira": "prostituíra", "prudencia": "prudência", "prudenté": "prudente", "quál": "qual",
    "raizes": "raízes", "relampagos": "relâmpagos", "repartirã": "repartirá", "ressurreiçao": "ressurreição",
    "reunam": "reúnam", "revestí": "revesti", "sacerdocio": "sacerdócio", "saido": "saído", "saira": "sairá",
    "santuario": "santuário", "santíssimá": "santíssima", "sao": "são", "seguí": "segui", "seras": "serás",
    "sidonios": "sidônios", "sángue": "sangue", "tabuas": "tábuas", "teú": "teu", "traiçõeiramente": "traiçoeiramente",
    "transgressao": "transgressão", "transgressoes": "transgressões", "travessoes": "travessões", "têrmo": "termo",
    "usareís": "usareis", "utensilios": "utensílios", "vao": "vão", "ve": "vê", "violencia": "violência", "viuvas": "viúvas",
    "vossã": "vossa", "vêde": "vede", "vóz": "voz", "àgua": "água", "ãgua": "água", "áteio": "átrio", "ía": "ia",
    "órfao": "órfão", "firâmo": "firamo", "agua": "água", "aguas": "águas", "arvore": "árvore", "ate": "até", "ceu": "céu",
    "descendencia": "descendência", "es": "os", "espirito": "espírito", "exercito": "exército", "exilio": "exílio",
    "familia": "família", "fieis": "fiéis", "fosseis": "fôsseis", "ha": "há", "juizo": "juízo", "juizos": "juízos",
    "lingua": "língua", "magoa": "mágoa", "mao": "mão", "memoria": "memória", "numero": "número", "perpetua": "perpétua",
    "refugio": "refúgio", "ruina": "ruína", "sacrificio": "sacrifício", "sacrificios": "sacrifícios", "sera": "será",
    "sirios": "sírios", "so": "só", "tambem": "também", "tera": "terá", "ultimas": "últimas", "varias": "várias", "vera": "verá",
    # letras trocadas, trocadas de lugar, sobrando ou faltando
    "aflingem": "afligem", "amedrontrará": "amedrontará", "aspacto": "aspecto", "arrraial": "arraial", "auro": "ouro",
    "betões": "botões", "brandavam": "bradavam", "cade": "cada", "caluna": "coluna", "camimho": "caminho",
    "captão": "capitão", "cemeçara": "começara", "certamnente": "certamente", "claramemnte": "claramente",
    "concerder": "conceder", "confudam": "confundam", "consfins": "confins", "contristrados": "contristados",
    "cosolados": "consolados", "cogregado": "congregado", "cogregação": "congregação", "conhececido": "conhecido",
    "danátema": "anátema", "dc": "de", "deitador": "deitado", "dereras": "deveras", "derruburem": "derrubarem",
    "derrumado": "derramado", "destrurei": "destruirei", "detráz": "detrás", "diza": "dizia", "duzentes": "duzentos",
    "elivais": "olivais", "encamado": "encarnado", "esculplda": "esculpida", "estederam": "estenderam",
    "estivese": "estivesse", "examiará": "examinará", "excuta": "executa", "fihos": "filhos", "filpios": "filhos",
    "fmatemo": "matemo", "frustar": "frustrar", "fuizeste": "fugiste", "furiram": "fugiram", "gereu": "gerou",
    "govenador": "governador", "guadardardes": "guardardes", "hbreu": "hebreu", "holocauto": "holocausto",
    "homems": "homens", "icenso": "incenso", "imimigo": "inimigo", "imimigos": "inimigos", "incedeia": "incendeia",
    "inclinão": "inclina o", "incurcunciso": "incircunciso", "iniquidode": "iniquidade", "instroções": "instruções",
    "instruçães": "instruções", "lenvantarás": "levantarás", "lovo": "louvo", "marar": "morar", "mensageem": "mensagem",
    "minba": "minha", "mulplicaste": "multiplicaste", "mundarás": "mudarás", "naites": "noites", "nibenitas": "rubenitas",
    "niguém": "ninguém", "nosos": "nossos", "nosssos": "nossos", "ouvigiu": "dirigiu", "ouvur": "ouvir",
    "paditas": "gaditas", "parcíficas": "pacíficas", "pederão": "poderão", "preperai": "preparai", "pricípio": "princípio",
    "primeras": "primeiras", "principamente": "principalmente", "profetuar": "profetizar", "prostiruindo": "prostituindo",
    "prícipe": "príncipe", "quebrantrado": "quebrantado", "razães": "razões", "respondende": "respondendo",
    "ressucitado": "ressuscitado", "ressucitou": "ressuscitou", "restiruirás": "restituirás", "resuritas": "gesuritas",
    "reveldada": "revelada", "sacerdete": "sacerdote", "sacerdetes": "sacerdotes", "sacrificdas": "sacrificadas",
    "sarcerdote": "sacerdote", "sebressaía": "sobressaía", "seginte": "seguinte", "serereos": "seremos", "sopo": "sopro",
    "tansgressões": "transgressões", "taus": "tais", "tedas": "todas", "temarás": "tomarás", "trezentes": "trezentos",
    "tsbuas": "tábuas", "ugar": "lugar", "ume": "uma", "vizinbos": "vizinhos", "zomabaria": "zombaria",
    "apartaivos": "apartai-vos", "apiedarme": "apiedar-me", "congregarvos": "congregar-vos", "deixame": "deixa-me",
    "devorálo": "devorá-lo", "enfadarte": "enfadar-te", "exaltarte": "exaltar-te", "lembrarte": "lembrar-te",
    "transformarse": "transformar-se", "apressapara": "apressa para",
    "cabera": "cabeça", "destrui": "destruí", "introduzí": "introduzi", "abstem": "abstém", "resppondeu": "respondeu",
    "tando": "tanto", "crêm": "creem", "cenáulo": "cenáculo", "proximo": "próximo", "ne": "no", "provincias": "províncias",
    "geraçoes": "gerações",
    # nomes e começos de frase
    "Altíssinuo": "Altíssimo", "Entao": "Então", "Nao": "Não", "Senhrr": "Senhor", "Senbor": "Senhor",
    "Jerusulém": "Jerusalém", "Jizrreel": "Jizreel", "Pergutaram": "Perguntaram", "Trambém": "Também",
    "Guardate": "Guarda-te", "Levantate": "Levanta-te", "Revestí": "Revesti", "Dà": "Dá", "Judà": "Judá", "Sabà": "Sabá",
    "Cairam": "Caíram", "Voê": "Vê", "Pedí": "Pedi", "Jeovã": "Jeová", "Âquele": "Àquele", "Â": "À", "Âs": "Às",
    "Acaía": "Acaia", "Acáia": "Acaia", "Cicília": "Cilícia", "Psídia": "Pisídia", "Josue": "Josué", "Isaias": "Isaías",
    "Libano": "Líbano", "Babilonia": "Babilônia", "Assiria": "Assíria", "Etiopia": "Etiópia", "Belem": "Belém",
    "Efraím": "Efraim", "Jerusalem": "Jerusalém", "Manasses": "Manassés", "Moises": "Moisés", "Poe": "Põe",
    "Samaria": "Samária", "Siquem": "Siquém", "Tambem": "Também", "Aquila": "Áquila", "Aquis": "Áquis", "Gibeao": "Gibeão",
    "Eliu": "Eliú", "Gibea": "Gibeá", "Jedutun": "Jedútun", "Jefone": "Jefoné", "Rabsaque": "Rabsaqué",
    "Refaias": "Refaías", "Amem": "Amém", "Justificerei": "Justificarei", "lbsão": "Ibsão", "lrã": "Irã", "lnútil": "Inútil",
    "tsrael": "Israel", "çrfãos": "Órfãos",
}
_WORDS = re.compile(r"(?<!\w)(" + "|".join(re.escape(k) for k in sorted(WORD_FIXES, key=len, reverse=True)) + r")(?!\w)")

def fix_words(text):
    new = _WORDS.sub(lambda m: WORD_FIXES[m.group(1)], text)
    if new != text:
        stats["palavra com erro de leitura corrigida"] += len(_WORDS.findall(text))
    return new

def fix_verse(book, chapter, verse, text):
    fix = VERSE_FIXES.get((book, chapter, verse))
    for wrong, right in ([fix] if isinstance(fix, tuple) else (fix or [])):
        if wrong in text:
            stats["erro de digitação corrigido"] += 1
            text = text.replace(wrong, right)
    if not text.strip():
        text = VERSE_FILLS.get((book, chapter, verse), text)
    return fix_words(text)

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
