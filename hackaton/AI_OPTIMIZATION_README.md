# 🚀 Système d'Optimisation de Workflow par IA

## 📋 Vue d'ensemble

Ce système permet d'optimiser automatiquement l'ordre d'exécution des tâches dans vos projets en utilisant l'intelligence artificielle. L'IA analyse les dépendances, identifie les opportunités de parallélisation et suggère des améliorations du workflow.

## ✨ Fonctionnalités

### 🤖 Optimisation Intelligente
- **Analyse des dépendances** : Détection automatique des relations entre tâches
- **Ordre optimal** : Suggestion d'un ordre d'exécution logique
- **Parallélisation** : Identification des tâches pouvant être exécutées simultanément
- **Goulots d'étranglement** : Détection des points de blocage potentiels

### 📊 Visualisation
- **Diagramme de flux** interactif avec React Flow
- **Trois modes de layout** : séquentiel, par département, par statut
- **Connexions animées** pour les tâches en cours
- **Panneau de résultats** avec analyse détaillée

### 🎯 Gestion de projets
- **Création/édition** de projets et tâches
- **Import JSON** pour charger des workflows existants
- **Renommage** automatique depuis le nom de fichier
- **Suppression** avec confirmation

## 🏗️ Architecture

```
hackaton/
├── backend/                      # API Node.js + Express
│   ├── services/
│   │   └── aiOptimization.js    # Service d'optimisation IA
│   ├── server.js                 # Serveur Express
│   ├── .env                      # Configuration (ne pas commiter)
│   └── .env.example              # Template de configuration
│
├── my-react-app/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowDiagram.tsx  # Vue diagramme avec bouton IA
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useAIOptimization.ts  # Hook pour l'API IA
│   │   └── types/
│   │       └── index.ts
│   └── package.json
│
└── AI_OPTIMIZATION_SETUP.md      # Documentation configuration IA
```

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- (Optionnel) Clé API d'un provider LLM

### 1. Cloner le repository

```bash
git clone <repository-url>
cd hackaton
```

### 2. Installer le backend

```bash
cd backend
npm install
```

### 3. Configurer l'IA (voir détails ci-dessous)

```bash
cp .env.example .env
# Éditer .env avec votre clé API
```

### 4. Installer le frontend

```bash
cd ../my-react-app
npm install
```

## ⚙️ Configuration de l'IA

### Option rapide : Mode de secours (sans clé API)

Le système fonctionne sans configuration ! Il utilisera un algorithme heuristique de base.

### Option recommandée : Mistral AI

