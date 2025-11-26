# 🤖 Configuration de l'Optimisation IA

Ce document explique comment configurer l'optimisation des tâches par intelligence artificielle.

## 📋 Vue d'ensemble

Le système d'optimisation IA analyse vos tâches et suggère un ordre d'exécution optimal en tenant compte :
- Des dépendances logiques entre tâches
- Des départements impliqués
- Des possibilités de parallélisation
- Des goulots d'étranglement potentiels

## 🔑 Configuration de l'API LLM

### Option 1 : Mistral AI (Recommandé)

1. **Créer un compte** sur [Mistral AI](https://console.mistral.ai/)
2. **Obtenir une clé API** depuis le dashboard
3. **Configurer le backend** :

```bash
cd backend
cp .env.example .env
```

4. **Éditer le fichier `.env`** :

```env
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=votre_clé_api_mistral
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

**Modèles disponibles :**
- `mistral-small` : Rapide et économique (recommandé)
- `mistral-medium` : Plus puissant
- `mistral-large` : Le plus performant

### Option 2 : HuggingFace Inference API

1. **Créer un compte** sur [HuggingFace](https://huggingface.co/)
2. **Obtenir un token** depuis [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. **Configurer** :

```env
LLM_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
LLM_API_KEY=votre_token_huggingface
LLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

### Option 3 : Ollama (Local - Gratuit)

1. **Installer Ollama** : [ollama.ai](https://ollama.ai/)
2. **Télécharger un modèle** :
```bash
ollama pull mistral
```

3. **Configurer** :

```env
LLM_API_URL=http://localhost:11434/api/generate
LLM_API_KEY=not_required
LLM_MODEL=mistral
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

### Option 4 : OpenRouter (Accès à plusieurs modèles)

1. **Créer un compte** sur [OpenRouter](https://openrouter.ai/)
2. **Obtenir une clé API**
3. **Configurer** :

```env
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=votre_clé_openrouter
LLM_MODEL=mistralai/mistral-7b-instruct
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

## 🚀 Utilisation

1. **Démarrer le backend** :
```bash
cd backend
npm run dev
```

2. **Démarrer le frontend** :
```bash
cd my-react-app
npm run dev
```

3. **Dans l'application** :
   - Créez ou ouvrez un projet avec des tâches
   - Allez dans la vue "Diagramme Flow"
   - Cliquez sur le bouton **"🤖 Optimiser avec l'IA"**
   - Attendez l'analyse (quelques secondes)
   - Consultez les résultats dans le panneau qui s'ouvre

## 📊 Résultats de l'optimisation

L'IA vous fournira :

- **Ordre optimisé** : Nouvelle séquence des tâches
- **Dépendances** : Relations entre les tâches (requises ou recommandées)
- **Tâches parallélisables** : Groupes de tâches pouvant être exécutées simultanément
- **Goulots d'étranglement** : Points de blocage potentiels
- **Suggestions d'amélioration** : Recommandations pour optimiser le workflow

## 🛡️ Mode de secours

Si l'API LLM n'est pas configurée ou indisponible, le système utilise automatiquement un algorithme heuristique basé sur des règles :
- Organisation par département (clients → logistics → services)
- Tri par ordre de priorité
- Pas d'analyse avancée des dépendances

## 🔧 Paramètres avancés

### Température (0.0 - 1.0)
- **0.0 - 0.3** : Réponses déterministes et cohérentes (recommandé pour l'optimisation)
- **0.4 - 0.7** : Bon équilibre créativité/cohérence
- **0.8 - 1.0** : Plus créatif mais moins prévisible

### Max Tokens
- **1000-2000** : Suffisant pour des projets moyens
- **2000-4000** : Pour des projets complexes avec beaucoup de tâches

## 💡 Conseils

1. **Descriptions détaillées** : Plus vos tâches ont des descriptions précises, meilleure sera l'analyse
2. **Départements cohérents** : Utilisez les départements de manière logique
3. **Tâches atomiques** : Divisez les grandes tâches en petites tâches
4. **Itérations** : N'hésitez pas à réoptimiser après avoir ajouté/modifié des tâches

## 🐛 Dépannage

### Erreur : "LLM_API_KEY n'est pas définie"
➡️ Vérifiez que le fichier `.env` existe dans le dossier `backend` et contient votre clé API

### Erreur : "Erreur API LLM (401)"
➡️ Votre clé API est invalide ou expirée, générez-en une nouvelle

### Erreur : "Format de réponse LLM non reconnu"
➡️ Vérifiez que l'URL de l'API et le modèle sont corrects pour votre provider

### L'optimisation prend trop de temps
➡️ Utilisez un modèle plus petit (`mistral-small`) ou réduisez `LLM_MAX_TOKENS`

## 📚 Ressources

- [Documentation Mistral AI](https://docs.mistral.ai/)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference/)
- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [OpenRouter Documentation](https://openrouter.ai/docs)

## 🔒 Sécurité

⚠️ **Important** :
- Ne commitez JAMAIS votre fichier `.env` avec vos clés API
- Le fichier `.env` est déjà dans `.gitignore`
- Utilisez des clés API avec des permissions limitées
- Renouvelez vos clés régulièrement

---

Pour toute question ou problème, consultez la documentation de votre provider LLM ou créez une issue sur le repository.
