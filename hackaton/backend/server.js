import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { optimizeTasks } from './services/aiOptimization.js';
import { loadManufacturingData, getManufacturingStats } from './services/dataTransformer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Charger les données depuis merged_json.json
let projects = [];
try {
    const manufacturingProject = loadManufacturingData();
    projects = [manufacturingProject];
    console.log('✅ Données manufacturing chargées avec succès');
    console.log(`📊 ${projects[0].tasks.length} postes de travail disponibles`);
} catch (error) {
    console.error('❌ Erreur lors du chargement des données manufacturing:', error);
    // Fallback sur des données par défaut si le chargement échoue
    projects = [
        {
            id: '1',
            name: 'Projet Airplus',
            description: 'Gestion des processus clients, logistique et services',
            status: 'active',
            createdAt: new Date().toISOString(),
            tasks: []
        }
    ];
}

// Routes

// GET - Récupérer tous les projets
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// GET - Récupérer un projet par ID
app.get('/api/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }
    res.json(project);
});

// POST - Créer un nouveau projet
app.post('/api/projects', (req, res) => {
    const newProject = {
        id: Date.now().toString(),
        name: req.body.name,
        description: req.body.description || '',
        status: req.body.status || 'active',
        createdAt: new Date().toISOString(),
        tasks: []
    };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// PUT - Mettre à jour un projet
app.put('/api/projects/:id', (req, res) => {
    const index = projects.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }

    projects[index] = {
        ...projects[index],
        ...req.body,
        id: req.params.id // Garder l'ID original
    };

    res.json(projects[index]);
});

// DELETE - Supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
    const index = projects.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }

    projects.splice(index, 1);
    res.status(204).send();
});

// POST - Ajouter une tâche à un projet
app.post('/api/projects/:id/tasks', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const newTask = {
        id: Date.now().toString(),
        title: req.body.title,
        description: req.body.description || '',
        status: req.body.status || 'todo',
        department: req.body.department,
        assignedTo: req.body.assignedTo,
        dueDate: req.body.dueDate,
        createdAt: new Date().toISOString(),
        order: req.body.order || project.tasks.length
    };

    project.tasks.push(newTask);
    res.status(201).json(newTask);
});

// PUT - Mettre à jour une tâche
app.put('/api/projects/:projectId/tasks/:taskId', (req, res) => {
    const project = projects.find(p => p.id === req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const taskIndex = project.tasks.findIndex(t => t.id === req.params.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    project.tasks[taskIndex] = {
        ...project.tasks[taskIndex],
        ...req.body,
        id: req.params.taskId
    };

    res.json(project.tasks[taskIndex]);
});

// DELETE - Supprimer une tâche
app.delete('/api/projects/:projectId/tasks/:taskId', (req, res) => {
    const project = projects.find(p => p.id === req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const taskIndex = project.tasks.findIndex(t => t.id === req.params.taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    project.tasks.splice(taskIndex, 1);
    res.status(204).send();
});

// POST - Optimiser les tâches d'un projet avec l'IA
app.post('/api/projects/:id/optimize', async (req, res) => {
    try {
        const { tasks } = req.body;
        const projectId = req.params.id;

        console.log(`📊 Optimisation demandée pour le projet ${projectId}`);
        console.log(`📋 Nombre de tâches: ${tasks?.length || 0}`);

        if (!tasks || tasks.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucune tâche à optimiser'
            });
        }

        const result = await optimizeTasks(tasks);

        console.log('✅ Optimisation réussie:', result.success ? 'Oui' : 'Non');

        // Créer la réponse avec le format attendu par le frontend
        const response = {
            success: true,
            project: {
                id: projectId,
                tasks: tasks // Pour l'instant on retourne les mêmes tâches
            },
            optimization: {
                tasks: tasks,
                dependencies: [],
                parallelGroups: result.parallelGroups || [],
                notes: result.suggestions?.join('\n') || 'Optimisation effectuée avec succès',
                bottlenecks: [],
                improvements: result.suggestions || [],
                metadata: {
                    optimizedAt: result.metadata?.timestamp || new Date().toISOString(),
                    model: result.metadata?.model || 'unknown',
                    tasksCount: tasks.length
                }
            }
        };

        res.json(response);
    } catch (error) {
        console.error('❌ Erreur lors de l\'optimisation:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            usedFallback: true
        });
    }
});

// GET - Statistiques globales
app.get('/api/stats', (req, res) => {
    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: projects.reduce((sum, p) => sum + p.tasks.length, 0),
        tasksByStatus: {
            todo: 0,
            inProgress: 0,
            review: 0,
            done: 0
        }
    };

    projects.forEach(project => {
        project.tasks.forEach(task => {
            switch (task.status) {
                case 'todo':
                    stats.tasksByStatus.todo++;
                    break;
                case 'in-progress':
                    stats.tasksByStatus.inProgress++;
                    break;
                case 'review':
                    stats.tasksByStatus.review++;
                    break;
                case 'done':
                    stats.tasksByStatus.done++;
                    break;
            }
        });
    });

    res.json(stats);
});

// GET - Statistiques manufacturing détaillées
app.get('/api/manufacturing/stats', (req, res) => {
    try {
        if (projects.length === 0) {
            return res.json({ error: 'Aucun projet disponible' });
        }

        const manufacturingProject = projects.find(p => p.id === 'airplus-manufacturing') || projects[0];
        const stats = getManufacturingStats(manufacturingProject);

        res.json(stats);
    } catch (error) {
        console.error('Erreur lors du calcul des stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});
