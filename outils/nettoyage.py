# outils/nettoyage.py
# Nettoie les CSV de outils/sources/ et écrit public/data/ (donnees.json, nations.csv, communautes.csv)
# Utilisation : python outils/nettoyage.py
# 2627_langues_autochtones_Web · Isabel Cayer · Atelier Love & Code · 2026

import csv, json, re
import os
ICI = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ICI, 'sources') + os.sep
SORTIE = os.path.join(ICI, '..', 'public', 'data') + os.sep
def lire(f):
    with open(SRC+f, encoding='utf-8', newline='') as h:
        return list(csv.DictReader(h))
def typo(s):  # espaces et apostrophes typographiques
    return re.sub(r"\s+", " ", s).strip().replace("'", "\u2019")

nations = lire('dp_nation_communaute_autochtone_-_langue.csv')
comms   = lire('dp_nation_communaute_autochtone_-_communaute.csv')
journal = []

# Langues : alignées sur le tableau validé par Catherine (Tableau_Nations_langues.docx) et l'affiche
LANGUE_REF = {'innu-aimun': 'Innu-aimun', "mi'kmaq / Mi'gmaq": 'Mi’gmaq / Mi’kmaq'}

out_n = []
for n in nations:
    nom = typo(n['nom_nation'])
    if nom != n['nom_nation']: journal.append(f"nation {n['id_nation']} : « {n['nom_nation']} » → « {nom} »")
    lg = LANGUE_REF.get(n['langue'], typo(n['langue']))
    if lg != n['langue']: journal.append(f"langue {n['id_nation']} : « {n['langue']} » → « {lg} »")
    out_n.append({'id_nation': int(n['id_nation']), 'nation': nom, 'langue': lg,
                  'bonjour_salut': typo(n['bonjout_salut']), 'merci': typo(n['merci']),
                  'population_nation': int(n['population_nation'])})
id_par_nom = {n['nation']: n['id_nation'] for n in out_n}

out_c = []
for c in comms:
    nation = typo(c['nation'])
    brut = typo(c['nom_communaute'])
    m = re.match(r"^(.*?)\s*\((.*)\)$", brut)
    nom, autre = (m.group(1), m.group(2)) if m else (brut, '')
    if brut != c['nom_communaute'] or autre:
        journal.append(f"communauté {c['id_communaute']} : « {c['nom_communaute']} » → nom « {nom} », autre_appellation « {autre} »")
    out_c.append({'id_communaute': int(c['id_communaute']), 'id_nation': id_par_nom[nation], 'nation': nation,
                  'nom_communaute': nom, 'autre_appellation': autre,
                  'longitude': float(c['longitude']), 'latitude': float(c['latitude']),
                  'population_communaute': int(c['population_communaute']), 'province': c['province'].strip()})

# Vérifications
verifs = []
for n in out_n:
    cs = [c for c in out_c if c['id_nation']==n['id_nation']]
    s = sum(c['population_communaute'] for c in cs)
    n['nb_communautes'] = len(cs)
    verifs.append((n['nation'], len(cs), n['population_nation'], s, 'OK' if s==n['population_nation'] else 'ÉCART'))
proches = []
for i,a in enumerate(out_c):
    for b in out_c[i+1:]:
        d = ((a['longitude']-b['longitude'])**2+(a['latitude']-b['latitude'])**2)**.5
        if d < 0.1: proches.append((a['nom_communaute'], b['nom_communaute'], round(d,3)))

def ecrire(f, rows):
    with open(SORTIE+f,'w',encoding='utf-8',newline='') as h:
        w=csv.DictWriter(h, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
ecrire('nations.csv', out_n); ecrire('communautes.csv', out_c)
json.dump({'nations':[{**n,'communautes':[c for c in out_c if c['id_nation']==n['id_nation']]} for n in out_n]},
          open(SORTIE+'donnees.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
print('\n'.join(journal)); print(); [print(v) for v in verifs]; print(proches)
print(len(out_c), sum(c['population_communaute'] for c in out_c))
