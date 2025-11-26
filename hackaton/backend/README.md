# Backend - API de Gestion de Projets

API REST pour le système de gestion de projets.

## Installation

```bash
npm install
```

## Démarrage

```bash
# Mode production
npm start

# Mode développement (avec auto-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

## Endpoints API

### Projets

- `GET /api/projects` - Récupérer tous les projets
- `GET /api/projects/:id` - Récupérer un projet spécifique
- `POST /api/projects` - Créer un nouveau projet
- `PUT /api/projects/:id` - Mettre à jour un projet
- `DELETE /api/projects/:id` - Supprimer un projet

### Tâches

- `POST /api/projects/:id/tasks` - Ajouter une tâche à un projet
- `PUT /api/projects/:projectId/tasks/:taskId` - Mettre à jour une tâche
- `DELETE /api/projects/:projectId/tasks/:taskId` - Supprimer une tâche

### Statistiques

- `GET /api/stats` - Récupérer les statistiques globales

### Santé

- `GET /health` - Vérifier l'état du serveur

## Structure des données

### Projet
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "active|completed|on-hold",
  "createdAt": "ISO8601 string",
  "tasks": []
}
```

### Tâche
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "todo|in-progress|review|done",
  "department": "clients|logistics|services",
  "assignedTo": "string (optional)",
  "dueDate": "ISO8601 string (optional)",
  "createdAt": "ISO8601 string",
  "order": "number"
}
```

## Notes

- La base de données actuelle est en mémoire (les données sont perdues au redémarrage)
- Pour une production, il faudra connecter une vraie base de données (MongoDB, PostgreSQL, etc.)
- CORS est activé pour permettre les requêtes depuis le front-end
