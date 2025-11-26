#!/bin/bash

# 🔧 Assistant de configuration rapide pour l'API LLM
# Ce script vous aide à configurer votre clé API

echo "🤖 Assistant de Configuration LLM"
echo "================================="
echo ""

# Vérifier si le fichier .env existe
if [ -f ".env" ]; then
    echo "✓ Fichier .env trouvé"
    echo ""
    echo "Configuration actuelle:"
    echo "----------------------"
    cat .env | grep -v "^#" | grep -v "^$"
    echo ""
    read -p "Voulez-vous reconfigurer ? (y/N): " reconfigure
    if [ "$reconfigure" != "y" ] && [ "$reconfigure" != "Y" ]; then
        echo "Configuration conservée. Au revoir !"
        exit 0
    fi
else
    echo "⚠️  Aucun fichier .env trouvé"
fi

echo ""
echo "Quel provider LLM voulez-vous utiliser ?"
echo ""
echo "1) Mistral AI (Recommandé - Simple et économique)"
echo "2) HuggingFace (Gratuit avec limitations)"
echo "3) Ollama (Local - Gratuit)"
echo "4) OpenRouter (Multi-modèles)"
echo "5) OpenAI (Premium)"
echo "6) Mode Fallback (Pas de clé API, algorithme simple)"
echo ""
read -p "Votre choix (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Configuration Mistral AI"
        echo "========================"
        echo ""
        echo "1. Allez sur https://console.mistral.ai/"
        echo "2. Créez un compte (gratuit)"
        echo "3. Allez dans 'API Keys'"
        echo "4. Créez une nouvelle clé"
        echo ""
        read -p "Entrez votre clé API Mistral: " api_key
        
        cat > .env << EOF
# Configuration Mistral AI
LLM_API_URL=https://api.mistral.ai/v1/chat/completions
LLM_API_KEY=$api_key
LLM_MODEL=mistral-small
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
        echo ""
        echo "✅ Configuration Mistral AI créée !"
        ;;
        
    2)
        echo ""
        echo "Configuration HuggingFace"
        echo "========================="
        echo ""
        echo "1. Allez sur https://huggingface.co/"
        echo "2. Créez un compte"
        echo "3. Allez dans Settings > Access Tokens"
        echo "4. Créez un token avec permission 'read'"
        echo ""
        read -p "Entrez votre token HuggingFace: " api_key
        
        cat > .env << EOF
# Configuration HuggingFace
LLM_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
LLM_API_KEY=$api_key
LLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
        echo ""
        echo "✅ Configuration HuggingFace créée !"
        ;;
        
    3)
        echo ""
        echo "Configuration Ollama (Local)"
        echo "============================"
        echo ""
        echo "1. Téléchargez Ollama: https://ollama.ai/"
        echo "2. Installez l'application"
        echo "3. Téléchargez un modèle:"
        echo "   ollama pull mistral"
        echo ""
        read -p "Avez-vous installé Ollama et téléchargé un modèle ? (y/N): " installed
        
        if [ "$installed" = "y" ] || [ "$installed" = "Y" ]; then
            cat > .env << EOF
# Configuration Ollama (Local)
LLM_API_URL=http://localhost:11434/api/generate
LLM_API_KEY=not_required
LLM_MODEL=mistral
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
            echo ""
            echo "✅ Configuration Ollama créée !"
        else
            echo "Installez d'abord Ollama puis relancez ce script."
            exit 1
        fi
        ;;
        
    4)
        echo ""
        echo "Configuration OpenRouter"
        echo "========================"
        echo ""
        echo "1. Allez sur https://openrouter.ai/"
        echo "2. Créez un compte"
        echo "3. Ajoutez des crédits"
        echo "4. Créez une clé API"
        echo ""
        read -p "Entrez votre clé API OpenRouter: " api_key
        
        cat > .env << EOF
# Configuration OpenRouter
LLM_API_URL=https://openrouter.ai/api/v1/chat/completions
LLM_API_KEY=$api_key
LLM_MODEL=mistralai/mistral-7b-instruct
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
        echo ""
        echo "✅ Configuration OpenRouter créée !"
        ;;
        
    5)
        echo ""
        echo "Configuration OpenAI"
        echo "===================="
        echo ""
        echo "1. Allez sur https://platform.openai.com/"
        echo "2. Créez un compte"
        echo "3. Ajoutez des crédits"
        echo "4. Créez une clé API"
        echo ""
        read -p "Entrez votre clé API OpenAI: " api_key
        
        cat > .env << EOF
# Configuration OpenAI
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=$api_key
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
        echo ""
        echo "✅ Configuration OpenAI créée !"
        ;;
        
    6)
        echo ""
        echo "Mode Fallback"
        echo "============="
        echo ""
        echo "L'application utilisera un algorithme heuristique simple."
        echo "Aucune clé API n'est requise."
        echo ""
        
        cat > .env << EOF
# Mode Fallback (pas de LLM)
# Le système utilisera un algorithme heuristique
LLM_API_URL=
LLM_API_KEY=
LLM_MODEL=fallback
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000
EOF
        echo "✅ Configuration Fallback créée !"
        ;;
        
    *)
        echo "Choix invalide. Sortie."
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "Configuration terminée !"
echo "======================================"
echo ""
echo "Prochaines étapes:"
echo ""
echo "1. Démarrer le serveur:"
echo "   npm run dev"
echo ""
echo "2. Tester la configuration:"
echo "   ./test-optimization.sh"
echo ""
echo "3. Lancer l'application frontend dans un autre terminal"
echo ""
echo "Documentation complète: ../AI_OPTIMIZATION_SETUP.md"
echo ""
