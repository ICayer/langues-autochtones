# Les langues autochtones

Page Web interactive (scrollytelling) sur les 11 langues et les 55 communautés des Premiers Peuples au Québec.

Recherche et rédaction : Catherine A. Gagnon et Dorothée Dubé · Design et prototypage : Isabel Cayer, Atelier Love & Code

## Tester en local

Ouvrir le dossier dans VS Code et lancer un serveur local (extension Live Server). Les modules JavaScript ne fonctionnent pas en ouvrant index.html directement.

## Mettre à jour les données

Remplacer les CSV de `outils/sources/`, puis lancer `python outils/nettoyage.py`.

## Données

Contour du Québec : [Natural Earth](https://www.naturalearthdata.com/) (Admin 1 – States, Provinces, 1:50 m), domaine public. Pour le régénérer : `python outils/carteQuebec.py` (écrit `public/data/quebec.geojson`).

## Licence

Code : MIT (voir LICENSE). Textes et graphisme : à confirmer.
