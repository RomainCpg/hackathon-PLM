/**
 * 🤖 Service d'optimisation des tâches par IA
 *
 * Ce fichier contient les configurations et exemples pour utiliser
 * différents providers LLM avec le système d'optimisation.
 */

// ============================================================================
// CONFIGURATION MISTRAL AI (Recommandé - Simple et économique)
// ============================================================================

/*
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=votre_clé_mistral_ici
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

AVANTAGES:
- Très rapide (2-5 secondes)
- Économique (~$0.0002 par requête)
- Excellente qualité d'analyse
- API simple et stable

MODÈLES DISPONIBLES:
- mistral-small: Rapide, économique (recommandé)
- mistral-medium: Plus puissant
- mistral-large: Maximum de performance

OBTENIR UNE CLÉ:
1. Aller sur https://console.mistral.ai/
2. Créer un compte
3. Aller dans "API Keys"
4. Créer une nouvelle clé
*/

// ============================================================================
// CONFIGURATION HUGGINGFACE (Gratuit avec limitations)
// ============================================================================

/*
LLM_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
LLM_API_KEY=votre_token_huggingface
LLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

AVANTAGES:
- Gratuit
- Pas de limite de budget
- Plusieurs modèles disponibles

INCONVÉNIENTS:
- Rate limiting strict
- Peut être lent (cold start)
- Moins stable que Mistral

OBTENIR UN TOKEN:
1. Aller sur https://huggingface.co/
2. Créer un compte
3. Aller dans Settings > Access Tokens
4. Créer un token avec permission "read"

MODÈLES RECOMMANDÉS:
- mistralai/Mistral-7B-Instruct-v0.2
- meta-llama/Llama-2-70b-chat-hf
- codellama/CodeLlama-34b-Instruct-hf
*/

// ============================================================================
// CONFIGURATION OLLAMA (Local - Gratuit - Pas de clé API)
// ============================================================================

/*
LLM_API_URL=http://localhost:11434/api/generate
LLM_API_KEY=not_required
LLM_MODEL=mistral
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

AVANTAGES:
- 100% gratuit
- Pas de limite
- Confidentialité totale (données locales)
- Pas besoin de clé API

INCONVÉNIENTS:
- Nécessite installation locale
- Utilise les ressources de votre machine
- Plus lent (5-15 secondes)

INSTALLATION:
1. Télécharger Ollama: https://ollama.ai/
2. Installer l'application
3. Télécharger un modèle:
   ollama pull mistral
   ollama pull llama2
   ollama pull codellama

4. Démarrer Ollama (automatique au boot)

MODÈLES DISPONIBLES:
- mistral (7B): Bon compromis
- llama2 (7B/13B/70B): Très bon
- codellama (7B/13B/34B): Spécialisé code
*/

// ============================================================================
// CONFIGURATION OPENROUTER (Accès multiple modèles)
// ============================================================================

/*
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=votre_clé_openrouter
LLM_MODEL=mistralai/mistral-7b-instruct
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

AVANTAGES:
- Accès à de nombreux modèles
- Bascule facile entre modèles
- Prix compétitifs

OBTENIR UNE CLÉ:
1. Aller sur https://openrouter.ai/
2. Créer un compte
3. Ajouter des crédits
4. Créer une clé API

MODÈLES POPULAIRES:
- mistralai/mistral-7b-instruct
- anthropic/claude-2
- openai/gpt-3.5-turbo
*/

// ============================================================================
// CONFIGURATION OPENAI (Alternative - Plus cher)
// ============================================================================

/*
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=votre_clé_openai
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

AVANTAGES:
- Très haute qualité
- API stable et documentée
- Rapide

INCONVÉNIENTS:
- Plus cher (~$0.002 par requête)
- Nécessite compte OpenAI

MODÈLES:
- gpt-3.5-turbo: Rapide et économique
- gpt-4: Meilleure qualité mais cher
*/

// ============================================================================
// PARAMÈTRES AVANCÉS
// ============================================================================

