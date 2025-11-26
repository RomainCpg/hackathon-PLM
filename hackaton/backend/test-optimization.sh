#!/bin/bash

# Script de test de l'optimisation IA
# Ce script teste l'endpoint d'optimisation sans avoir besoin du frontend

echo "🤖 Test de l'API d'optimisation IA"
echo "=================================="
echo ""

# Configuration
API_URL="http://localhost:3001"
PROJECT_ID="1"

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que le serveur est lancé
echo "📡 Vérification du serveur..."
if curl -s "${API_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Serveur accessible${NC}"
else
    echo -e "${RED}✗ Serveur non accessible. Démarrez-le avec: cd backend && npm run dev${NC}"
    exit 1
fi

echo ""
echo "🔍 Récupération du projet..."
PROJECT=$(curl -s "${API_URL}/api/projects/${PROJECT_ID}")

if [ -z "$PROJECT" ]; then
    echo -e "${RED}✗ Projet non trouvé${NC}"
    exit 1
fi

TASKS_COUNT=$(echo "$PROJECT" | jq '.tasks | length' 2>/dev/null || echo "?")
echo -e "${GREEN}✓ Projet trouvé avec ${TASKS_COUNT} tâches${NC}"

echo ""
echo "🤖 Lancement de l'optimisation IA..."
echo ""

# Appel de l'API d'optimisation
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/projects/${PROJECT_ID}/optimize")

# Séparer le body et le status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Optimisation réussie !${NC}"
    echo ""
    
    # Parser et afficher les résultats
    echo "📊 Résultats de l'optimisation:"
    echo "================================"
    
    MODEL=$(echo "$HTTP_BODY" | jq -r '.optimization.metadata.model')
    OPTIMIZED_AT=$(echo "$HTTP_BODY" | jq -r '.optimization.metadata.optimizedAt')
    NOTES=$(echo "$HTTP_BODY" | jq -r '.optimization.notes')
    
    echo -e "${YELLOW}Modèle utilisé:${NC} $MODEL"
    echo -e "${YELLOW}Date:${NC} $OPTIMIZED_AT"
    echo ""
    
    if [ "$NOTES" != "null" ] && [ -n "$NOTES" ]; then
        echo -e "${YELLOW}Notes:${NC}"
        echo "$NOTES"
        echo ""
    fi
    
    # Dépendances
    DEPS_COUNT=$(echo "$HTTP_BODY" | jq '.optimization.dependencies | length')
    if [ "$DEPS_COUNT" != "0" ] && [ "$DEPS_COUNT" != "null" ]; then
        echo -e "${YELLOW}🔗 Dépendances identifiées:${NC} $DEPS_COUNT"
        echo "$HTTP_BODY" | jq -r '.optimization.dependencies[] | "  • \(.type | ascii_upcase): \(.reason)"'
        echo ""
    fi
    
    # Groupes parallèles
    PARALLEL_COUNT=$(echo "$HTTP_BODY" | jq '.optimization.parallelGroups | length')
    if [ "$PARALLEL_COUNT" != "0" ] && [ "$PARALLEL_COUNT" != "null" ]; then
        echo -e "${YELLOW}⚡ Groupes parallélisables:${NC} $PARALLEL_COUNT"
        echo ""
    fi
    
    # Goulots d'étranglement
    BOTTLENECKS=$(echo "$HTTP_BODY" | jq -r '.optimization.bottlenecks[]?' 2>/dev/null)
    if [ -n "$BOTTLENECKS" ]; then
        echo -e "${RED}⚠️  Goulots d'étranglement:${NC}"
        echo "$BOTTLENECKS" | while read -r line; do
            echo "  • $line"
        done
        echo ""
    fi
    
    # Suggestions
    IMPROVEMENTS=$(echo "$HTTP_BODY" | jq -r '.optimization.improvements[]?' 2>/dev/null)
    if [ -n "$IMPROVEMENTS" ]; then
        echo -e "${GREEN}💡 Suggestions d'amélioration:${NC}"
        echo "$IMPROVEMENTS" | while read -r line; do
            echo "  • $line"
        done
        echo ""
    fi
    
    # Ordre optimisé des tâches
    echo -e "${YELLOW}📋 Ordre optimisé des tâches:${NC}"
    echo "$HTTP_BODY" | jq -r '.project.tasks | sort_by(.order) | .[] | "  \(.order + 1). [\(.department)] \(.title)"'
    
    echo ""
    echo -e "${GREEN}✅ Test terminé avec succès !${NC}"
    
else
    echo -e "${RED}✗ Erreur lors de l'optimisation (HTTP $HTTP_CODE)${NC}"
    echo ""
    echo "Réponse du serveur:"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
    
    if echo "$HTTP_BODY" | grep -q "LLM_API_KEY"; then
        echo ""
        echo -e "${YELLOW}💡 Conseil: Configurez votre clé API LLM dans backend/.env${NC}"
        echo "   Voir AI_OPTIMIZATION_SETUP.md pour plus d'informations"
    fi
    
    exit 1
fi
