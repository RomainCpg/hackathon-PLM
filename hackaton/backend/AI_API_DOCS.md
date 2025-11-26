# 🤖 API d'Optimisation IA - Documentation

## Endpoint

```
POST /api/projects/:id/optimize
```

Optimise l'ordre des tâches d'un projet en utilisant l'intelligence artificielle.

## Paramètres

### Path Parameters

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | string | ID du projet à optimiser |

## Réponse

### Succès (200 OK)

```json
{
  "success": true,
  "project": {
    "id": "1",
    "name": "Projet Airplus",
    "tasks": [
      {
        "id": "1",
        "title": "Recevoir la commande",
        "description": "Réception et validation",
        "status": "done",
        "department": "clients",
        "order": 0,
        "aiReasoning": "Cette tâche doit être la première car elle initialise le processus"
      }
    ]
  },
  "optimization": {
    "dependencies": [
      {
        "from": "task-1",
        "to": "task-2",
        "type": "required",
        "reason": "La classification nécessite d'avoir reçu la commande"
      }
    ],
    "parallelGroups": [
      ["task-3", "task-4"]
    ],
    "notes": "Optimisation basée sur l'analyse des dépendances logiques",
    "bottlenecks": [
      "Le service logistics pourrait devenir un goulot d'étranglement"
    ],
    "improvements": [
      "Considérer la parallélisation des tâches de validation",
      "Automatiser la classification des pièces standard"
    ],
    "metadata": {
      "optimizedAt": "2025-11-26T10:30:00.000Z",
      "model": "mistral-small",
      "tasksCount": 5
    }
  }
}
```

### Erreurs

#### 404 Not Found
```json
{
  "error": "Projet non trouvé"
}
```

#### 400 Bad Request
```json
{
  "error": "Le projet ne contient aucune tâche à optimiser"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Erreur lors de l'optimisation",
  "details": "Message d'erreur détaillé"
}
```

## Exemple d'utilisation

### JavaScript/TypeScript

```typescript
const optimizeProject = async (projectId: string) => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/projects/${projectId}/optimize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de l\'optimisation');
    }

    const data = await response.json();
    console.log('Optimisation réussie:', data);
    return data;
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### cURL

```bash
curl -X POST http://localhost:3001/api/projects/1/optimize \
  -H "Content-Type: application/json"
```

## Structure des données

### Task (Tâche)

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  department: 'clients' | 'logistics' | 'services';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  order: number;
  aiReasoning?: string; // Ajouté après optimisation
}
```

### Dependency (Dépendance)

```typescript
interface Dependency {
  from: string;        // ID de la tâche source
  to: string;          // ID de la tâche cible
  type: 'required' | 'recommended';
  reason: string;      // Explication de la dépendance
}
```

### OptimizationResult

```typescript
interface OptimizationResult {
  dependencies: Dependency[];
  parallelGroups: string[][];  // Groupes de tâches parallélisables
  notes: string;               // Notes générales
  bottlenecks: string[];       // Goulots d'étranglement identifiés
  improvements: string[];      // Suggestions d'amélioration
  metadata: {
    optimizedAt: string;       // ISO date
    model: string;             // Nom du modèle LLM utilisé
    tasksCount: number;        // Nombre de tâches optimisées
  };
}
```

## Fonctionnement interne

### 1. Récupération du projet
Le système récupère le projet et ses tâches depuis la base de données en mémoire.

### 2. Validation
- Vérifie que le projet existe
- Vérifie qu'il contient au moins une tâche

### 3. Analyse par IA
Le service AI analyse les tâches en considérant :
- **Titre et description** de chaque tâche
- **Département** assigné
- **Statut** actuel
- **Ordre** actuel

### 4. Génération du prompt
Un prompt structuré est généré avec :
- Liste des tâches
- Contexte des départements
- Instructions d'analyse
- Format de réponse attendu (JSON)

### 5. Appel au LLM
Le système appelle le modèle LLM configuré (Mistral, HuggingFace, etc.)

### 6. Traitement de la réponse
- Parse la réponse JSON
- Valide la structure
- Met à jour l'ordre des tâches
- Ajoute les métadonnées

### 7. Fallback
En cas d'erreur avec le LLM, un algorithme heuristique prend le relais :
- Tri par département : clients → logistics → services
- Maintien de l'ordre relatif dans chaque département

## Configuration requise

Voir [AI_OPTIMIZATION_SETUP.md](./AI_OPTIMIZATION_SETUP.md) pour la configuration complète.

### Variables d'environnement (.env)

```env
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=your_api_key_here
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
```

## Limites et considérations

### Performance
- **Temps de réponse** : 2-10 secondes selon le modèle et le nombre de tâches
- **Limite de tâches** : Recommandé jusqu'à 50 tâches par projet
- **Rate limiting** : Dépend du provider (Mistral : ~1000 req/min)

### Coût
- **Mistral Small** : ~$0.0002 par requête (très économique)
- **Ollama Local** : Gratuit mais nécessite des ressources locales
- **HuggingFace** : Gratuit avec rate limiting

### Qualité
La qualité de l'optimisation dépend de :
- **Descriptions des tâches** : Plus elles sont détaillées, mieux c'est
- **Cohérence du workflow** : Départements et statuts bien utilisés
- **Modèle LLM** : Modèles plus grands = meilleure analyse

## Cas d'usage

### 1. Nouveau projet
Après avoir importé des tâches depuis un fichier JSON, optimisez pour obtenir un ordre logique.

### 2. Réorganisation
Après avoir ajouté/modifié des tâches, réoptimisez pour ajuster l'ordre.

### 3. Analyse de workflow
Utilisez les suggestions d'amélioration pour identifier les optimisations possibles.

### 4. Documentation automatique
Les dépendances identifiées servent de documentation du workflow.

## Améliorations futures

- [ ] Cache des optimisations
- [ ] Historique des optimisations
- [ ] Comparaison avant/après
- [ ] Export des dépendances au format Gantt
- [ ] Estimation de durée par l'IA
- [ ] Détection des risques
- [ ] Suggestions de ressources
- [ ] Optimisation multi-projets

## Support

Pour tout problème ou question :
1. Vérifiez la configuration dans `.env`
2. Consultez les logs du serveur
3. Testez avec le mode fallback (sans clé API)
4. Vérifiez la documentation du provider LLM

---

Dernière mise à jour : 26 novembre 2025
