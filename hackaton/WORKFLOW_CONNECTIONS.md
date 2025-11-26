# 🔗 Connexions et Workflow Séquentiels

## ✨ Mise à Jour : Tâches Reliées par des Flèches !

Les tâches sont maintenant **automatiquement connectées dans l'ordre** avec des flèches directionnelles colorées, créant un véritable workflow visuel.

## 🎯 Fonctionnalités

### 🔗 Connexions Automatiques
- **Toutes les tâches sont reliées** dans l'ordre séquentiel
- **Flèches directionnelles** indiquant le sens du workflow
- **Couleurs par département** :
  - 🔵 Bleu : Tâches Clients
  - 🟠 Orange : Tâches Logistics
  - 🟢 Vert : Tâches Services

### ✨ Animations
- Les connexions vers les **tâches en cours** sont **animées**
- Effet de "flow" visuel pour identifier rapidement les tâches actives
- Animation fluide et non-intrusive

### 📐 3 Modes de Layout

#### 1. ➡️ Séquentiel (Recommandé)
**Vue linéaire du workflow complet**
- Toutes les tâches alignées de gauche à droite
- Ordre : Clients → Logistics → Services
- Parfait pour visualiser le processus complet
- Idéal pour les workflows linéaires

#### 2. 🏢 Par Département
**Vue par swimlanes**
- Chaque département sur une ligne horizontale
- Les tâches du même département reliées horizontalement
- Connexions entre départements
- Idéal pour identifier les responsabilités

#### 3. 📊 Par Statut
**Vue Kanban avec connexions**
- Colonnes : À faire, En cours, Révision, Terminé
- Connexions montrant la progression
- Idéal pour le suivi d'avancement

## 🎨 Apparence des Connexions

### Flèches
- **Type** : Smoothstep (coins arrondis)
- **Épaisseur** : 3px (4px au survol)
- **Pointe** : Flèche fermée large
- **Style** : Moderne et épuré

### Couleurs Intelligentes
Les couleurs des flèches suivent le département de la tâche **source** :
```
Clients    → Bleu (#2196f3)
Logistics  → Orange (#ff9800)
Services   → Vert (#4caf50)
```

### Animations
- **Quand** : Tâches avec statut "in-progress"
- **Style** : Tirets animés
- **Vitesse** : 0.8s par cycle
- **Direction** : Vers la cible

## 🚀 Utilisation

### Basculer entre les Layouts
1. Ouvrez la vue Diagramme Flow
2. Utilisez les boutons en haut :
   - **➡️ Séquentiel** : Workflow linéaire
   - **🏢 Par Département** : Groupé par équipe
   - **📊 Par Statut** : Colonnes Kanban

### Interagir avec le Diagramme
- **Survol** : Les flèches s'épaississent
- **Zoom** : Les connexions s'adaptent
- **Drag** : Déplacez les nœuds, les connexions suivent
- **Pan** : Naviguez dans le workflow complet

## 📋 Format JSON pour Connexions

Les connexions sont automatiques, mais l'ordre dépend des champs :

```json
[
  {
    "title": "Tâche 1",
    "department": "clients",
    "order": 0,           // ← Important pour l'ordre
    "status": "done"
  },
  {
    "title": "Tâche 2",
    "department": "clients",
    "order": 1,           // ← Suit la tâche 0
    "status": "in-progress"  // ← Sera animée
  },
  {
    "title": "Tâche 3",
    "department": "logistics",
    "order": 0,           // ← Premier de logistics
    "status": "todo"
  }
]
```

### Ordre de Connexion

**Mode Séquentiel :**
1. Tri par département (clients → logistics → services)
2. Puis par `order` au sein de chaque département
3. Connexions : Tâche N → Tâche N+1

**Mode Département :**
- Connexions au sein de chaque département uniquement
- Ordre déterminé par le champ `order`

**Mode Statut :**
- Connexions entre tâches du même statut
- Puis vers le statut suivant

## 🎯 Cas d'Usage

### Workflow Industriel
```
Réception → Classification → Révision → Validation → Production → Livraison
```

### Processus Client
```
Demande → Analyse → Devis → Approbation → Exécution → Facturation
```

### Pipeline DevOps
```
Code → Build → Test → Review → Deploy → Monitor
```

## 🎨 Personnalisation

### Changer les Couleurs
Dans `FlowDiagram.tsx` :
```typescript
const edgeColor = task.department === 'clients' ? '#2196f3' :
                 task.department === 'logistics' ? '#ff9800' :
                 task.department === 'services' ? '#4caf50' : '#999';
```

### Modifier le Type de Flèche
```typescript
type: 'smoothstep',  // Options: 'default', 'straight', 'step', 'smoothstep'
```

### Ajuster l'Animation
Dans `FlowDiagram.css` :
```css
.react-flow__edge.animated .react-flow__edge-path {
  stroke-dasharray: 8;           /* Longueur des tirets */
  animation: dashdraw 0.8s linear infinite;  /* Vitesse */
}
```

## 💡 Conseils

### Pour un Workflow Optimal
1. **Utilisez le champ `order`** pour contrôler la séquence
2. **Marquez les tâches actives** comme "in-progress" pour les animations
3. **Groupez logiquement** par département
4. **Mode Séquentiel** pour présenter le processus complet

### Pour de Gros Workflows
- Utilisez le **zoom** pour voir l'ensemble
- La **MiniMap** aide à naviguer
- Les **contrôles** permettent de recentrer
- **Drag & drop** pour réorganiser visuellement

## 🔍 Détails Techniques

### Algorithme de Connexion
```typescript
// 1. Trier les tâches selon le mode
const sortedTasks = tasks.sort((a, b) => {
  // Par département puis ordre
  return deptCompare(a, b) || orderCompare(a, b);
});

// 2. Relier séquentiellement
sortedTasks.forEach((task, i) => {
  if (i < sortedTasks.length - 1) {
    createEdge(task, sortedTasks[i + 1]);
  }
});
```

### Type de Nœud React Flow
```typescript
{
  id: string,
  source: string,       // ID de la tâche source
  target: string,       // ID de la tâche cible
  type: 'smoothstep',
  animated: boolean,
  style: { stroke, strokeWidth },
  markerEnd: { type, color, width, height }
}
```

## 📊 Comparaison des Modes

| Mode | Avantage | Cas d'Usage |
|------|----------|-------------|
| **Séquentiel** | Vue complète du processus | Workflows linéaires, présentations |
| **Département** | Responsabilités claires | Coordination d'équipes |
| **Statut** | Suivi de progression | Gestion quotidienne, sprints |

## 🎉 Résultat

Vous avez maintenant un **diagramme de workflow professionnel** avec :
- ✅ Connexions automatiques
- ✅ Flèches directionnelles colorées
- ✅ Animations pour les tâches actives
- ✅ 3 modes de visualisation
- ✅ Interactivité complète

**Votre workflow est maintenant visuellement clair et facile à suivre !** 🚀
