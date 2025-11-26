# 🎉 React Flow - Diagramme de Workflow Intégré !

## ✅ Fonctionnalités implémentées

### 1. Diagramme Flow Interactif 🔀
- **React Flow** intégré pour visualiser les workflows
- Nœuds personnalisés représentant les tâches
- Couleurs par statut et département
- Connexions automatiques entre tâches
- Animations pour les tâches en cours

### 2. Import de Fichiers JSON 📁
- Upload par drag & drop ou sélection de fichier
- Parsing automatique du JSON
- Support de plusieurs formats (array, {tasks}, {logs})
- Validation des données
- Messages d'erreur clairs

### 3. Toggle Vue Grille / Flow 📊
- Basculer entre vue grille classique et diagramme
- Boutons de contrôle intuitifs
- État conservé par projet
- Interface fluide

## 🎨 Composants créés

### TaskNode.tsx
Nœud personnalisé React Flow pour afficher une tâche :
- Header avec icônes de statut et département
- Corps avec titre et description
- Footer avec labels
- Couleurs dynamiques selon statut/département

### FlowDiagram.tsx
Composant principal du diagramme :
- Configuration React Flow
- Layout automatique des nœuds
- Création des connexions
- Background avec grille
- Controls (zoom, pan)
- MiniMap

### FileUpload.tsx
Composant d'upload de fichiers :
- Zone de drop drag & drop
- Validation du format JSON
- Parsing intelligent
- Conversion logs → tasks
- Exemple de format intégré

## 📂 Fichiers ajoutés

```
my-react-app/src/
├── components/
│   ├── FlowDiagram.tsx       # Diagramme React Flow
│   ├── TaskNode.tsx           # Nœud personnalisé
│   └── FileUpload.tsx         # Upload JSON
└── styles/
    ├── FlowDiagram.css
    ├── FlowNode.css
    └── FileUpload.css

example-logs.json              # Exemple de fichier à importer
FLOW_DIAGRAM.md               # Documentation détaillée
```

## 🚀 Comment utiliser

### 1. Basculer vers la vue Flow
Cliquez sur **"🔀 Diagramme Flow"** dans la barre de contrôle.

### 2. Visualiser le workflow
- Utilisez la molette pour zoomer
- Cliquez-glissez pour déplacer la vue
- Déplacez les nœuds individuellement
- Utilisez la MiniMap pour naviguer

### 3. Importer des tâches
1. Cliquez sur **"📁 Importer JSON"**
2. Glissez votre fichier `example-logs.json` ou sélectionnez-le
3. Les tâches sont ajoutées au projet
4. Elles apparaissent immédiatement dans le diagramme

## 📋 Format JSON

### Structure minimale
```json
[
  {
    "title": "Ma tâche",
    "status": "todo",
    "department": "clients"
  }
]
```

### Structure complète
```json
[
  {
    "id": "task-1",
    "title": "Recevoir commande",
    "description": "Réception et validation",
    "status": "done",
    "department": "clients",
    "assignedTo": "Jean Dupont",
    "dueDate": "2025-12-31T00:00:00.000Z",
    "order": 0
  }
]
```

### Valeurs possibles

**status:**
- `todo` - À faire
- `in-progress` - En cours
- `review` - En révision
- `done` - Terminé

**department:**
- `clients` - Département clients
- `logistics` - Département logistique
- `services` - Département services

## 🎨 Personnalisation

### Changer les couleurs
Modifiez `TaskNode.tsx` :
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo': return '#e3f2fd';  // Bleu clair
    case 'in-progress': return '#fff3e0';  // Orange
    // ...
  }
};
```

### Modifier le layout
Ajustez dans `FlowDiagram.tsx` :
```typescript
position: {
  x: statusIndex * 350 + 50,  // Espacement horizontal
  y: deptIndex * 200 + 50,    // Espacement vertical
}
```

### Changer les icônes
Dans `TaskNode.tsx` :
```typescript
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'todo': return '📋';
    case 'in-progress': return '⚙️';
    // ...
  }
};
```

## 🔧 Dépendances ajoutées

```json
{
  "dependencies": {
    "@xyflow/react": "^12.x.x"
  }
}
```

## 📊 Fonctionnalités React Flow utilisées

- ✅ Custom nodes
- ✅ Node dragging
- ✅ Zoom & pan
- ✅ Background
- ✅ Controls
- ✅ MiniMap
- ✅ Animated edges
- ✅ Node types
- ✅ Edge connections

## 🎯 Prochaines étapes

1. **Export diagramme** : Exporter en PNG/SVG
2. **Édition dans le flow** : Modifier les tâches directement
3. **Layouts automatiques** : Dagre, Elk, etc.
4. **Groupes de nœuds** : Grouper par département
5. **Handles personnalisés** : Points de connexion spécifiques
6. **Nœuds interactifs** : Actions sur click
7. **Historique des changements** : Undo/redo

## 🐛 Troubleshooting

### Le diagramme ne s'affiche pas
- Vérifiez que React Flow est installé : `npm list @xyflow/react`
- Vérifiez la console pour les erreurs

### Les tâches ne sont pas positionnées correctement
- Vérifiez le champ `order` dans vos données
- Ajustez les valeurs de position dans `FlowDiagram.tsx`

### L'import JSON échoue
- Vérifiez le format du JSON (doit être valide)
- Assurez-vous d'avoir au moins le champ `title`
- Consultez `example-logs.json` pour référence

## 📚 Ressources

- [React Flow Documentation](https://reactflow.dev/)
- [React Flow Examples](https://reactflow.dev/examples)
- [Custom Nodes Guide](https://reactflow.dev/learn/customization/custom-nodes)

---

**Félicitations ! Votre application de gestion de projets dispose maintenant d'un système de visualisation de workflow moderne et interactif !** 🎉
