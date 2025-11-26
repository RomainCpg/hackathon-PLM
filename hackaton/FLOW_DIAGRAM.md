# React Flow - Diagramme de Workflow

## 🎯 Nouvelle fonctionnalité ajoutée !

Vous pouvez maintenant visualiser vos tâches sous forme de **diagramme de flux interactif** en utilisant React Flow !

## 📁 Import de fichiers JSON

### Format attendu

Le système accepte des fichiers JSON avec des logs/tâches dans les formats suivants :

#### Format 1: Array simple
```json
[
  {
    "title": "Titre de la tâche",
    "description": "Description optionnelle",
    "status": "todo|in-progress|review|done",
    "department": "clients|logistics|services",
    "assignedTo": "Nom de la personne (optionnel)",
    "dueDate": "2025-12-31T00:00:00.000Z (optionnel)",
    "order": 0
  }
]
```

#### Format 2: Objet avec propriété tasks
```json
{
  "tasks": [
    { ... }
  ]
}
```

#### Format 3: Objet avec propriété logs
```json
{
  "logs": [
    { ... }
  ]
}
```

### Champs disponibles

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | ✅ | Titre de la tâche |
| `description` | string | ❌ | Description détaillée |
| `status` | string | ❌ | `todo`, `in-progress`, `review`, `done` (défaut: `todo`) |
| `department` | string | ❌ | `clients`, `logistics`, `services` (défaut: `clients`) |
| `assignedTo` | string | ❌ | Personne assignée |
| `dueDate` | string | ❌ | Date d'échéance (format ISO) |
| `order` | number | ❌ | Ordre d'affichage |
| `id` | string | ❌ | ID unique (généré automatiquement si absent) |

## 🚀 Utilisation

### 1. Basculer vers la vue Flow
Cliquez sur le bouton **"🔀 Diagramme Flow"** dans la barre de contrôle.

### 2. Importer des tâches depuis JSON
1. Cliquez sur **"📁 Importer JSON"**
2. Glissez-déposez votre fichier JSON ou cliquez pour sélectionner
3. Les tâches seront ajoutées au projet actuel

### 3. Visualiser le diagramme
- **Zoom** : Molette de la souris ou contrôles +/-
- **Déplacement** : Cliquez et glissez sur le fond
- **MiniMap** : Vue d'ensemble en bas à droite
- **Nœuds** : Déplacez les tâches individuellement

## 🎨 Couleurs des nœuds

Les nœuds sont colorés selon leur statut :
- 🔵 **À faire** (`todo`) : Bleu clair
- 🟠 **En cours** (`in-progress`) : Orange clair
- 🔴 **Révision** (`review`) : Rose
- 🟢 **Terminé** (`done`) : Vert clair

Les bordures sont colorées selon le département :
- 👥 **Clients** : Bleu
- 🚚 **Logistics** : Orange
- 🔧 **Services** : Vert

## 📂 Fichier exemple

Un fichier `example-logs.json` est fourni à la racine du projet avec un exemple complet.

## 🔄 Connexions automatiques

Les tâches du même département sont automatiquement connectées selon leur ordre. Les connexions sont **animées** pour les tâches en cours.

## 🛠️ Personnalisation

Vous pouvez modifier le layout et l'apparence dans :
- `/src/components/FlowDiagram.tsx` : Layout et positionnement
- `/src/components/TaskNode.tsx` : Apparence des nœuds
- `/src/styles/FlowNode.css` : Styles CSS des nœuds

## 📊 Fonctionnalités React Flow

- ✅ Drag & drop des nœuds
- ✅ Zoom et pan
- ✅ MiniMap
- ✅ Background avec grille
- ✅ Nœuds personnalisés
- ✅ Connexions animées
- ✅ Responsive

## 💡 Conseils

- Organisez vos logs par département pour un meilleur rendu visuel
- Utilisez le champ `order` pour contrôler l'ordre des connexions
- Les tâches avec le même statut et département seront groupées visuellement

Profitez de votre nouveau diagramme de workflow ! 🎉