1. **Créer un compte** : [console.mistral.ai](https://console.mistral.ai/)
2. **Obtenir une clé API**
3. **Configurer** :

```bash
cd backend
nano .env
```

```env
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=votre_clé_api_ici
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

### Autres providers supportés

- **HuggingFace** (gratuit avec rate limiting)
- **Ollama** (local, gratuit, nécessite installation)
- **OpenRouter** (accès à plusieurs modèles)

📚 Voir [AI_OPTIMIZATION_SETUP.md](./AI_OPTIMIZATION_SETUP.md) pour les détails complets.

## 🎮 Utilisation

### Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
➡️ Serveur sur http://localhost:3001

**Terminal 2 - Frontend :**
```bash
cd my-react-app
npm run dev
```
➡️ Application sur http://localhost:5173

### Utiliser l'optimisation IA

1. **Créer ou ouvrir un projet** avec des tâches
2. **Aller dans la vue "Diagramme Flow"**
3. **Cliquer sur "🤖 Optimiser avec l'IA"**
4. **Attendre quelques secondes** (analyse en cours)
5. **Consulter les résultats** dans le panneau qui s'ouvre

### Résultats fournis

- ✅ **Ordre optimisé** des tâches
- 🔗 **Dépendances** identifiées (requises/recommandées)
- ⚡ **Groupes parallélisables**
- ⚠️ **Goulots d'étranglement**
- 💡 **Suggestions d'amélioration**
- 📊 **Métadonnées** (modèle, date, nombre de tâches)

## 🧪 Tests

### Tester l'API d'optimisation

```bash
cd backend
./test-optimization.sh
```

Ce script teste l'endpoint d'optimisation et affiche les résultats formatés.

### Tester manuellement

```bash
curl -X POST http://localhost:3001/api/projects/1/optimize
```

## 📁 Format de données

### Import JSON

Vous pouvez importer des tâches au format JSON :

```json
[
  {
    "title": "Recevoir la commande",
    "description": "Réception et validation de la commande client",
    "status": "done",
    "department": "clients",
    "order": 0
  },
  {
    "title": "Classifier la pièce",
    "description": "Classification technique",
    "status": "in-progress",
    "department": "clients",
    "order": 1
  }
]
```

**Départements disponibles :**
- `clients` : Service client et commandes
- `logistics` : Logistique et gestion
- `services` : Services techniques

**Statuts disponibles :**
- `todo` : À faire
- `in-progress` : En cours
- `review` : En révision
- `done` : Terminé

## 🔌 API

### Endpoint d'optimisation

```
POST /api/projects/:id/optimize
```

**Réponse :**
```json
{
  "success": true,
  "project": { ... },
  "optimization": {
    "dependencies": [...],
    "parallelGroups": [...],
    "notes": "...",
    "bottlenecks": [...],
    "improvements": [...],
    "metadata": { ... }
  }
}
```

📚 Voir [backend/AI_API_DOCS.md](./backend/AI_API_DOCS.md) pour la documentation complète.

## 🎨 Personnalisation

### Modifier les couleurs des départements

`my-react-app/src/styles/FlowDiagram.css`

### Ajuster les paramètres IA

`backend/.env`
- `LLM_TEMPERATURE` : 0.0-1.0 (déterminisme vs créativité)
- `LLM_MAX_TOKENS` : Longueur de réponse
- `LLM_MODEL` : Modèle à utiliser

### Ajouter de nouveaux départements

1. Mettre à jour `my-react-app/src/types/index.ts`
2. Ajouter les couleurs dans `FlowDiagram.tsx`
3. Mettre à jour le prompt dans `backend/services/aiOptimization.js`

## 🐛 Dépannage

### L'optimisation ne fonctionne pas

1. **Vérifier que le backend est lancé** : http://localhost:3001/health
2. **Vérifier les logs** du serveur backend
3. **Tester l'API directement** avec `curl` ou `./test-optimization.sh`
4. **Vérifier le fichier .env** et la clé API

### Erreur "LLM_API_KEY non définie"

➡️ Créez le fichier `backend/.env` et ajoutez votre clé API
➡️ Ou utilisez le mode fallback (fonctionne sans clé)

### L'optimisation prend trop de temps

➡️ Utilisez `mistral-small` au lieu de `mistral-large`
➡️ Réduisez `LLM_MAX_TOKENS` à 1000
➡️ Limitez le nombre de tâches à optimiser

### Erreur CORS

➡️ Vérifiez que le backend utilise bien `cors()`
➡️ Vérifiez l'URL dans `my-react-app/src/hooks/useAIOptimization.ts`

## 📊 Performances

### Temps de réponse typiques
- **Mistral Small** : 2-5 secondes pour 10 tâches
- **Mode fallback** : < 100ms
- **Ollama local** : 5-15 secondes selon le hardware

### Coûts
- **Mistral Small** : ~$0.0002 par optimisation
- **HuggingFace** : Gratuit (rate limited)
- **Ollama** : Gratuit (ressources locales)

## 🔐 Sécurité

⚠️ **Important :**
- Ne commitez **JAMAIS** le fichier `.env`
- Utilisez des clés API avec permissions limitées
- Le `.env` est déjà dans `.gitignore`
- Renouvelez vos clés régulièrement

## 🚧 Limitations actuelles

- Maximum recommandé : **50 tâches** par projet
- **Pas de cache** des optimisations
- **Pas d'historique** des changements
- **Optimisation synchrone** (pas de queue)

## 🗺️ Roadmap

- [ ] Cache intelligent des optimisations
- [ ] Historique et comparaison avant/après
- [ ] Export au format Gantt/PERT
- [ ] Estimation de durée par l'IA
- [ ] Détection automatique des risques
- [ ] Suggestions de ressources
- [ ] Optimisation multi-projets
- [ ] Mode collaboratif temps réel

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation
- Ouvrez une issue sur GitHub
- Vérifiez les logs du serveur

---

**Fait avec ❤️ pour optimiser vos workflows**

Dernière mise à jour : 26 novembre 2025
