import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Génère le prompt pour l'optimisation
 */
function generateOptimizationPrompt(tasks) {
    const tasksList = tasks.map((t, i) =>
        `${i + 1}. "${t.title || t.label}" (ID: ${t.id}, Département: ${t.department}, Statut: ${t.status}${t.dependencies?.length ? ', dépend de: ' + t.dependencies.join(', ') : ', aucune dépendance'})`
    ).join('\n');

    return `Analyse ces tâches d'un projet et propose un ordre optimal d'exécution en tenant compte des dépendances et des départements.

Tâches:
${tasksList}

Réponds UNIQUEMENT au format JSON suivant (sans texte supplémentaire):
{
  "optimizedOrder": ["id1", "id2", "id3", ...],
  "parallelGroups": [["id1", "id2"], ["id3"]],
  "criticalPath": ["id1", "id3"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;
}

/**
 * Parse la réponse de l'IA
 */
function parseAIResponse(aiResponse, tasks) {
    try {
        // Nettoyer la réponse (enlever les markdown code blocks si présents)
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(cleanResponse);

        return {
            optimizedOrder: parsed.optimizedOrder || tasks.map(t => t.id),
            parallelGroups: parsed.parallelGroups || [],
            criticalPath: parsed.criticalPath || [],
            suggestions: parsed.suggestions || []
        };
    } catch (error) {
        console.error('❌ Erreur de parsing de la réponse IA:', error);
        return {
            optimizedOrder: tasks.map(t => t.id),
            parallelGroups: [],
            criticalPath: [],
            suggestions: ['Erreur lors de l\'analyse de la réponse IA']
        };
    }
}

/**
 * Tri topologique pour le fallback
 */
function topologicalSort(tasks) {
    const graph = new Map();
    const inDegree = new Map();

    tasks.forEach(task => {
        graph.set(task.id, task.dependencies || []);
        inDegree.set(task.id, 0);
    });

    tasks.forEach(task => {
        (task.dependencies || []).forEach(dep => {
            inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        });
    });

    const queue = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const result = [];
    while (queue.length > 0) {
        const current = queue.shift();
        result.push(current);

        tasks.forEach(task => {
            if ((task.dependencies || []).includes(current)) {
                const newDegree = inDegree.get(task.id) - 1;
                inDegree.set(task.id, newDegree);
                if (newDegree === 0) queue.push(task.id);
            }
        });
    }

    return result.length === tasks.length ? result : tasks.map(t => t.id);
}

/**
 * Optimisation de secours (sans IA)
 */
function getFallbackOptimization(tasks) {
    console.log('🔄 Utilisation de l\'algorithme de secours (heuristique)');

    const optimizedOrder = topologicalSort(tasks);

    return {
        success: true,
        optimizedOrder,
        suggestions: [
            'Optimisation basée sur un algorithme heuristique (LLM non disponible)',
            'Configurez une clé API LLM pour des optimisations plus avancées'
        ],
        metadata: {
            model: 'heuristic-fallback',
            timestamp: new Date().toISOString(),
            tasksCount: tasks.length,
            usedFallback: true
        }
    };
}

/**
 * Fonction principale d'optimisation
 */
async function optimizeTasks(tasks) {
    const apiUrl = process.env.LLM_API_URL;
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;

    console.log('🔧 Configuration:');
    console.log('  URL:', apiUrl);
    console.log('  Model:', model);
    console.log('  API Key:', apiKey ? 'Configurée ✓' : 'Manquante ✗');

    if (!apiKey || !apiUrl) {
        console.warn('⚠️ LLM non configuré, utilisation du fallback');
        return getFallbackOptimization(tasks);
    }

    try {
        const prompt = generateOptimizationPrompt(tasks);

        console.log('📤 Envoi de la requête à Hugging Face...');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Tu es un expert en optimisation de processus industriels et gestion de projets. Tu analyses les tâches et leurs dépendances pour proposer un ordre optimal d\'exécution.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.3,
                max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur API:', response.status, errorText);
            throw new Error(`Erreur API: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Réponse reçue de l\'API');

        const aiResponse = data.choices[0].message.content;
        const parsedResult = parseAIResponse(aiResponse, tasks);

        return {
            success: true,
            optimizedOrder: parsedResult.optimizedOrder,
            suggestions: parsedResult.suggestions,
            metadata: {
                model: model,
                timestamp: new Date().toISOString(),
                tasksCount: tasks.length,
                usedFallback: false
            }
        };

    } catch (error) {
        console.error('❌ Erreur lors de l\'optimisation IA:', error.message);
        console.log('🔄 Utilisation du mode fallback');
        return getFallbackOptimization(tasks);
    }
}

// Export ES module
export { optimizeTasks };