/*
TEMPÉRATURE (LLM_TEMPERATURE)
-----------------------------
Contrôle la créativité vs déterminisme

0.0 - 0.2: Ultra-déterministe
  - Réponses très cohérentes
  - Pas de créativité
  - Recommandé pour: Optimisation, analyse stricte

0.3 - 0.5: Équilibré (RECOMMANDÉ)
  - Bon compromis
  - Cohérence avec un peu de variation
  - Recommandé pour: Usage général

0.6 - 0.8: Créatif
  - Plus de variation
  - Peut proposer des solutions inattendues
  - Recommandé pour: Brainstorming, exploration

0.9 - 1.0: Très créatif
  - Réponses imprévisibles
  - Peut être incohérent
  - Pas recommandé pour l'optimisation

MAX TOKENS (LLM_MAX_TOKENS)
---------------------------
Limite la longueur de la réponse

500-1000: Pour des projets simples (< 10 tâches)
1000-2000: Usage standard (RECOMMANDÉ)
2000-4000: Projets complexes (> 30 tâches)
4000+: Très grands projets (attention au coût)

Note: Plus de tokens = coût plus élevé
*/

// ============================================================================
// TESTS ET DÉBOGAGE
// ============================================================================

/*
TESTER VOTRE CONFIGURATION
--------------------------

1. Vérifier le serveur:
   curl http://localhost:3001/health

2. Tester l'optimisation:
   ./test-optimization.sh

3. Voir les logs en temps réel:
   npm run dev

RÉSOLUTION DE PROBLÈMES
-----------------------

Erreur "LLM_API_KEY n'est pas définie":
➡️ Créez le fichier .env et ajoutez votre clé

Erreur 401 Unauthorized:
➡️ Votre clé API est invalide ou expirée

Erreur 429 Rate Limit:
➡️ Vous avez atteint la limite du provider
➡️ Attendez quelques minutes ou changez de provider

Réponse trop lente:
➡️ Utilisez un modèle plus petit (mistral-small)
➡️ Réduisez LLM_MAX_TOKENS
➡️ Considérez Ollama pour du local

Qualité insuffisante:
➡️ Augmentez LLM_MAX_TOKENS
➡️ Utilisez un modèle plus puissant
➡️ Améliorez les descriptions de tâches
*/

// ============================================================================
// SÉCURITÉ ET BONNES PRATIQUES
// ============================================================================

/*
✅ À FAIRE:
- Utiliser des variables d'environnement
- Ne jamais commiter le fichier .env
- Limiter les permissions de la clé API
- Monitorer l'usage et les coûts
- Renouveler les clés régulièrement

❌ À ÉVITER:
- Partager vos clés API
- Commiter les clés dans le code
- Utiliser des clés de production en dev
- Laisser des clés dans les logs
*/

// ============================================================================
// ESTIMATION DES COÛTS (à titre indicatif)
// ============================================================================

/*
PAR OPTIMISATION (10 tâches):

Mistral Small:     ~$0.0002  (très économique)
OpenAI GPT-3.5:    ~$0.002   (10x plus cher)
OpenAI GPT-4:      ~$0.02    (100x plus cher)
HuggingFace:       Gratuit   (rate limited)
Ollama:            Gratuit   (ressources locales)

POUR 1000 OPTIMISATIONS/MOIS:

Mistral Small:     ~$0.20
OpenAI GPT-3.5:    ~$2.00
OpenAI GPT-4:      ~$20.00
HuggingFace:       Gratuit
Ollama:            Gratuit
*/

// ============================================================================
// RECOMMANDATIONS SELON VOTRE CAS
// ============================================================================

/*
STARTUP / PETIT PROJET:
➡️ HuggingFace (gratuit) ou Mistral Small (très économique)

DÉVELOPPEMENT LOCAL:
➡️ Ollama (gratuit, confidentiel, pas de dépendance)

PRODUCTION À GRANDE ÉCHELLE:
➡️ Mistral AI (excellent rapport qualité/prix/rapidité)

BESOIN DE QUALITÉ MAXIMALE:
➡️ OpenAI GPT-4 (cher mais excellent)

PROTOTYPE / POC:
➡️ Mode fallback (pas de clé requise, heuristique simple)
*/

// ============================================================================
// SUPPORT ET DOCUMENTATION
// ============================================================================

/*
LIENS UTILES:

Mistral AI:
- Docs: https://docs.mistral.ai/
- Console: https://console.mistral.ai/

HuggingFace:
- Docs: https://huggingface.co/docs/api-inference/
- Models: https://huggingface.co/models

Ollama:
- Site: https://ollama.ai/
- GitHub: https://github.com/jmorganca/ollama
- Models: https://ollama.ai/library

OpenRouter:
- Site: https://openrouter.ai/
- Docs: https://openrouter.ai/docs

FICHIERS DE DOCUMENTATION DU PROJET:
- AI_OPTIMIZATION_README.md: Guide complet
- AI_OPTIMIZATION_SETUP.md: Configuration détaillée
- backend/AI_API_DOCS.md: Documentation API
*/
