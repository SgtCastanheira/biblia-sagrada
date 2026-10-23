"""
Gera a geografia dos mapas (public/maps/<id>.json) a partir do Natural Earth (domínio público).
Lê ids e limites de src/app/core/maps.ts (e de atlas.ts e tribes.ts, na mesma pasta) e usa a mesma projeção do app.
Inclui as fronteiras atuais dos países (para comparar com as da época).
Uso: python3 -I gerar-mapas.py <maps.ts> <pasta_natural_earth> <pasta_saida>
"""
import json, math, os, re, sys

maps_ts, ne_dir, out_dir = sys.argv[1:4]
WIDTH = 1000
RIVERS = {"Nile", "Damietta Branch", "Rosetta Branch", "Jordan", "Euphrates", "Firat", "Al Furat", "Tigris", "Dicle",
          "Orontes", "Karkheh", "Shatt al Arab"}

src = open(maps_ts, encoding="utf-8").read()
# Mapas definidos fora de maps.ts: o atlas e a divisão da terra entre as tribos
for extra in ("atlas.ts", "tribes.ts"):
    path = os.path.join(os.path.dirname(maps_ts), extra)
    if os.path.exists(path):
        src += open(path, encoding="utf-8").read()
maps = [(m.group(1), [float(x) for x in m.group(2).split(",")])
        for m in re.finditer(r"id: '([^']+)',\s*title:[\s\S]*?bounds: \[([^\]]+)\]", src)]

def load(name):
    return json.load(open(os.path.join(ne_dir, name + ".geojson"), encoding="utf-8"))["features"]

land50, land10, lakes, rivers = load("ne_50m_land"), load("ne_10m_land"), load("ne_10m_lakes"), load("ne_10m_rivers_lake_centerlines")
borders = load("ne_50m_admin_0_boundary_lines_land")

def polygons(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    if geom["type"] == "MultiPolygon":
        return geom["coordinates"]
    return []

def lines(geom):
    if geom["type"] == "LineString":
        return [geom["coordinates"]]
    if geom["type"] == "MultiLineString":
        return geom["coordinates"]
    return []

def clip_ring(ring, box):
    """Sutherland–Hodgman: recorta um anel de polígono pelo retângulo."""
    x0, y0, x1, y1 = box
    edges = [(lambda p: p[0] >= x0, lambda a, b: (x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0]))),
             (lambda p: p[0] <= x1, lambda a, b: (x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0]))),
             (lambda p: p[1] >= y0, lambda a, b: (a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0)),
             (lambda p: p[1] <= y1, lambda a, b: (a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1))]
    pts = [tuple(p[:2]) for p in ring]
    for inside, cut in edges:
        if not pts:
            break
        res, prev = [], pts[-1]
        for cur in pts:
            if inside(cur):
                if not inside(prev):
                    res.append(cut(prev, cur))
                res.append(cur)
            elif inside(prev):
                res.append(cut(prev, cur))
            prev = cur
        pts = res
    return pts

def projector(bounds):
    lon0, lat0, lon1, lat1 = bounds
    cos = math.cos(math.radians((lat0 + lat1) / 2))
    k = WIDTH / ((lon1 - lon0) * cos)
    return lambda p: ((p[0] - lon0) * cos * k, (lat1 - p[1]) * k)

def path(points, proj, closed, min_dist=0.8):
    out, last = [], None
    for p in points:
        x, y = proj(p)
        if last and math.hypot(x - last[0], y - last[1]) < min_dist:
            continue
        out.append((x, y)); last = (x, y)
    if len(out) < (3 if closed else 2):
        return ""
    d = "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in out)
    return d + ("Z" if closed else "")

def bbox_hit(coords, box):
    xs = [c[0] for c in coords]; ys = [c[1] for c in coords]
    return not (max(xs) < box[0] or min(xs) > box[2] or max(ys) < box[1] or min(ys) > box[3])

os.makedirs(out_dir, exist_ok=True)
for map_id, bounds in maps:
    lon0, lat0, lon1, lat1 = bounds
    # Margem larga: no celular em pé a câmera mostra além dos limites do mapa
    mx, my = (lon1 - lon0) * 0.45, (lat1 - lat0) * 0.6
    box = (lon0 - mx, lat0 - my, lon1 + mx, lat1 + my)
    proj = projector(bounds)
    detailed = (lon1 - lon0) < 4
    result = {"land": "", "lakes": "", "rivers": [], "borders": []}

    for key, features in (("land", land10 if detailed else land50), ("lakes", lakes)):
        parts = []
        for f in features:
            for poly in polygons(f["geometry"]):
                for ring in poly:
                    if not bbox_hit(ring, box):
                        continue
                    d = path(clip_ring(ring, box), proj, True, 0.6 if detailed else 0.9)
                    if d:
                        parts.append(d)
        result[key] = "".join(parts)

    def add_lines(features, key, keep=lambda f: True):
        for f in features:
            if not keep(f):
                continue
            for line in lines(f["geometry"]):
                segment = []
                for p in line + [None]:
                    if p and box[0] <= p[0] <= box[2] and box[1] <= p[1] <= box[3]:
                        segment.append(p)
                    elif segment:
                        d = path(segment, proj, False, 0.6)
                        if d:
                            result[key].append(d)
                        segment = []

    add_lines(borders, "borders")
    add_lines(rivers, "rivers", lambda f: (f["properties"].get("name") or "") in RIVERS)

    target = os.path.join(out_dir, f"{map_id}.json")
    json.dump(result, open(target, "w", encoding="utf-8"), separators=(",", ":"))
    print(f"{map_id:28s} {os.path.getsize(target)/1024:6.1f} KB  rios: {len(result['rivers'])}  fronteiras: {len(result['borders'])}  {'(10m)' if detailed else '(50m)'}")
