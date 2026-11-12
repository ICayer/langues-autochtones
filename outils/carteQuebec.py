# outils/carteQuebec.py
# Télécharge le contour du Québec (Natural Earth, domaine public) et écrit public/data/quebec.geojson
# Utilisation : python outils/carteQuebec.py
# 2627_langues_autochtones_Web · Isabel Cayer · Atelier Love & Code · 2026

import json, os, urllib.request
ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'public', 'data', 'quebec.geojson')

# Pour une version plus détaillée, remplacer 50m par 10m ; pour ajouter les provinces
# maritimes (D-06), ajouter leurs noms à PROVINCES.
URL = ('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/'
       'geojson/ne_50m_admin_1_states_provinces.geojson')
PROVINCES = ['Québec']
DECIMALES = 4   # environ 10 m : bien plus fin que ce que l'écran peut montrer

with urllib.request.urlopen(URL, timeout=60) as r:
    source = json.load(r)

def aire(anneau):  # aire signée (formule du lacet) : négative = sens horaire
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(anneau, anneau[1:])) / 2

def preparer(polygone):
    # D3 attend l'anneau extérieur en sens horaire et les trous en sens antihoraire
    sortie = []
    for i, anneau in enumerate(polygone):
        anneau = [[round(x, DECIMALES), round(y, DECIMALES)] for x, y in anneau]
        horaire = aire(anneau) < 0
        if horaire != (i == 0): anneau.reverse()
        sortie.append(anneau)
    return sortie

entites = []
for f in source['features']:
    nom = f['properties'].get('name')
    if nom not in PROVINCES: continue
    g = f['geometry']
    polygones = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    entites.append({'type': 'Feature', 'properties': {'nom': nom},
                    'geometry': {'type': 'MultiPolygon', 'coordinates': [preparer(p) for p in polygones]}})

manquantes = set(PROVINCES) - {e['properties']['nom'] for e in entites}
if manquantes: raise SystemExit(f'Introuvable dans Natural Earth : {manquantes}')

with open(SORTIE, 'w', encoding='utf-8') as h:
    json.dump({'type': 'FeatureCollection', 'features': entites}, h, ensure_ascii=False, separators=(',', ':'))
print(f'{SORTIE} : {len(entites)} entité(s), {os.path.getsize(SORTIE) / 1024:.1f} Ko')
