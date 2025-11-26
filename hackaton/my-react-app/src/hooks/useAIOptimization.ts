import { useState } from 'react';
import type { Task } from '../types';

const API_URL = 'http://localhost:3001/api';

export interface OptimizationResult {
    tasks: Task[];
    dependencies: Array<{
        from: string;
        to: string;
        type: 'required' | 'recommended';
        reason: string;
    }>;
    parallelGroups: string[][];
    notes: string;
    bottlenecks: string[];
    improvements: string[];
    metadata: {
        optimizedAt: string;
        model: string;
        tasksCount: number;
    };
}

export interface OptimizationResponse {
    success: boolean;
    project: {
        id: string;
        tasks: Task[];
    };
    optimization: OptimizationResult;
}

export const useAIOptimization = () => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastOptimization, setLastOptimization] = useState<OptimizationResult | null>(null);

    /**
     * Optimise les tâches d'un projet avec l'IA
     */
    const optimizeProject = async (projectId: string, tasks: Task[]): Promise<OptimizationResponse | null> => {
        setIsOptimizing(true);
        setError(null);

        try {
            console.log('🤖 Envoi de la demande d\'optimisation pour le projet:', projectId);
            console.log('📋 Nombre de tâches à optimiser:', tasks.length);

            const response = await fetch(`${API_URL}/projects/${projectId}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tasks }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'optimisation');
            }

            const data: OptimizationResponse = await response.json();

            console.log('✅ Optimisation reçue:', data);

            setLastOptimization(data.optimization);
            return data;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            console.error('❌ Erreur lors de l\'optimisation:', errorMessage);
            setError(errorMessage);
            return null;
        } finally {
            setIsOptimizing(false);
        }
    };

    /**
     * Réinitialise l'état d'optimisation
     */
    const resetOptimization = () => {
        setLastOptimization(null);
        setError(null);
    };

    return {
        optimizeProject,
        isOptimizing,
        error,
        lastOptimization,
        resetOptimization,
    };
};
