import json

# Charger le fichier JSON
with open('/Users/noahassedou/Downloads/merged_json.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Trier les postes par numéro de poste (au cas où ils ne seraient pas ordonnés)
data.sort(key=lambda x: x['Poste'])

# Ajouter nextId à chaque poste
for i, poste in enumerate(data):
    if i < len(data) - 1:
        poste['nextId'] = data[i + 1]['Poste']
    else:
        poste['nextId'] = None  # Dernier poste, pas de suivant

# Sauvegarder le fichier modifié
with open('/Users/noahassedou/Downloads/merged_json_with_nextid.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Fichier sauvegardé avec les nextId ajoutés !")