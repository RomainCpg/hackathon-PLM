import { useState, useEffect } from 'react';
import type { Project, Task } from '../types';

const API_URL = 'http://localhost:3001/api';

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les projets
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/projects`);
            if (!response.ok) throw new Error('Erreur lors du chargement des projets');
            const data = await response.json();
            setProjects(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Créer un projet
    const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            });
            if (!response.ok) throw new Error('Erreur lors de la création du projet');
            const newProject = await response.json();
            setProjects(prev => [...prev, newProject]);
            return newProject;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    // Mettre à jour un projet
    const updateProject = async (id: string, updates: Partial<Project>) => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour du projet');
            const updatedProject = await response.json();
            setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
            return updatedProject;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    // Supprimer un projet
    const deleteProject = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression du projet');
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    // Ajouter une tâche
    const addTask = async (projectId: string, task: Omit<Task, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            if (!response.ok) throw new Error('Erreur lors de la création de la tâche');
            const newTask = await response.json();
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
            ));
            return newTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    // Mettre à jour une tâche
    const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
        try {
            const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour de la tâche');
            const updatedTask = await response.json();
            setProjects(prev => prev.map(p =>
                p.id === projectId
                    ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? updatedTask : t) }
                    : p
            ));
            return updatedTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    // Supprimer une tâche
    const deleteTask = async (projectId: string, taskId: string) => {
        try {
            const response = await fetch(`${API_URL}/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erreur lors de la suppression de la tâche');
            setProjects(prev => prev.map(p =>
                p.id === projectId
                    ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
                    : p
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            throw err;
        }
    };

    return {
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask
    };
};
