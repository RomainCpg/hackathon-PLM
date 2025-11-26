import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Base de données en mémoire (à remplacer par une vraie DB plus tard)
let projects = [
    {
        id: '1',
        name: 'Projet Airplus',
        description: 'Gestion des processus clients, logistique et services',
        status: 'active',
        createdAt: new Date().toISOString(),
        tasks: [
            {
                id: '1',
                title: 'Recevoir la commande',
                description: 'Réception et validation de la commande client',
                status: 'done',
                department: 'clients',
                createdAt: new Date().toISOString(),
                order: 0
            },
            {
                id: '2',
                title: 'Classifier la pièce',
                description: 'Classification et catégorisation de la pièce',
                status: 'in-progress',
                department: 'clients',
                createdAt: new Date().toISOString(),
                order: 1
            },
            {
                id: '3',
                title: 'Réviser la pièce',
                description: 'Révision technique et validation des spécifications',
                status: 'todo',
                department: 'logistics',
                createdAt: new Date().toISOString(),
                order: 0
            }
        ]
    }
];

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
