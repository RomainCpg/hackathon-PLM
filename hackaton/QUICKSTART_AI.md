# 🚀 Démarrage Rapide - Optimisation IA

Ce guide vous permet de tester l'optimisation IA en **moins de 5 minutes**.

## Option 1 : Mode démo (Sans clé API)

Le plus rapide ! Utilise un algorithme heuristique.

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd my-react-app
npm run dev
```

➡️ Ouvrir http://localhost:5173
➡️ Aller dans "Diagramme Flow"
➡️ Cliquer sur "🤖 Optimiser avec l'IA"

✅ **Ça marche !** (avec l'algorithme de secours)

---

## Option 2 : Avec Mistral AI (Recommandé)

Pour une vraie optimisation par IA (quelques minutes de config).

### Étape 1 : Obtenir une clé API

1. Aller sur https://console.mistral.ai/
2. Créer un compte (gratuit)
3. Aller dans "API Keys"
4. Créer une nouvelle clé et la copier

### Étape 2 : Configurer

```bash
cd backend
cp .env.example .env
nano .env  # ou votre éditeur préféré
```

Modifier le fichier `.env` :

```env
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=VOTRE_CLE_ICI
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

### Étape 3 : Démarrer

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../my-react-app
npm run dev
```

### Étape 4 : Tester

```bash
# Terminal 3 (optionnel) - Tester l'API directement
cd backend
./test-optimization.sh
```

✅ **Optimisation IA activée !**

---

## Option 3 : Ollama Local (Gratuit, Sans compte)

Pour une solution 100% locale et gratuite.

### Étape 1 : Installer Ollama

- **Mac** : Télécharger sur https://ollama.ai/
- **Linux** : `curl https://ollama.ai/install.sh | sh`
- **Windows** : Télécharger l'installeur

### Étape 2 : Télécharger un modèle

```bash
ollama pull mistral
```

### Étape 3 : Configurer

```bash
cd backend
nano .env
```

```env
LLM_API_URL=http://localhost:11434/api/generate
LLM_API_KEY=not_required
LLM_MODEL=mistral
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

### Étape 4 : Démarrer

```bash
# Ollama se lance automatiquement
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../my-react-app
npm run dev
```

✅ **IA locale fonctionnelle !**

---

## 🎯 Premiers pas dans l'application

1. **Créer un projet** : Cliquer sur "+" dans la sidebar
2. **Ajouter des tâches** : 
   - Manuellement avec le bouton "+"
   - Ou importer un JSON
3. **Passer en vue Flow** : Bouton "🔀 Diagramme Flow"
4. **Optimiser** : Bouton "🤖 Optimiser avec l'IA"
5. **Analyser les résultats** : Panneau qui s'ouvre à droite

## 📊 Exemple de JSON à importer

Créez un fichier `exemple-workflow.json` :

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
    "description": "Classification et catégorisation",
    "status": "in-progress",
    "department": "clients",
    "order": 1
  },
  {
    "title": "Réviser la pièce",
    "description": "Révision technique",
    "status": "todo",
    "department": "logistics",
    "order": 0
  },
  {
    "title": "Valider les specs",
    "description": "Validation des spécifications",
    "status": "todo",
    "department": "logistics",
    "order": 1
  },
  {
    "title": "Approuver la pièce",
    "description": "Approbation finale",
    "status": "todo",
    "department": "services",
    "order": 0
  }
]
```

Importez-le via le bouton "📁 Importer JSON".

## 🐛 Problèmes courants

### Le serveur backend ne démarre pas

```bash
# Vérifier les dépendances
cd backend
npm install
```

### Port déjà utilisé

```bash
# Tuer le processus
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Erreur avec la clé API

➡️ Vérifiez que vous avez bien copié la clé complète
➡️ Pas d'espaces au début/fin
➡️ La clé commence par `sk-` ou similaire

### L'optimisation ne change rien

➡️ Normal si les tâches sont déjà dans un ordre logique !
➡️ Consultez le panneau de résultats pour les suggestions

## 📚 Documentation complète

- **Configuration détaillée** : [AI_OPTIMIZATION_SETUP.md](./AI_OPTIMIZATION_SETUP.md)
- **Documentation API** : [backend/AI_API_DOCS.md](./backend/AI_API_DOCS.md)
- **README complet** : [AI_OPTIMIZATION_README.md](./AI_OPTIMIZATION_README.md)
- **Exemples de config** : [backend/LLM_CONFIG_EXAMPLES.js](./backend/LLM_CONFIG_EXAMPLES.js)

## 💡 Conseils pour de meilleurs résultats

1. **Descriptions détaillées** : Plus vos tâches sont décrites, mieux c'est
2. **Départements logiques** : Utilisez les bons départements
3. **Tâches atomiques** : Découpez les grosses tâches
4. **Contexte** : Ajoutez du contexte dans les descriptions

## 🎉 Prêt !

Vous êtes prêt à optimiser vos workflows avec l'IA !

Des questions ? Consultez la documentation complète.

---

**Bon workflow optimisé ! 🚀**
